import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

from graph import explore_graph, plan_graph
from observability import (
    configure_logging,
    log_event,
    log_exception,
    metrics_snapshot,
    new_request_id,
    record_http_request,
    reset_request_id,
    set_request_id,
)

configure_logging()

app = FastAPI(title="AI Travel Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-request-id", "x-response-time-ms"],
)


@app.middleware("http")
async def observability_middleware(request, call_next):
    request_id = request.headers.get("x-request-id") or new_request_id()
    token = set_request_id(request_id)
    started_at = time.perf_counter()
    status_code = 500

    try:
        log_event("request_started", method=request.method, path=request.url.path)
        response = await call_next(request)
        status_code = response.status_code
        return response
    except Exception:
        log_exception("request_failed", method=request.method, path=request.url.path)
        raise
    finally:
        duration_ms = (time.perf_counter() - started_at) * 1000
        record_http_request(request.method, request.url.path, status_code, duration_ms)
        log_event(
            "request_finished",
            method=request.method,
            path=request.url.path,
            status_code=status_code,
            duration_ms=round(duration_ms, 2),
        )
        if "response" in locals():
            response.headers["x-request-id"] = request_id
            response.headers["x-response-time-ms"] = str(round(duration_ms, 2))
        reset_request_id(token)


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


@app.get("/metrics")
def metrics():
    return metrics_snapshot()


@app.post("/api/explore")
async def explore_places(request: ExploreRequest):
    try:
        log_event(
            "explore_requested",
            trip_type=request.trip_type,
            budget_level=request.budget_level,
            group_type=request.group_type,
            input_mode="free_text" if request.free_text else "structured",
        )
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
        destinations = result.get("destinations", [])
        log_event("explore_completed", destinations_count=len(destinations))

        return {
            "success": True,
            "destinations": destinations,
            "verification_flags": result.get("verification_flags", [])
        }
    except Exception as e:
        log_exception("explore_failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/plan")
async def plan_trip(request: PlanRequest):
    try:
        log_event(
            "plan_requested",
            destination=request.destination,
            trip_type=request.trip_type,
            budget_level=request.budget_level,
            num_days=request.num_days,
            num_people=request.num_people,
        )
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
        log_event(
            "plan_completed",
            destination=request.destination,
            verification_flags_count=len(result.get("verification_flags", [])),
        )

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
        log_exception("plan_failed", destination=request.destination)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
