import logging
from textwrap import dedent
from typing import Any

from langchain_core.prompts import ChatPromptTemplate
from tenacity import retry, stop_after_attempt, wait_exponential

from app.llm_service import get_llm
from app.models.itinerary import ItineraryResponse
from app.prompts.itinerary_prompt import SYSTEM_PROMPT
from app.graph_state import GraphState

logger = logging.getLogger(__name__)

_PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            dedent(
                """\
                Destination: {destination}
                Country: {country}

                Budget: {budget}
                Duration: {duration}
                Travelers: {travelers}
                Trip Type: {trip_type}
                Travel Style: {travel_style}

                Preferences:
                {preferences}

                Special Requirements:
                {special_requirements}

                Weather Summary:
                {weather_summary}

                Verified Attractions:
                {verified_attractions}
                """
            ),
        ),
    ]
)

_LLM = get_llm()

_STRUCTURED_LLM = _LLM.with_structured_output(ItineraryResponse)

_CHAIN = _PROMPT | _STRUCTURED_LLM


@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
)
def _invoke_structured(payload: dict) -> ItineraryResponse:
    return _CHAIN.invoke(payload)


def itinerary_planner_agent(state: GraphState) -> dict[str, Any]:
    """
    Generate a day-wise itinerary for the selected destination.
    """

    destination = state.selected_destination

    # Temporary placeholders.
    # These will later be replaced with real tool calls.
    weather_summary = "Weather information not available."

    verified_attractions = (
        "Use the destination's most popular attractions."
    )

    payload = {
        "destination": destination.city,
        "country": destination.country,
        "budget": state.budget,
        "duration": state.duration,
        "travelers": state.travelers,
        "trip_type": state.trip_type.value,
        "travel_style": state.travel_style.value,
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
        "weather_summary": weather_summary,
        "verified_attractions": verified_attractions,
    }

    try:
        response = _invoke_structured(payload)
    except Exception:
        logger.exception("Itinerary generation failed")
        raise

    return {
        "weather_summary": weather_summary,
        "verified_attractions": verified_attractions,
        "itinerary": response.itinerary,
    }
