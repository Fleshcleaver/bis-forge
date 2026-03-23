import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">⚔️ BiS Forge</Link>
      </div>
      <div className="navbar-links">
        <Link to="/community">Community Builds</Link>
        {user ? (
          <>
            <Link to="/dashboard">My Builds</Link>
            <Link to="/builds/new">+ New Build</Link>
            <span className="navbar-user">👤 {user.username}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <Link to="/auth">Login / Register</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;