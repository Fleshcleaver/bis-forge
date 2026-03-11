from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from .. import db
from ..models.models import GearItem
from ..services.bungie_service import get_item_definition

gear_bp = Blueprint("gear", __name__)

# GET gear items already saved in local DB (searchable)
@gear_bp.route("/", methods=["GET"])
def get_gear():
    slot = request.args.get("slot")
    tier = request.args.get("tier")
    name = request.args.get("name")
    query = GearItem.query
    if slot:
        query = query.filter_by(slot=slot)
    if tier:
        query = query.filter_by(tier=tier)
    if name:
        query = query.filter(GearItem.name.ilike(f"%{name}%"))
    items = query.limit(50).all()
    return jsonify([i.to_dict() for i in items]), 200

# GET a single gear item from local DB
@gear_bp.route("/<int:item_id>", methods=["GET"])
def get_gear_item(item_id):
    item = GearItem.query.get_or_404(item_id)
    return jsonify(item.to_dict()), 200

# POST fetch an item from Bungie by hash and save it locally
@gear_bp.route("/fetch", methods=["POST"])
@jwt_required()
def fetch_from_bungie():
    data = request.get_json()
    item_hash = data.get("hash")
    if not item_hash:
        return jsonify({"error": "No hash provided"}), 400

    # Return from cache if already saved
    existing = GearItem.query.filter_by(bungie_hash=item_hash).first()
    if existing:
        return jsonify(existing.to_dict()), 200

    parsed = get_item_definition(item_hash)
    if not parsed:
        return jsonify({"error": "Item not found in Bungie manifest"}), 404

    item = GearItem(**parsed)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

# DELETE a gear item from the local DB
@gear_bp.route("/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_gear_item(item_id):
    item = GearItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Gear item deleted"}), 200
