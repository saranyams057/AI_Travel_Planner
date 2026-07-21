from app.services.image_service import ImageService

_image_service = ImageService()


def image_tool(
    city: str,
    country: str,
) -> str | None:
    """
    Retrieve an image URL for a destination.
    """

    return _image_service.get_destination_image(
        city,
        country,
    )