import "./BuildCard.css";

const ROLE_ICONS = {
  Hunter: "🗡️",
  Titan: "🛡️",
  Warlock: "✨",
};

const ACTIVITY_COLORS = {
  Raid: "#f0a500",
  Nightfall: "#9b59b6",
  PvP: "#e94560",
  General: "#2ecc71",
};

function BuildCard({ build, onDelete, onEdit }) {
  const roleIcon = ROLE_ICONS[build.role] || "🎮";
  const activityColor = ACTIVITY_COLORS[build.activity] || "#aaa";

  return (
    <div className="build-card">
      <div className="build-card-header">
        <span className="build-role-icon">{roleIcon}</span>
        <div className="build-card-title">
          <h3>{build.title}</h3>
          <span className="build-subclass">{build.subclass || "No Subclass"}</span>
        </div>
        {build.is_public && <span className="build-public-badge">Public</span>}
      </div>

      <div className="build-card-meta">
        <span
          className="build-activity"
          style={{ borderColor: activityColor, color: activityColor }}
        >
          {build.activity || "General"}
        </span>
        <span className="build-item-count">
          {build.items?.length || 0} gear items
        </span>
      </div>

      {build.description && (
        <p className="build-description">{build.description}</p>
      )}

      <div className="build-card-actions">
        <button className="btn-edit" onClick={onEdit}>
          ✏️ Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(build.id)}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default BuildCard;