import requests
from typing import Optional

CLOUD_NAME = "dmn6hb4zt"
UPLOAD_PRESET = "zilly_preset"
UPLOAD_URL = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload"

def upload_to_cloudinary(file_bytes: bytes, filename: str) -> str:
    """Upload an image file to Cloudinary using the unsigned preset.
    Returns the secure URL of the uploaded image.
    """
    files = {
        "file": (filename, file_bytes),
    }
    data = {
        "upload_preset": UPLOAD_PRESET,
        # auto‑optimisation flags – they are query‑string params but can also be sent as fields
        "folder": "zilly_inventory",
        "transformation": "f_auto,q_auto",
    }
    response = requests.post(UPLOAD_URL, data=data, files=files)
    response.raise_for_status()
    json_resp = response.json()
    return json_resp.get("secure_url")
