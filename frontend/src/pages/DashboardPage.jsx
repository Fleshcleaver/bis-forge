import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBuilds, deleteBuild } from "../utils/api";
import BuildCard from "../components/builds/BuildCard";
import LoadingSpinner from "../components/layout/LoadingSpinner";
import ErrorMessage from "../components/layout/ErrorMessage";
import "./DashboardPage.css";

function DashboardPage() {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyBuilds()
      .then(setBuilds)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this build?")) return;
    setDeletingId(id);
    try {
      await deleteBuild(id);
      setBuilds(builds.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>My Builds</h1>
        <button className="btn-primary" onClick={() => navigate("/builds/new")}>
          + New Build
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError("")} />

      {loading ? (
        <LoadingSpinner message="Loading your builds..." />
      ) : builds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎮</div>
          <h2>No builds yet</h2>
          <p>Create your first Destiny 2 build and start optimizing your Guardian.</p>
          <button className="btn-primary" onClick={() => navigate("/builds/new")}>
            Create Your First Build
          </button>
        </div>
      ) : (
        <div className="builds-grid">
          {builds.map((build) => (
            <BuildCard
              key={build.id}
              build={build}
              deleting={deletingId === build.id}
              onDelete={handleDelete}
              onEdit={() => navigate(`/builds/${build.id}/edit`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;