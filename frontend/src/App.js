import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import BuildEditorPage from "./pages/BuildEditorPage";
import CommunityPage from "./pages/CommunityPage";
import Navbar from "./components/layout/Navbar";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builds/new"
            element={
              <ProtectedRoute>
                <BuildEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builds/:id/edit"
            element={
              <ProtectedRoute>
                <BuildEditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;