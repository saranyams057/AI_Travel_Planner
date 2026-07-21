from app.graph_state import GraphState, WorkflowType


def route_after_destination(state: GraphState) -> str:
    if state.workflow == WorkflowType.EXPLORE:
        return "end"

    return "itinerary_planner"