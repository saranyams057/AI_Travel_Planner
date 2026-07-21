from datetime import date
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field, HttpUrl, model_validator


# ==========================================================
# ENUMS
# ==========================================================

class WorkflowType(str, Enum):
    EXPLORE = "explore"
    PLAN = "plan"


class TravelStyle(str, Enum):
    """Spending tier. Replaces the old separate TravelStyle/BudgetCategory
    pair -- they encoded the same concept twice and invited the two to
    drift out of sync."""
    BUDGET = "budget"
    STANDARD = "standard"
    LUXURY = "luxury"


class TripType(str, Enum):
    SOLO = "solo"
    COUPLE = "couple"
    FAMILY = "family"
    FRIENDS = "friends"
    BUSINESS = "business"


class AccommodationType(str, Enum):
    HOTEL = "hotel"
    HOSTEL = "hostel"
    RESORT = "resort"
    APARTMENT = "apartment"
    HOMESTAY = "homestay"


class TransportMode(str, Enum):
    FLIGHT = "flight"
    TRAIN = "train"
    BUS = "bus"
    CAR = "car"


# ==========================================================
# USER REQUEST
# ==========================================================

class TripRequest(BaseModel):
    workflow: WorkflowType

    origin: Optional[str] = None
    destination: Optional[str] = None

    travelers: int = Field(ge=1, le=20)
    days: int = Field(ge=1, le=60)

    budget: float = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)

    travel_style: TravelStyle = TravelStyle.STANDARD
    trip_type: TripType = TripType.SOLO

    start_date: Optional[date] = None

    preferences: list[str] = Field(default_factory=list)
    special_requirements: Optional[str] = None

    @model_validator(mode="after")
    def check_destination_for_plan_workflow(self) -> "TripRequest":
        if self.workflow == WorkflowType.PLAN and not self.destination:
            raise ValueError("destination is required when workflow is 'plan'")
        return self


# ==========================================================
# DESTINATION
# ==========================================================

class DestinationOption(BaseModel):
    city: str
    country: str

    summary: str
    why_recommended: str
    best_season: str

    estimated_budget: float = Field(ge=0)

    attractions: list[str] = Field(default_factory=list)
    image_urls: list[HttpUrl] = Field(default_factory=list)


class DestinationContext(BaseModel):
    """The handoff object downstream agents (itinerary, transport/hotel,
    budget) consume once a destination is settled -- whether it came from
    Workflow 1's discovery step or was supplied directly in Workflow 2."""
    city: str
    country: str
    days: int = Field(ge=1, le=60)
    travelers: int = Field(ge=1, le=20)
    budget: float = Field(gt=0)
    currency: str
    start_date: Optional[date] = None
    preferences: list[str] = Field(default_factory=list)
    attractions: list[str] = Field(default_factory=list)


# ==========================================================
# WEATHER
# ==========================================================

class WeatherInfo(BaseModel):
    forecast: str
    avg_temperature: float  # can be negative (e.g. winter destinations) -- no floor
    warning: Optional[str] = None
    packing_tips: list[str] = Field(default_factory=list)


# ==========================================================
# VISA
# ==========================================================

class VisaInfo(BaseModel):
    required: bool
    visa_type: Optional[str] = None
    processing_time: Optional[str] = None
    details: str

    @model_validator(mode="after")
    def check_visa_type_consistency(self) -> "VisaInfo":
        if not self.required and self.visa_type is not None:
            raise ValueError("visa_type must be null when a visa isn't required")
        return self


# ==========================================================
# CURRENCY
# ==========================================================

class CurrencyInfo(BaseModel):
    source_currency: str = Field(min_length=3, max_length=3)
    destination_currency: str = Field(min_length=3, max_length=3)
    exchange_rate: float = Field(gt=0)


# ==========================================================
# ITINERARY
# ==========================================================

class Activity(BaseModel):
    time: str
    title: str
    description: str
    estimated_cost: Optional[float] = Field(default=None, ge=0)


class DayPlan(BaseModel):
    day: int = Field(ge=1)
    activities: list[Activity] = Field(min_length=1)


class Itinerary(BaseModel):
    overview: str
    days: list[DayPlan] = Field(min_length=1)

    @model_validator(mode="after")
    def check_days_are_unique_and_contiguous(self) -> "Itinerary":
        day_numbers = sorted(d.day for d in self.days)
        if len(day_numbers) != len(set(day_numbers)):
            raise ValueError("duplicate day numbers in itinerary")
        if day_numbers != list(range(1, len(day_numbers) + 1)):
            raise ValueError(
                f"day numbers must be contiguous starting at 1, got {day_numbers}"
            )
        return self


# ==========================================================
# ACCOMMODATION
# ==========================================================

class Accommodation(BaseModel):
    name: str
    accommodation_type: AccommodationType
    location: str
    rating: float = Field(ge=0, le=5)
    price_per_night: float = Field(ge=0)
    amenities: list[str] = Field(default_factory=list)
    booking_url: Optional[HttpUrl] = None
    image_url: Optional[HttpUrl] = None


# ==========================================================
# TRANSPORT
# ==========================================================

class TransportInfo(BaseModel):
    mode: TransportMode
    provider: str
    departure: str
    arrival: str
    duration: str
    estimated_cost: float = Field(ge=0)
    booking_url: Optional[HttpUrl] = None


# ==========================================================
# BUDGET
# ==========================================================

class BudgetBreakdown(BaseModel):
    currency: str = Field(min_length=3, max_length=3)

    accommodation: float = Field(ge=0)
    transport: float = Field(ge=0)
    food: float = Field(ge=0)
    activities: float = Field(ge=0)
    miscellaneous: float = Field(ge=0)
    emergency_buffer: float = Field(ge=0)

    total: float = Field(ge=0)

    @model_validator(mode="after")
    def check_total_matches_components(self) -> "BudgetBreakdown":
        computed = (
            self.accommodation
            + self.transport
            + self.food
            + self.activities
            + self.miscellaneous
            + self.emergency_buffer
        )
        # Small floating-point drift is fine; a real mismatch is a bug an
        # LLM produced and should fail validation immediately.
        tolerance = max(1.0, 0.01 * self.total)
        if abs(computed - self.total) > tolerance:
            raise ValueError(
                f"total ({self.total}) does not match sum of components ({computed})"
            )
        return self


# ==========================================================
# VERIFICATION
# ==========================================================

class ValidationIssue(BaseModel):
    field: str
    message: str
    severity: Literal["error", "warning"]


class VerificationResult(BaseModel):
    passed: bool
    confidence: float = Field(ge=0, le=100)
    warnings: list[ValidationIssue] = Field(default_factory=list)
    errors: list[ValidationIssue] = Field(default_factory=list)


# ==========================================================
# EVALUATION
# ==========================================================

class EvaluationResult(BaseModel):
    overall_score: float = Field(ge=0, le=100)
    completeness: float = Field(ge=0, le=100)
    consistency: float = Field(ge=0, le=100)
    travel_feasibility: float = Field(ge=0, le=100)
    budget_quality: float = Field(ge=0, le=100)
    tool_success_rate: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=100)
    remarks: list[str] = Field(default_factory=list)


# ==========================================================
# FINAL RESPONSE
# ==========================================================

class TripPlanResponse(BaseModel):
    """The single object returned to the client for Workflow 2 (and,
    optionally, after a Workflow 1 recommendation is carried forward)."""
    destination_context: DestinationContext
    weather: Optional[WeatherInfo] = None
    visa: Optional[VisaInfo] = None
    currency: Optional[CurrencyInfo] = None
    itinerary: Optional[Itinerary] = None
    accommodations: list[Accommodation] = Field(default_factory=list)
    transport: list[TransportInfo] = Field(default_factory=list)
    budget: Optional[BudgetBreakdown] = None
    verification: VerificationResult
    evaluation: EvaluationResult


# ==========================================================
# CHAT ASSISTANT
# ==========================================================

class ChatIntent(str, Enum):
    MODIFY_ITINERARY = "modify_itinerary"
    CHANGE_ACCOMMODATION = "change_accommodation"
    ADJUST_BUDGET = "adjust_budget"
    ADD_ATTRACTION = "add_attraction"
    REPLACE_ACTIVITY = "replace_activity"
    GENERAL_QUESTION = "general_question"


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    trip_plan: TripPlanResponse
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    intent: ChatIntent
    updated_trip_plan: Optional[TripPlanResponse] = None


class DestinationDiscoveryResponse(BaseModel):
    """
    Output from Destination Discovery Agent.
    """
    destinations: list[DestinationOption] = Field(
        description="List of recommended destinations"
    )
