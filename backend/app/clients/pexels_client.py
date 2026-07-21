import httpx

from app.config.settings import settings


class PexelsClient:
    BASE_URL = "https://api.pexels.com/v1"

    def __init__(self) -> None:
        self._headers = {
            "Authorization": settings.PEXELS_API_KEY
        }

    def search_image(
        self,
        query: str,
    ) -> str | None:
        """
        Search for a destination image.

        Returns the image URL if found,
        otherwise None.
        """

        with httpx.Client(timeout=10) as client:
            response = client.get(
                f"{self.BASE_URL}/search",
                headers=self._headers,
                params={
                    "query": query,
                    "per_page": 1,
                },
            )

            response.raise_for_status()

            photos = response.json().get("photos", [])

            if not photos:
                return None

            return photos[0]["src"]["large"]