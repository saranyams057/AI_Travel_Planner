from urllib.parse import quote_plus


class MapsService:
    """
    Service responsible for generating Google Maps URLs.
    """

    @staticmethod
    def build_google_maps_url(
        city: str,
        country: str,
    ) -> str:
        query = quote_plus(f"{city}, {country}")

        return (
            "https://www.google.com/maps/search/"
            f"?api=1&query={query}"
        )