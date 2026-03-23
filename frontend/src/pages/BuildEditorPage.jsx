import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBuild,
  updateBuild,
  getBuild,
  getGear,
  addItemToBuild,
  removeItemFromBuild,
  getAIRecommendation,
} from "../utils/api";
import GearSearch from "../components/gear/GearSearch";
import AIPanel from "../components/ai/AIPanel";
import "./BuildEditorPage.css";

const SLOTS = [
  "Helmet",
  "Gauntlets",
  "Chest Armor",
  "Leg Armor",
  "Class Item",
  "Kinetic Weapon",
  "Energy Weapon",
  "Power Weapon",
];

const ROLES = ["Hunter", "Titan", "Warlock"];
const SUBCLASSES = ["Solar", "Arc", "Void", "Strand", "Stasis"];
const ACTIVITIES = ["Raid", "Nightfall", "PvP", "General"];

function BuildEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    role: "Hunter",
    subclass: "Solar",
    activity: "General",
    is_public: false,
  });

  const [build, setBuild] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      getBuild(id)
        .then((data) => {
          setBuild(data);
          setForm({
            title: data.title,
            description: data.description || "",
            role: data.role || "Hunter",
            subclass: data.subclass || "Solar",
            activity: data.activity || "General",
            is_public: data.is_public || false,
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  function handleChange(e) {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      if (isEditing) {
        const updated = await updateBuild(id, form);
        setBuild(updated);
      } else {
        const newBuild = await createBuild(form);
        setBuild(newBuild);
        navigate(`/builds/${newBuild.id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddGear(gearItem) {
    if (!build) {
      setError("Please save the build first before adding gear.");
      return;
    }
    try {
      await addItemToBuild(build.id, {
        gear_item_id: gearItem.id,
        slot_label: activeSlot,
      });
      const updated = await getBuild(build.id);
      setBuild(updated);
      setActiveSlot(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveGear(itemId) {
    try {
      await removeItemFromBuild(build.id, itemId);
      const updated = await getBuild(build.id);
      setBuild(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAIRecommend() {
    if (!build) {
      setError("Please save the build first.");
      return;
    }
    setAiLoading(true);
    setAiResponse("");
    try {
      const data = await getAIRecommendation(build);
      setAiResponse(data.recommendation);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  function getItemForSlot(slotName) {
    return build?.items?.find((i) => i.slot_label === slotName);
  }

  if (loading) return <div className="loading-state">Loading build...</div>;

  return (
    <div className="editor-page">
      <div className="editor-left">
        <h1>{isEditing ? "Edit Build" : "New Build"}</h1>
        {error && <div className="error-banner">{error}</div>}

        {/* Build Details Form */}
        <div className="editor-card">
          <h2>Build Details</h2>
          <div className="form-grid">
            <input
              type="text"
              name="title"
              placeholder="Build Title"
              value={form.title}
              onChange={handleChange}
              className="form-input full-width"
            />
            <textarea
              name="description"
              placeholder="Describe your build strategy..."
              value={form.description}
              onChange={handleChange}
              className="form-input full-width"
              rows={3}
            />
            <div className="form-row">
              <div className="form-group">
                <label>Class</label>
                <select name="role" value={form.role} onChange={handleChange} className="form-input">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subclass</label>
                <select name="subclass" value={form.subclass} onChange={handleChange} className="form-input">
                  {SUBCLASSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Activity</label>
                <select name="activity" value={form.activity} onChange={handleChange} className="form-input">
                  {ACTIVITIES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_public"
                checked={form.is_public}
                onChange={handleChange}
              />
              Make this build public (visible in Community)
            </label>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Build"}
          </button>
        </div>

        {/* Gear Slots */}
        {build && (
          <div className="editor-card">
            <h2>Gear Slots</h2>
            <div className="gear-slots">
              {SLOTS.map((slot) => {
                const item = getItemForSlot(slot);
                return (
                  <div key={slot} className="gear-slot">
                    <span className="slot-name">{slot}</span>
                    {item ? (
                      <div className="slot-filled">
                        {item.gear_item.icon_url && (
                          <img src={item.gear_item.icon_url} alt={item.gear_item.name} className="gear-icon" />
                        )}
                        <span className="gear-name">{item.gear_item.name}</span>
                        <span className={`gear-tier tier-${item.gear_item.tier?.toLowerCase()}`}>
                          {item.gear_item.tier}
                        </span>
                        <button className="btn-remove" onClick={() => handleRemoveGear(item.id)}>✕</button>
                      </div>
                    ) : (
                      <button className="btn-add-gear" onClick={() => setActiveSlot(slot)}>
                        + Add Gear
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="editor-right">
        {activeSlot && (
          <GearSearch
            slot={activeSlot}
            onSelect={handleAddGear}
            onClose={() => setActiveSlot(null)}
          />
        )}
        {build && !activeSlot && (
          <AIPanel
            onRecommend={handleAIRecommend}
            response={aiResponse}
            loading={aiLoading}
          />
        )}
      </div>
    </div>
  );
}

export default BuildEditorPage;