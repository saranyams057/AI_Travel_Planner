import json
import os
from langchain_groq import ChatGroq
from state import TravelState
from tools.tools import get_weather, get_place_image, get_visa_info

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

def get_llm():
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        api_key=GROQ_API_KEY,
        max_tokens=4096
    )


def safe_json_parse(text: str) -> dict:
    """Safely parse JSON from LLM response"""
    try:
        # Strip markdown code blocks if present
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])
        return json.loads(text)
    except Exception:
        return {}


# ─────────────────────────────────────────────
# 1. DESTINATION DISCOVERY AGENT
# ─────────────────────────────────────────────
def destination_discovery_agent(state: TravelState) -> TravelState:
    llm = get_llm()
    user_input = state["user_input"]
    mode = state["mode"]

    if mode == "explore":
        prompt = f"""You are a world-class travel destination expert.
The user wants destination suggestions based on their constraints.

User constraints: {json.dumps(user_input)}

Return a JSON object with a "places" array of 6 destinations. Each destination must have:
- placeName: city and country (e.g., "Bali, Indonesia")
- description: 2-3 engaging sentences
- activities: list of 3-5 activities
- bestTime: best months to visit
- estimatedBudget: budget range per person in INR
- highlights: list of 3 tags (e.g., ["Beach", "Luxury", "Couple-friendly"])
- googleLink: https://www.google.com/search?q={{placeName}} (URL encoded)
- whyVisit: one compelling reason

Return ONLY valid JSON. No explanation outside JSON."""

    else:  # plan mode - Mode 2
        destination = user_input.get("destination", "")
        prompt = f"""You are a world-class travel expert specializing in local attractions.

Destination: {destination}

Return a JSON object with a "places" array of 8-10 best places to visit IN {destination}. Each must have:
- placeName: specific attraction name (e.g., "Eiffel Tower")
- description: 2-3 engaging sentences about the place
- activities: list of 3-4 activities at this place
- visitDuration: recommended time (e.g., "2-3 hours")
- estimatedCost: entry fee or cost in INR (e.g., "₹500 entry" or "Free")
- bestTime: best time of day to visit
- googleLink: https://www.google.com/search?q={{placeName}}+{destination.replace(' ', '+')}
- category: one of [Historic, Nature, Adventure, Culture, Food, Shopping, Religious]

Return ONLY valid JSON. No explanation outside JSON."""

    response = llm.invoke(prompt)
    parsed = safe_json_parse(response.content)

    # Attach images to each place
    places = parsed.get("places", [])
    for place in places:
        name = place.get("placeName", "travel destination")
        place["image"] = get_place_image(f"{name} travel")

    state["destinations"] = places
    return state


# ─────────────────────────────────────────────
# 2. ITINERARY PLANNER AGENT
# ─────────────────────────────────────────────
def itinerary_planner_agent(state: TravelState) -> TravelState:
    llm = get_llm()
    user_input = state["user_input"]

    destination = user_input.get("destination", "")
    num_days = user_input.get("num_days", 5)
    start_date = user_input.get("start_date", "")
    group_type = user_input.get("group_type", "family")
    budget_level = user_input.get("budget_level", "moderate")
    additional = user_input.get("additional_requirements", "")

    # Fetch weather
    weather_data = get_weather(destination, start_date, int(num_days))
    state["weather"] = weather_data

    weather_summary = json.dumps(weather_data.get("forecast", [])[:num_days])

    prompt = f"""You are an expert travel itinerary planner.

Trip Details:
- Destination: {destination}
- Duration: {num_days} days starting {start_date}
- Group: {group_type}
- Budget: {budget_level}
- Additional: {additional}
- Weather forecast: {weather_summary}

Create a detailed day-wise itinerary. Return a JSON object with a "days" array. Each day must have:
- day: day number (1, 2, 3...)
- date: the actual date
- theme: a fun theme for the day (e.g., "Historic Wonders Day")
- weather_note: brief weather tip for that day
- morning: object with "activity", "place", "duration", "tip"
- afternoon: object with "activity", "place", "duration", "tip"  
- evening: object with "activity", "place", "duration", "tip"
- meals: object with "breakfast", "lunch", "dinner" (restaurant suggestions)
- day_tip: one insider tip for the day

Ensure activities are realistic — max 3-4 major places per day. Account for weather.
Return ONLY valid JSON. No explanation outside JSON."""

    response = llm.invoke(prompt)
    parsed = safe_json_parse(response.content)
    state["itinerary"] = parsed
    return state


# ─────────────────────────────────────────────
# 3. TRANSPORT & HOTEL AGENT
# ─────────────────────────────────────────────
def transport_hotel_agent(state: TravelState) -> TravelState:
    llm = get_llm()
    user_input = state["user_input"]

    destination = user_input.get("destination", "")
    origin = user_input.get("starting_location", "Mumbai")
    num_people = user_input.get("num_people", 2)
    budget_level = user_input.get("budget_level", "moderate")
    transport_modes = user_input.get("transport_modes", ["flight"])
    num_days = user_input.get("num_days", 5)
    start_date = user_input.get("start_date", "")
    trip_type = user_input.get("trip_type", "international")

    prompt = f"""You are a travel logistics expert specializing in transport and accommodation.

Trip Details:
- From: {origin} → To: {destination}
- People: {num_people}
- Budget: {budget_level}
- Transport modes: {transport_modes}
- Trip type: {trip_type}
- Duration: {num_days} nights
- Start date: {start_date}

Return a JSON object with:

1. "flights": array of 3 flight options (if flight is in transport modes or international trip). Each:
   - airline, departure, arrival, duration, stops, price (per person INR), bookingLink: "https://www.makemytrip.com/flights/"

2. "trains": array of 3 train options (only if domestic and train is in transport modes). Each:
   - trainName, trainNumber, departure, arrival, duration, 
   - classes: array of objects with className and price (INR)
   - bookingLink: "https://www.makemytrip.com/railways/"

3. "buses": array of 2 bus options (only if domestic and bus in transport modes). Each:
   - operator, departure, arrival, duration, price (INR), busType, bookingLink: "https://www.makemytrip.com/bus-tickets/"

4. "hotels": array of 3 hotels. Each:
   - hotelName, starRating (1-5), type (Budget/Mid-range/Luxury)
   - location (distance from main attraction)
   - amenities: array of 4-6 amenities
   - pricePerNight (INR)
   - googleLink: "https://www.google.com/search?q={{hotelName}}+{destination.replace(' ', '+')}"
   - bookingLink: "https://www.makemytrip.com/hotels/"
   - description: 1-2 sentences about the hotel

5. "localTransport":
   - recommended: array of local transport options
   - estimatedDailyCost: cost in INR
   - tips: array of 2-3 local transport tips

Make hotels realistic for the budget level and destination. Return ONLY valid JSON."""

    response = llm.invoke(prompt)
    parsed = safe_json_parse(response.content)

    # Attach hotel images
    hotels = parsed.get("hotels", [])
    for hotel in hotels:
        hotel_name = hotel.get("hotelName", "hotel")
        hotel["image"] = get_place_image(f"{hotel_name} {destination} hotel exterior")

    state["transport_hotels"] = parsed
    return state


# ─────────────────────────────────────────────
# 4. BUDGET ESTIMATOR AGENT
# ─────────────────────────────────────────────
def budget_estimator_agent(state: TravelState) -> TravelState:
    llm = get_llm()
    user_input = state["user_input"]
    transport_hotels = state.get("transport_hotels", {})

    destination = user_input.get("destination", "")
    num_people = int(user_input.get("num_people", 2))
    num_days = int(user_input.get("num_days", 5))
    budget_level = user_input.get("budget_level", "moderate")

    hotels = transport_hotels.get("hotels", [])
    flights = transport_hotels.get("flights", [])

    prompt = f"""You are a travel budget expert.

Trip Details:
- Destination: {destination}
- People: {num_people}
- Days: {num_days}
- Budget level: {budget_level}
- Hotels info: {json.dumps(hotels[:2])}
- Flights info: {json.dumps(flights[:1])}

Return a JSON object with:
1. "breakdown": object with these categories, each having "perPerson" (string with ₹) and "groupTotal" (string with ₹):
   - flights
   - localTransport
   - accommodation
   - food
   - activities
   - miscellaneous

2. "grandTotal":
   - perPerson (string with ₹)
   - groupTotal (string with ₹)

3. "budgetLevel": the budget level string

4. "savingTips": array of 5 practical money-saving tips

5. "chartData": array of objects for pie chart, each with:
   - name (category name)
   - value (percentage as number, all must sum to 100)
   - color (hex color code)

Make the numbers realistic and consistent. Accommodation = pricePerNight × nights.
Return ONLY valid JSON. No explanation outside JSON."""

    response = llm.invoke(prompt)
    parsed = safe_json_parse(response.content)
    state["budget"] = parsed
    return state


# ─────────────────────────────────────────────
# 5. VERIFICATION AGENT
# ─────────────────────────────────────────────
def verification_agent(state: TravelState) -> TravelState:
    llm = get_llm()
    user_input = state["user_input"]

    itinerary = state.get("itinerary", {})
    transport_hotels = state.get("transport_hotels", {})
    budget = state.get("budget", {})
    destinations = state.get("destinations", [])

    prompt = f"""You are a strict travel plan verification expert. Your job is to detect hallucinations, unrealistic plans, and inconsistencies.

User Input: {json.dumps(user_input)}
Itinerary: {json.dumps(itinerary)}
Transport & Hotels: {json.dumps(transport_hotels)}
Budget: {json.dumps(budget)}

Check for:
1. Geographic realism: Are travel times between places feasible?
2. Day plan feasibility: Max 3-4 major attractions per day?
3. Budget sanity: Do costs match the stated budget level?
4. Date logic: Do start date + num_days add up correctly?
5. Cross-agent consistency: Do budget totals roughly match transport/hotel costs?
6. Obvious hallucinations: Any clearly invented places or impossible facts?

Return a JSON object with:
- "verification_passed": true or false (be lenient — only fail if there are MAJOR issues)
- "flags": array of issues found. Each flag:
  - "agent": which agent produced the issue
  - "issue": description of the problem
  - "severity": "low", "medium", or "high"
  - "suggestion": how to fix it
- "summary": one sentence overall assessment

Return ONLY valid JSON. No explanation outside JSON."""

    response = llm.invoke(prompt)
    parsed = safe_json_parse(response.content)

    state["verification_passed"] = parsed.get("verification_passed", True)
    state["verification_flags"] = parsed.get("flags", [])
    return state


# ─────────────────────────────────────────────
# 6. ORCHESTRATOR AGENT
# ─────────────────────────────────────────────
def orchestrator_agent(state: TravelState) -> TravelState:
    """Initialize state on first pass"""
    if "retry_count" not in state:
        state["retry_count"] = 0
    if "verification_passed" not in state:
        state["verification_passed"] = False
    return state


def orchestrator_final_agent(state: TravelState) -> TravelState:
    """Final pass: generate overview and precautions"""
    llm = get_llm()
    user_input = state["user_input"]

    destination = user_input.get("destination", "")
    trip_type = user_input.get("trip_type", "domestic")
    num_days = user_input.get("num_days", 5)
    num_people = user_input.get("num_people", 2)
    group_type = user_input.get("group_type", "family")
    budget_level = user_input.get("budget_level", "moderate")
    start_date = user_input.get("start_date", "")

    weather = state.get("weather", {})
    budget = state.get("budget", {})
    itinerary = state.get("itinerary", {})

    # Overview prompt
    overview_prompt = f"""You are a travel summary expert.

Trip: {num_days} days in {destination}, {group_type} group of {num_people}, {budget_level} budget, starting {start_date}
Budget summary: {json.dumps(budget.get('grandTotal', {}))}
Weather: {json.dumps(weather.get('forecast', [])[:3])}
Itinerary highlights: {json.dumps(itinerary.get('days', [])[:2])}

Return a JSON object for the trip overview with:
- "destination": destination name
- "tagline": a catchy one-liner for this trip
- "highlights": array of 5 top highlights of this trip
- "quickStats": object with totalCost, totalDays, groupSize, tripType, bestFeature
- "weatherSummary": 2-sentence weather overview for the trip period
- "packingSuggestions": array of 6 essential items to pack
- "heroImage": call the image tool — just put the destination name here for image lookup

Return ONLY valid JSON."""

    overview_response = llm.invoke(overview_prompt)
    overview = safe_json_parse(overview_response.content)
    overview["heroImage"] = get_place_image(f"{destination} aerial skyline landmark")
    state["overview"] = overview

    # Precautions prompt
    visa_info = {}
    if trip_type == "international":
        visa_info = get_visa_info(destination)

    precautions_prompt = f"""You are a travel safety and precautions expert.

Trip: {destination}, {trip_type}, {group_type}, {num_days} days
Visa info: {json.dumps(visa_info)}
Weather: {json.dumps(weather.get('forecast', [])[:2])}

Return a JSON object with:
- "visa" (only if international): object with visaRequired, visaType, processingTime, fee, requirements (array), tips (array)
- "health": object with vaccinations (array), medicines (array), waterSafety, foodSafety
- "safety": object with generalTips (array), emergencyNumbers with police/ambulance/tourist_helpline
- "culture": object with customs (array), dresscode, dosList (array), dontsList (array)
- "documentsChecklist": array of documents to carry
- "packingEssentials": array of 8 items based on weather and destination

Return ONLY valid JSON. No explanation outside JSON."""

    precautions_response = llm.invoke(precautions_prompt)
    precautions = safe_json_parse(precautions_response.content)
    state["precautions"] = precautions

    return state
