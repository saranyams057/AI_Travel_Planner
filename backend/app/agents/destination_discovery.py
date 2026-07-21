import logging
from textwrap import dedent
from typing import Any

from langchain_core.prompts import ChatPromptTemplate
from tenacity import retry, stop_after_attempt, wait_exponential

from app.llm_service import get_llm
from app.models.destination import DestinationDiscoveryResponse
from backend.app.prompts.destination_discovery_prompt import SYSTEM_PROMPT
from backend.app.tools import maps_tool
from backend.app.tools.image_tool import enrich_destinations, image_tool
from backend.app.travel.graph_state import GraphState

logger = logging.getLogger(__name__)

_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            dedent(
                """\
                Recommend destinations for the following trip.

                Budget: {budget}
                Origin: {origin}
                Trip Type: {trip_type}
                Travel Style: {travel_style}
                Duration: {duration}
                Travelers: {travelers}
                Preferences: {preferences}
                Special Requirements: {special_requirements}
                """
            ),
        ),
    ]
)

_LLM = get_llm()
_STRUCTURED_LLM = _LLM.with_structured_output(DestinationDiscoveryResponse)
_CHAIN = _PROMPT | _STRUCTURED_LLM


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
)
def _invoke_structured(payload: dict) -> DestinationDiscoveryResponse:
    return _CHAIN.invoke(payload)


def destination_discovery_agent(state: GraphState) -> dict[str, Any]:
    """
    Recommend destinations based on the user's travel preferences.
    """

    payload = {
        "budget": state.budget,
        "origin": state.origin,
        "trip_type": state.trip_type.value,
        "travel_style": state.travel_style.value,
        "duration": state.duration,
        "travelers": state.travelers,
        "preferences": (
            ", ".join(state.preferences)
            if state.preferences
            else "none specified"
        ),
        "special_requirements": (
            ", ".join(state.special_requirements)
            if state.special_requirements
            else "none specified"
        ),
    }

    try:
        response = _invoke_structured(payload)

        for destination in response.destinations:
            destination.image_url = image_tool(
                destination.city,
                destination.country,
            )

            destination.google_maps_url = maps_tool(
                destination.city,
                destination.country,
            )
    except Exception:
        logger.exception("Destination discovery failed")
        raise

    if not response.destinations:
        logger.warning("Destination discovery returned zero destinations")

    return {
        "destinations": response.destinations
        "selected_destination": response.destinations[0],
}
    