import requests
from flask import current_app

BUNGIE_BASE = "https://www.bungie.net/Platform"
BUNGIE_CDN = "https://www.bungie.net"

def get_headers():
    return {"X-API-Key": current_app.config["BUNGIE_API_KEY"]}

def get_manifest():
    """Fetch the current Destiny 2 manifest metadata."""
    response = requests.get(f"{BUNGIE_BASE}/Destiny2/Manifest/", headers=get_headers())
    response.raise_for_status()
    return response.json()["Response"]

def get_item_definition(item_hash: str):
    """Fetch a single item from the manifest by its hash."""
    url = f"{BUNGIE_BASE}/Destiny2/Manifest/DestinyInventoryItemDefinition/{item_hash}/"
    response = requests.get(url, headers=get_headers())
    if response.status_code != 200:
        return None
    data = response.json().get("Response", {})
    return parse_item(data)

def parse_item(item_data: dict):
    """Extract the fields we care about from a raw Bungie item definition."""
    display = item_data.get("displayProperties", {})
    stats = item_data.get("stats", {}).get("stats", {})
    perks = [
        p.get("displayProperties", {}).get("name", "")
        for p in item_data.get("perks", [])
        if p.get("displayProperties", {}).get("name")
    ]
    icon_path = display.get("icon", "")

    return {
        "bungie_hash": str(item_data.get("hash", "")),
        "name": display.get("name", "Unknown"),
        "slot": resolve_slot(item_data),
        "item_type": item_data.get("itemTypeDisplayName", ""),
        "tier": item_data.get("inventory", {}).get("tierTypeName", ""),
        "icon_url": f"{BUNGIE_CDN}{icon_path}" if icon_path else "",
        "stats": {k: v.get("value", 0) for k, v in stats.items()},
        "perks": perks,
    }

def resolve_slot(item_data: dict):
    """Map Bungie's bucket hash to a human-readable slot name."""
    bucket_hash = item_data.get("equippingBlock", {}).get("equipmentSlotTypeHash")
    slot_map = {
        3448274439: "Helmet",
        3551918588: "Gauntlets",
        14239492: "Chest Armor",
        20886954: "Leg Armor",
        1585787867: "Class Item",
        1498876634: "Kinetic Weapon",
        2465295065: "Energy Weapon",
        953998645: "Power Weapon",
    }
    return slot_map.get(bucket_hash, "Unknown")
