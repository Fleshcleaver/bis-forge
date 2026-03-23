import { useState, useEffect } from "react";
import { getPublicBuilds } from "../utils/api";
import BuildCard from "../components/builds/BuildCard";
import "./CommunityPage.css";

const ROLES = ["All", "Hunter", "Titan", "Warlock"];
const ACTIVITIES = ["All", "Raid", "Nightfall", "PvP", "General"];

function CommunityPage() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activityFilter, setActivityFilter] = useState("All");

  useEffect(() => {
    fetchBuilds();
  }, [roleFilter, activityFilter]);

  async function fetchBuilds() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "All") params.append("role", roleFilter);
      if (activityFilter !== "All") params.append("activity", activityFilter);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const data = await getPublicBuilds(queryString);
      setBuilds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="community-page">
      <div className="community-header">
        <div>
          <h1>Community Builds</h1>
          <p className="community-subtitle">
            Browse builds shared by other Guardians
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="community-filters">
        <div className="filter-group">
          <label>Class</label>
          <div className="filter-pills">
            {ROLES.map((role) => (
              <button
                key={role}
                className={`filter-pill ${roleFilter === role ? "active" : ""}`}
                onClick={() => setRoleFilter(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Activity</label>
          <div className="filter-pills">
            {ACTIVITIES.map((activity) => (
              <button
                key={activity}
                className={`filter-pill ${activityFilter === activity ? "active" : ""}`}
                onClick={() => setActivityFilter(activity)}
              >
                {activity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading community builds...</div>
      ) : builds.length === 0 ? (
        <div className="empty-state">
          <p>🔭 No public builds found yet.</p>
          <p className="empty-hint">
            Create a build and check "Make this build public" to share it here!
          </p>
        </div>
      ) : (
        <>
          <p className="results-count">{builds.length} build{builds.length !== 1 ? "s" : ""} found</p>
          <div className="builds-grid">
            {builds.map((build) => (
              <BuildCard
                key={build.id}
                build={build}
                onDelete={() => {}}
                onEdit={() => {}}
                readOnly
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CommunityPage;