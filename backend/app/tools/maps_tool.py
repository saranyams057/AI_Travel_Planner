from app.services.maps_service import MapsService

_maps_service = MapsService()


def maps_tool(
    city: str,
    country: str,
) -> str:
    """
    Generate a Google Maps URL for a destination.
    """

    return _maps_service.build_google_maps_url(
        city,
        country,
    )