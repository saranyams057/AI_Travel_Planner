from typing import Annotated

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from backend.app.travel.models import (
    Accommodation,
    BudgetBreakdown,
    CurrencyInfo,
    DestinationContext,
    DestinationOption,
    EvaluationResult,
    Itinerary,
    TransportInfo,
    TripRequest,
    VerificationResult,
    VisaInfo,
    WeatherInfo,
)


def append_errors(current: list[str], new: list[str]) -> list[str]:
    """Reducer to accumulate errors."""
    return current + new


class TravelState(TypedDict):
    """
    Shared state passed between every LangGraph node.
    """

    # ======================================================
    # USER INPUT
    # ======================================================

    request: TripRequest

    # ======================================================
    # DESTINATION DISCOVERY
    # ======================================================

    destination_options: list[DestinationOption]

    destination_context: DestinationContext | None

    # ======================================================
    # TOOL OUTPUTS
    # ======================================================

    weather: WeatherInfo | None

    visa: VisaInfo | None

    currency: CurrencyInfo | None

    # ======================================================
    # PARALLEL AGENTS
    # ======================================================

    itinerary: Itinerary | None

    accommodations: list[Accommodation]

    transport: list[TransportInfo]

    # ======================================================
    # BUDGET
    # ======================================================

    budget: BudgetBreakdown | None

    # ======================================================
    # VALIDATION
    # ======================================================

    verification: VerificationResult | None

    evaluation: EvaluationResult | None

    # ======================================================
    # CHATBOT
    # ======================================================

    chat_history: Annotated[list[BaseMessage], add_messages]

    # ======================================================
    # EXECUTION
    # ======================================================

    current_step: str

    errors: Annotated[list[str], append_errors]