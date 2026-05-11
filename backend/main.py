import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

from graph import explore_graph, plan_graph

app = FastAPI(title="AI Travel Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExploreRequest(BaseModel):
    free_text: Optional[str] = None
    trip_type: Optional[str] = "international"
    num_days: Optional[int] = 5
    budget_level: Optional[str] = "moderate"
    group_type: Optional[str] = "family"
    climate_preference: Optional[str] = ""
    interests: Optional[List[str]] = []
    starting_region: Optional[str] = "India"


class PlanRequest(BaseModel):
    destination: str
    starting_location: str
    num_people: int = 2
    group_type: str = "family"
    start_date: str
    num_days: int = 5
    budget_level: str = "moderate"
    trip_type: str = "international"
    transport_modes: Optional[List[str]] = ["flight"]
    additional_requirements: Optional[str] = ""


@app.get("/")
def root():
    return {"message": "AI Travel Assistant API is running!"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/explore")
async def explore_places(request: ExploreRequest):
    try:
        initial_state = {
            "user_input": request.dict(),
            "mode": "explore",
            "destinations": None,
            "itinerary": None,
            "transport_hotels": None,
            "budget": None,
            "weather": None,
            "visa_info": None,
            "overview": None,
            "precautions": None,
            "verification_passed": False,
            "verification_flags": [],
            "retry_count": 0,
            "error": None
        }

        result = await explore_graph.ainvoke(initial_state)

        return {
            "success": True,
            "destinations": result.get("destinations", []),
            "verification_flags": result.get("verification_flags", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/plan")
async def plan_trip(request: PlanRequest):
    try:
        initial_state = {
            "user_input": request.dict(),
            "mode": "plan",
            "destinations": None,
            "itinerary": None,
            "transport_hotels": None,
            "budget": None,
            "weather": None,
            "visa_info": None,
            "overview": None,
            "precautions": None,
            "verification_passed": False,
            "verification_flags": [],
            "retry_count": 0,
            "error": None
        }

        result = await plan_graph.ainvoke(initial_state)

        return {
            "success": True,
            "overview": result.get("overview", {}),
            "destinations": result.get("destinations", []),
            "itinerary": result.get("itinerary", {}),
            "transport_hotels": result.get("transport_hotels", {}),
            "budget": result.get("budget", {}),
            "weather": result.get("weather", {}),
            "precautions": result.get("precautions", {}),
            "verification_flags": result.get("verification_flags", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
