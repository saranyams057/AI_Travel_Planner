from langgraph.graph import StateGraph, END
from state import TravelState
from agents.agents import (
    orchestrator_agent,
    orchestrator_final_agent,
    destination_discovery_agent,
    itinerary_planner_agent,
    transport_hotel_agent,
    budget_estimator_agent,
    verification_agent,
)


def route_after_verification(state: TravelState) -> str:
    if state.get("verification_passed", False):
        return "finalize"
    elif state.get("retry_count", 0) >= 2:
        return "finalize"  # proceed after max retries
    else:
        state["retry_count"] = state.get("retry_count", 0) + 1
        return "retry"


def build_explore_graph():
    """Graph for Use Case 1: Explore Places"""
    graph = StateGraph(TravelState)

    graph.add_node("orchestrator", orchestrator_agent)
    graph.add_node("destination_discovery", destination_discovery_agent)
    graph.add_node("verification", verification_agent)
    graph.add_node("finalize", orchestrator_final_agent)

    graph.set_entry_point("orchestrator")
    graph.add_edge("orchestrator", "destination_discovery")
    graph.add_edge("destination_discovery", "verification")

    graph.add_conditional_edges(
        "verification",
        lambda s: "finalize" if s.get("verification_passed", True) or s.get("retry_count", 0) >= 2 else "destination_discovery",
        {
            "finalize": "finalize",
            "destination_discovery": "destination_discovery",
        }
    )
    graph.add_edge("finalize", END)

    return graph.compile()


def build_plan_graph():
    """Graph for Use Case 2: Plan My Trip (full pipeline)"""
    graph = StateGraph(TravelState)

    graph.add_node("orchestrator", orchestrator_agent)
    graph.add_node("destination_discovery", destination_discovery_agent)
    graph.add_node("itinerary_planner", itinerary_planner_agent)
    graph.add_node("transport_hotel", transport_hotel_agent)
    graph.add_node("budget_estimator", budget_estimator_agent)
    graph.add_node("verification", verification_agent)
    graph.add_node("finalize", orchestrator_final_agent)

    graph.set_entry_point("orchestrator")
    graph.add_edge("orchestrator", "destination_discovery")
    graph.add_edge("destination_discovery", "itinerary_planner")
    graph.add_edge("itinerary_planner", "transport_hotel")
    graph.add_edge("transport_hotel", "budget_estimator")
    graph.add_edge("budget_estimator", "verification")

    graph.add_conditional_edges(
        "verification",
        lambda s: "finalize" if s.get("verification_passed", True) or s.get("retry_count", 0) >= 2 else "itinerary_planner",
        {
            "finalize": "finalize",
            "itinerary_planner": "itinerary_planner",
        }
    )
    graph.add_edge("finalize", END)

    return graph.compile()


explore_graph = build_explore_graph()
plan_graph = build_plan_graph()
