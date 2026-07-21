from langgraph.graph import StateGraph, START, END

from app.graph_state import GraphState
from app.agents.destination_discovery import destination_discovery_agent
from backend.app.agents.itinerary_planner import itinerary_planner_agent
from backend.app.graph.router import route_after_destination

builder = StateGraph(GraphState)

builder.add_node(
    "destination_discovery",
    destination_discovery_agent,
)

builder.add_node(
    "itinerary_planner",
    itinerary_planner_agent,
)

builder.add_edge(
    START,
    "destination_discovery",
)

builder.add_conditional_edges(
    "destination_discovery",
    route_after_destination,
    {
        "end": END,
        "itinerary_planner": "itinerary_planner",
    },
)

builder.add_edge(
    "itinerary_planner",
    END,
)

graph = builder.compile()