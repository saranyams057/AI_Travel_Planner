import logging

from app.clients.pexels_client import PexelsClient

logger = logging.getLogger(__name__)


class ImageService:
    """
    Service responsible for retrieving destination images.
    """

    def __init__(self) -> None:
        self.client = PexelsClient()

    def get_destination_image(
        self,
        city: str,
        country: str,
    ) -> str | None:

        queries = [
            f"{city} {country} travel",
            f"{city} {country}",
            f"{city} skyline",
        ]

        for query in queries:
            try:
                image_url = self.client.search_image(query)

                if image_url:
                    return image_url

            except Exception:
                logger.exception(
                    "Image lookup failed for query '%s'",
                    query,
                )

        logger.warning(
            "No image found for %s, %s",
            city,
            country,
        )

        return None