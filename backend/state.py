from typing import TypedDict, List, Optional, Any

class TravelState(TypedDict):
    # User Inputs
    user_input: dict
    mode: str  # "explore" or "plan"

    # Agent Outputs
    destinations: Optional[list]
    itinerary: Optional[dict]
    transport_hotels: Optional[dict]
    budget: Optional[dict]
    weather: Optional[dict]
    visa_info: Optional[dict]

    # Orchestrator Final Output
    overview: Optional[dict]
    precautions: Optional[dict]

    # Verification
    verification_passed: bool
    verification_flags: Optional[list]
    retry_count: int

    # Error tracking
    error: Optional[str]
