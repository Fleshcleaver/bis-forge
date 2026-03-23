import "./AIPanel.css";

function AIPanel({ onRecommend, response, loading }) {
  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <h3>🤖 AI Build Advisor</h3>
        <span className="ai-badge">Powered by Groq</span>
      </div>
      <p className="ai-description">
        Get an AI-powered analysis of your build — including why each item is strong
        and suggestions for improvement.
      </p>
      <button
        className="btn-ai"
        onClick={onRecommend}
        disabled={loading}
      >
        {loading ? "Analyzing your build..." : "⚡ Analyze My Build"}
      </button>

      {loading && (
        <div className="ai-loading">
          <div className="ai-spinner"></div>
          <span>Consulting the Traveler...</span>
        </div>
      )}

      {response && !loading && (
        <div className="ai-response">
          <h4>Analysis</h4>
          <div className="ai-response-text">
            {response.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AIPanel;