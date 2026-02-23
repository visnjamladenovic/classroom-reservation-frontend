import { useState, useEffect, useCallback } from "react";
import { apiFetch, getRole } from "../api";
import ClassroomModal from "../components/ClassroomModal";

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
  const isAdmin = getRole() === "Admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/classroom");
      setClassrooms(data || []);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
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

      {loading ? (
        <div style={{ color: "#6b7c8d", fontSize: 13 }}>Loading...</div>
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