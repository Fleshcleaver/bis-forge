from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.models import Build, BuildItem, GearItem

build_bp = Blueprint("builds", __name__)

# GET all builds for logged-in user
@build_bp.route("/", methods=["GET"])
@jwt_required()
def get_builds():
    user_id = int(get_jwt_identity())
    builds = Build.query.filter_by(user_id=user_id).order_by(Build.updated_at.desc()).all()
    return jsonify([b.to_dict() for b in builds]), 200

# GET public builds (community feed)
@build_bp.route("/public", methods=["GET"])
def get_public_builds():
    role = request.args.get("role")
    activity = request.args.get("activity")
    query = Build.query.filter_by(is_public=True)
    if role:
        query = query.filter_by(role=role)
    if activity:
        query = query.filter_by(activity=activity)
    builds = query.order_by(Build.updated_at.desc()).all()
    return jsonify([b.to_dict() for b in builds]), 200

# GET single build
@build_bp.route("/<int:build_id>", methods=["GET"])
@jwt_required()
def get_build(build_id):
    build = Build.query.get_or_404(build_id)
    return jsonify(build.to_dict()), 200

# POST create a new build
@build_bp.route("/", methods=["POST"])
@jwt_required()
def create_build():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    build = Build(
        title=data.get("title", "Untitled Build"),
        description=data.get("description", ""),
        role=data.get("role"),
        subclass=data.get("subclass"),
        activity=data.get("activity"),
        is_public=data.get("is_public", False),
        user_id=user_id,
    )
    db.session.add(build)
    db.session.commit()
    return jsonify(build.to_dict()), 201

# PATCH update a build
@build_bp.route("/<int:build_id>", methods=["PATCH"])
@jwt_required()
def update_build(build_id):
    user_id = int(get_jwt_identity())
    build = Build.query.get_or_404(build_id)
    if build.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    for field in ("title", "description", "role", "subclass", "activity", "is_public"):
        if field in data:
            setattr(build, field, data[field])
    db.session.commit()
    return jsonify(build.to_dict()), 200

# DELETE a build
@build_bp.route("/<int:build_id>", methods=["DELETE"])
@jwt_required()
def delete_build(build_id):
    user_id = int(get_jwt_identity())
    build = Build.query.get_or_404(build_id)
    if build.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    db.session.delete(build)
    db.session.commit()
    return jsonify({"message": "Build deleted"}), 200

# POST add a gear item to a build
@build_bp.route("/<int:build_id>/items", methods=["POST"])
@jwt_required()
def add_item_to_build(build_id):
    user_id = int(get_jwt_identity())
    build = Build.query.get_or_404(build_id)
    if build.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    gear = GearItem.query.get_or_404(data["gear_item_id"])
    build_item = BuildItem(build_id=build.id, gear_item_id=gear.id, slot_label=data.get("slot_label", gear.slot))
    db.session.add(build_item)
    db.session.commit()
    return jsonify(build_item.to_dict()), 201

# DELETE remove a gear item from a build
@build_bp.route("/<int:build_id>/items/<int:item_id>", methods=["DELETE"])
@jwt_required()
def remove_item_from_build(build_id, item_id):
    user_id = int(get_jwt_identity())
    build = Build.query.get_or_404(build_id)
    if build.user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    build_item = BuildItem.query.get_or_404(item_id)
    db.session.delete(build_item)
    db.session.commit()
    return jsonify({"message": "Item removed"}), 200