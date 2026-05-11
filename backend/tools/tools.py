import os
import requests
import httpx

OPENWEATHER_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")


def get_weather(destination: str, start_date: str, num_days: int) -> dict:
    """Fetch weather forecast for destination using OpenWeatherMap API"""
    try:
        if not OPENWEATHER_API_KEY:
            return _mock_weather(destination, num_days)

        # Get coordinates
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={destination}&limit=1&appid={OPENWEATHER_API_KEY}"
        geo_resp = requests.get(geo_url, timeout=10)
        geo_data = geo_resp.json()

        if not geo_data:
            return _mock_weather(destination, num_days)

        lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]

        # Get 5-day forecast
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        forecast_resp = requests.get(forecast_url, timeout=10)
        forecast_data = forecast_resp.json()

        days = []
        seen_dates = set()
        for item in forecast_data.get("list", []):
            date = item["dt_txt"].split(" ")[0]
            if date not in seen_dates and len(days) < num_days:
                seen_dates.add(date)
                days.append({
                    "date": date,
                    "temp_min": round(item["main"]["temp_min"]),
                    "temp_max": round(item["main"]["temp_max"]),
                    "condition": item["weather"][0]["description"].title(),
                    "humidity": item["main"]["humidity"],
                    "wind_kph": round(item["wind"]["speed"] * 3.6),
                    "icon": item["weather"][0]["icon"]
                })

        return {"destination": destination, "forecast": days}
    except Exception as e:
        return _mock_weather(destination, num_days)


def _mock_weather(destination: str, num_days: int) -> dict:
    """Return mock weather when API is unavailable"""
    conditions = ["Sunny", "Partly Cloudy", "Clear Sky", "Light Breeze", "Warm & Pleasant"]
    import random
    days = []
    for i in range(num_days):
        days.append({
            "date": f"Day {i+1}",
            "temp_min": random.randint(18, 24),
            "temp_max": random.randint(28, 35),
            "condition": random.choice(conditions),
            "humidity": random.randint(40, 75),
            "wind_kph": random.randint(10, 25),
            "icon": "01d"
        })
    return {"destination": destination, "forecast": days}


def get_place_image(query: str) -> str:
    """Fetch a high-quality travel image URL from Unsplash or Pexels"""
    try:
        if UNSPLASH_ACCESS_KEY:
            url = f"https://api.unsplash.com/search/photos?query={query}&per_page=1&orientation=landscape"
            headers = {"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}
            resp = requests.get(url, headers=headers, timeout=10)
            data = resp.json()
            if data.get("results"):
                return data["results"][0]["urls"]["regular"]

        if PEXELS_API_KEY:
            url = f"https://api.pexels.com/v1/search?query={query}&per_page=1"
            headers = {"Authorization": PEXELS_API_KEY}
            resp = requests.get(url, headers=headers, timeout=10)
            data = resp.json()
            if data.get("photos"):
                return data["photos"][0]["src"]["large"]

        # Fallback to Unsplash source (no API key needed)
        query_encoded = query.replace(" ", "+")
        return f"https://source.unsplash.com/800x500/?{query_encoded},travel"

    except Exception:
        query_encoded = query.replace(" ", "+")
        return f"https://source.unsplash.com/800x500/?{query_encoded},travel"


def get_visa_info(destination_country: str, origin_country: str = "India") -> dict:
    """Return visa information (mock - can be replaced with real API)"""
    international_destinations = {
        "default": {
            "visa_required": True,
            "visa_type": "Tourist Visa",
            "processing_time": "5-15 business days",
            "validity": "30-90 days",
            "fee": "Varies by country ($20-$200 USD)",
            "requirements": [
                "Valid passport (6+ months validity)",
                "Completed visa application form",
                "Passport-size photographs (2)",
                "Proof of accommodation booking",
                "Return flight tickets",
                "Bank statement (last 3 months)",
                "Travel insurance",
                "Income proof / ITR"
            ],
            "tips": [
                "Apply at least 4-6 weeks before travel",
                "Check the official embassy website for latest requirements",
                "Keep photocopies of all documents",
                "Carry sufficient funds (approx. $50-$100/day)"
            ]
        }
    }
    return international_destinations.get(destination_country.lower(),
                                          international_destinations["default"])
