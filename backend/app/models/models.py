from datetime import datetime
from .. import db

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    builds = db.relationship("Build", backref="user", lazy=True, cascade="all, delete")

    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email}


class Build(db.Model):
    __tablename__ = "builds"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    role = db.Column(db.String(50))         # e.g. Hunter, Titan, Warlock
    subclass = db.Column(db.String(50))     # e.g. Solar, Void, Arc
    activity = db.Column(db.String(50))     # e.g. Raid, Nightfall, PvP
    is_public = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    build_items = db.relationship("BuildItem", backref="build", lazy=True, cascade="all, delete")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "role": self.role,
            "subclass": self.subclass,
            "activity": self.activity,
            "is_public": self.is_public,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "items": [item.to_dict() for item in self.build_items],
        }


class GearItem(db.Model):
    __tablename__ = "gear_items"
    id = db.Column(db.Integer, primary_key=True)
    bungie_hash = db.Column(db.String(50), unique=True, nullable=False)  # Bungie manifest hash
    name = db.Column(db.String(120), nullable=False)
    slot = db.Column(db.String(50))          # Helmet, Chest, Arms, Legs, Class Item, Weapon
    item_type = db.Column(db.String(50))     # Armor, Weapon
    tier = db.Column(db.String(50))          # Exotic, Legendary, etc.
    icon_url = db.Column(db.String(300))
    stats = db.Column(db.JSON)               # e.g. { "Mobility": 10, "Resilience": 8 }
    perks = db.Column(db.JSON)               # list of perk names

    def to_dict(self):
        return {
            "id": self.id,
            "bungie_hash": self.bungie_hash,
            "name": self.name,
            "slot": self.slot,
            "item_type": self.item_type,
            "tier": self.tier,
            "icon_url": self.icon_url,
            "stats": self.stats,
            "perks": self.perks,
        }


class BuildItem(db.Model):
    __tablename__ = "build_items"
    id = db.Column(db.Integer, primary_key=True)
    slot_label = db.Column(db.String(50))   # e.g. "Helmet", "Kinetic Weapon"

    build_id = db.Column(db.Integer, db.ForeignKey("builds.id"), nullable=False)
    gear_item_id = db.Column(db.Integer, db.ForeignKey("gear_items.id"), nullable=False)

    gear_item = db.relationship("GearItem")

    def to_dict(self):
        return {
            "id": self.id,
            "slot_label": self.slot_label,
            "gear_item": self.gear_item.to_dict(),
        }
