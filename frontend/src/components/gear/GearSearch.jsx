import { useState } from "react";
import { getGear, fetchGearFromBungie } from "../../utils/api";
import "./GearSearch.css";

function GearSearch({ slot, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [bungieHash, setBungieHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const params = `?name=${encodeURIComponent(query)}&slot=${encodeURIComponent(slot)}`;
      const data = await getGear(params);
      setResults(data);
      if (data.length === 0) setError("No results found. Try fetching by Bungie hash below.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchByHash() {
    if (!bungieHash.trim()) return;
    setLoading(true);
    setError("");
    try {
      const item = await fetchGearFromBungie(bungieHash.trim());
      setResults([item]);
    } catch (err) {
      setError("Item not found. Double-check the hash from the Bungie API or d2gunsmith.com");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gear-search">
      <div className="gear-search-header">
        <h3>Add Gear — {slot}</h3>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      {/* Search by name */}
      <div className="search-row">
        <input
          type="text"
          placeholder="Search by item name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="search-input"
        />
        <button className="btn-search" onClick={handleSearch} disabled={loading}>
          Search
        </button>
      </div>

      {/* Fetch by Bungie hash */}
      <div className="search-row">
        <input
          type="text"
          placeholder="Or enter Bungie item hash..."
          value={bungieHash}
          onChange={(e) => setBungieHash(e.target.value)}
          className="search-input"
        />
        <button className="btn-search" onClick={handleFetchByHash} disabled={loading}>
          Fetch
        </button>
      </div>

      <p className="hash-hint">
        💡 Find item hashes at{" "}
        <a href="https://d2gunsmith.com" target="_blank" rel="noreferrer">d2gunsmith.com</a>
        {" "}or{" "}
        <a href="https://www.light.gg" target="_blank" rel="noreferrer">light.gg</a>
      </p>

      {error && <div className="search-error">{error}</div>}
      {loading && <div className="search-loading">Searching...</div>}

      <div className="search-results">
        {results.map((item) => (
          <div key={item.id} className="result-item" onClick={() => onSelect(item)}>
            {item.icon_url && (
              <img src={item.icon_url} alt={item.name} className="result-icon" />
            )}
            <div className="result-info">
              <span className="result-name">{item.name}</span>
              <span className="result-meta">
                {item.tier} · {item.slot}
              </span>
            </div>
            <button className="btn-select">+ Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GearSearch;