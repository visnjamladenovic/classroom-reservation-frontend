import { useState, useEffect, useCallback } from "react";
import { apiFetch, getRole } from "../api";
import ClassroomModal from "../components/ClassroomModal";
import { inputStyle } from "../components/inputStyle";

const TYPE_COLORS = {
  Lecture: "#2563eb",
  Lab: "#198754",
  Seminar: "#6f42c1",
  Conference: "#F0AD4E",
};

function Tag({ children, color }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: color || "#2563eb",
        background: color ? `${color}18` : "#2563eb18",
        border: `1px solid ${color || "#2563eb"}33`,
        padding: "2px 7px",
        borderRadius: 4,
        fontFamily: "'IBM Plex Mono', monospace",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </span>
  );
}

export default function ClassroomsView({ addToast }) {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const isAdmin = getRole() === "Admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filterType) params.set("type", filterType);
      if (filterActive !== "") params.set("isActive", filterActive);
      const query = params.toString() ? `?${params.toString()}` : "";
      const data = await apiFetch(`/classroom${query}`);
      setClassrooms(data || []);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterActive, addToast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleDelete(id) {
    if (!confirm("Delete this classroom?")) return;
    try {
      await apiFetch(`/classroom/${id}`, { method: "DELETE" });
      addToast("Classroom deleted", "success");
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  function clearFilters() {
    setSearch("");
    setFilterType("");
    setFilterActive("");
  }

  const hasFilters = search || filterType || filterActive !== "";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              margin: "0 0 2px",
              fontSize: 20,
              fontWeight: 700,
              color: "#e8edf2",
            }}
          >
            Classrooms
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7c8d" }}>
            {classrooms.filter((c) => c.isActive).length} of{" "}
            {classrooms.length} active
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              borderRadius: 7,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            + ADD ROOM
          </button>
        )}
      </div>

      {/* Search & filter bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search input with icon */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#4a5568",
              fontSize: 13,
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            style={{ ...inputStyle, paddingLeft: 28 }}
            placeholder="Search by name, room number, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            ...inputStyle,
            width: "auto",
            padding: "9px 12px",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          <option value="">All types</option>
          {["Lecture", "Lab", "Seminar", "Conference"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Active filter */}
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          style={{
            ...inputStyle,
            width: "auto",
            padding: "9px 12px",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          <option value="">All statuses</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>

        {/* Clear button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: "9px 14px",
              background: "transparent",
              border: "1px solid #1e2d3d",
              borderRadius: 6,
              color: "#6b7c8d",
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flex: "0 0 auto",
            }}
          >
            ✕ CLEAR
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: "#6b7c8d", fontSize: 13 }}>Loading...</div>
      ) : classrooms.length === 0 ? (
        <div
          style={{
            background: "#0d1117",
            border: "1px solid #1e2d3d",
            borderRadius: 10,
            padding: "60px 20px",
            textAlign: "center",
            color: "#4a5568",
            fontSize: 13,
          }}
        >
          {hasFilters ? "No classrooms match your search" : "No classrooms found"}
          {hasFilters && (
            <div style={{ marginTop: 10 }}>
              <button
                onClick={clearFilters}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace",
                  textDecoration: "underline",
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {classrooms.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#0d1117",
                border: "1px solid #1e2d3d",
                borderRadius: 10,
                padding: 18,
                opacity: c.isActive ? 1 : 0.5,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top accent bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background:
                    TYPE_COLORS[c.classroomType] || TYPE_COLORS.Lecture,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#e8edf2",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {c.roomNumber}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7c8d" }}>
                    {c.name}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color:
                      TYPE_COLORS[c.classroomType] || TYPE_COLORS.Lecture,
                    background: `${TYPE_COLORS[c.classroomType] || TYPE_COLORS.Lecture}18`,
                    padding: "3px 8px",
                    borderRadius: 4,
                    fontFamily: "'IBM Plex Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {c.classroomType}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#4a5568",
                      textTransform: "uppercase",
                    }}
                  >
                    Capacity
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7c8d" }}>
                    {c.capacity} seats
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#4a5568",
                      textTransform: "uppercase",
                    }}
                  >
                    Location
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7c8d" }}>
                    {c.location}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                {c.hasProjector && <Tag>Projector</Tag>}
                {c.hasWhiteboard && <Tag>Whiteboard</Tag>}
                {c.hasComputers && <Tag>Computers</Tag>}
                {!c.isActive && <Tag color="#DC3545">Inactive</Tag>}
              </div>

              {c.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#4a5568",
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  {c.description}
                </div>
              )}

              {isAdmin && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setEditRoom(c)}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      background: "#1e2d3d",
                      border: "none",
                      borderRadius: 5,
                      color: "#e8edf2",
                      fontSize: 11,
                      fontFamily: "'IBM Plex Mono', monospace",
                      cursor: "pointer",
                    }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      padding: "7px 12px",
                      background: "transparent",
                      border: "1px solid #5c1212",
                      borderRadius: 5,
                      color: "#DC3545",
                      fontSize: 11,
                      fontFamily: "'IBM Plex Mono', monospace",
                      cursor: "pointer",
                    }}
                  >
                    DEL
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <ClassroomModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            load();
            addToast("Classroom created!", "success");
          }}
          addToast={addToast}
        />
      )}

      {editRoom && (
        <ClassroomModal
          room={editRoom}
          onClose={() => setEditRoom(null)}
          onSaved={() => {
            setEditRoom(null);
            load();
            addToast("Classroom updated!", "success");
          }}
          addToast={addToast}
        />
      )}
    </div>
  );
}