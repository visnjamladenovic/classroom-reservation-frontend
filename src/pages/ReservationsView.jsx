import { useState, useEffect, useCallback } from "react";
import { apiFetch, getRole } from "../api";
import StatusBadge from "../components/StatusBadge";
import ActionBtn from "../components/ActionBtn";
import CreateReservationModal from "../components/CreateReservationModal";
import { inputStyle } from "../components/inputStyle";

// ── tiny inline mini-calendar ─────────────────────────────────────────────────
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function MiniCalendar({ selected, onChange, onClear }) {
  const today = new Date();
  const [view, setView] = useState(() => {
    const d = selected ? new Date(selected) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  function prevMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }
  function nextMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function toDateStr(day) {
    const mm = String(view.month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${view.year}-${mm}-${dd}`;
  }

  function isToday(day) {
    return (
      view.year === today.getFullYear() &&
      view.month === today.getMonth() &&
      day === today.getDate()
    );
  }

  function isSelected(day) {
    return selected === toDateStr(day);
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        zIndex: 200,
        background: "#111418",
        border: "1px solid #222b36",
        borderRadius: 10,
        padding: 14,
        width: 248,
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      }}
    >
      {/* Month nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <button onClick={prevMonth} style={navBtnStyle}>‹</button>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#e8edf2",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {MONTHS[view.month]} {view.year}
        </span>
        <button onClick={nextMonth} style={navBtnStyle}>›</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "#4a5568",
              fontFamily: "'IBM Plex Mono', monospace",
              padding: "2px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={day}
              onClick={() => {
                const s = toDateStr(day);
                onChange(sel ? "" : s);
              }}
              style={{
                width: "100%",
                aspectRatio: "1",
                border: tod && !sel ? "1px solid #2563eb44" : "1px solid transparent",
                borderRadius: 5,
                background: sel ? "#2563eb" : "transparent",
                color: sel ? "#fff" : tod ? "#2563eb" : "#9aa5b4",
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                cursor: "pointer",
                fontWeight: sel || tod ? 700 : 400,
                transition: "all 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!sel) e.currentTarget.style.background = "#1e2d3d";
              }}
              onMouseLeave={(e) => {
                if (!sel) e.currentTarget.style.background = "transparent";
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid #1e2d3d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => {
            const now = new Date();
            setView({ year: now.getFullYear(), month: now.getMonth() });
            onChange(
              `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
            );
          }}
          style={{
            background: "none",
            border: "none",
            color: "#2563eb",
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: "pointer",
          }}
        >
          Today
        </button>
        {selected && (
          <button
            onClick={onClear}
            style={{
              background: "none",
              border: "none",
              color: "#6b7c8d",
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              cursor: "pointer",
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}

const navBtnStyle = {
  background: "none",
  border: "1px solid #1e2d3d",
  borderRadius: 5,
  color: "#6b7c8d",
  cursor: "pointer",
  width: 24,
  height: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  lineHeight: 1,
};

// ── DatePickerButton ──────────────────────────────────────────────────────────
function DatePickerButton({ value, onChange }) {
  const [open, setOpen] = useState(false);

  function fmt(dateStr) {
    if (!dateStr) return "Pick a date";
    const [y, m, d] = dateStr.split("-");
    return `${MONTHS[parseInt(m) - 1].slice(0, 3)} ${parseInt(d)}, ${y}`;
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          border: value
            ? "1px solid #2563eb66"
            : "1px solid #222b36",
          background: value ? "#2563eb0d" : "#0d1117",
          color: value ? "#e8edf2" : "#4a5568",
          whiteSpace: "nowrap",
          userSelect: "none",
          width: "auto",
          minWidth: 160,
        }}
      >
        <span style={{ fontSize: 13 }}>📅</span>
        <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
          {fmt(value)}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#4a5568" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 199 }}
            onClick={() => setOpen(false)}
          />
          <MiniCalendar
            selected={value}
            onChange={(d) => {
              onChange(d);
              if (d) setOpen(false);
            }}
            onClear={() => {
              onChange("");
              setOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function ReservationsView({ addToast }) {
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const isAdmin = getRole() === "Admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterDate) {
        // send start-of-day and end-of-day for the selected date
        params.set("date", filterDate);
      }
      const query = params.toString() ? `?${params.toString()}` : "";
      const [r, c] = await Promise.all([
        apiFetch(isAdmin ? `/reservation${query}` : `/reservation/my${query}`),
        apiFetch("/classroom"),
      ]);
      setReservations(r || []);
      setClassrooms(c || []);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filterStatus, filterDate, addToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id, status) {
    try {
      await apiFetch(`/reservation/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      addToast(`Reservation ${status.toLowerCase()}`, "success");
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  async function handleCancel(id) {
    try {
      await apiFetch(`/reservation/${id}/cancel`, { method: "PATCH" });
      addToast("Reservation cancelled", "success");
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this reservation?")) return;
    try {
      await apiFetch(`/reservation/${id}`, { method: "DELETE" });
      addToast("Reservation deleted", "success");
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  function clearFilters() {
    setFilterStatus("");
    setFilterDate("");
  }

  const hasFilters = filterStatus || filterDate;

  function fmtDateLabel(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split("-");
    const today = new Date();
    const sel = new Date(Number(y), Number(m) - 1, Number(d));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    if (dateStr === todayStr) return "Today";
    return `${MONTHS[Number(m)-1].slice(0,3)} ${parseInt(d)}, ${y}`;
  }

  return (
    <div>
      {/* Header */}
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
            Reservations
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7c8d" }}>
            {isAdmin ? "All system reservations" : "Your reservations"}
            {filterDate && (
              <span style={{ color: "#2563eb", marginLeft: 6 }}>
                · {fmtDateLabel(filterDate)}
              </span>
            )}
          </p>
        </div>
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
          + NEW
        </button>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Date picker */}
        <DatePickerButton value={filterDate} onChange={setFilterDate} />

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            ...inputStyle,
            width: "auto",
            padding: "9px 12px",
            cursor: "pointer",
          }}
        >
          <option value="">All statuses</option>
          {["Pending", "Approved", "Rejected", "Cancelled"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Active filter indicator + clear */}
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
            }}
          >
            ✕ CLEAR
          </button>
        )}

        {/* Result count */}
        {!loading && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "#4a5568",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {reservations.length} result{reservations.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: "#6b7c8d", fontSize: 13 }}>Loading...</div>
      ) : reservations.length === 0 ? (
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
          {hasFilters
            ? `No reservations found${filterDate ? ` for ${fmtDateLabel(filterDate)}` : ""}`
            : "No reservations yet"}
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
            background: "#0d1117",
            border: "1px solid #1e2d3d",
            borderRadius: 10,
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Title",
                  "Room",
                  ...(isAdmin ? ["User"] : []),
                  "Time",
                  "Purpose",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#4a5568",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontFamily: "'IBM Plex Mono', monospace",
                      borderBottom: "1px solid #1e2d3d",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, i) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom:
                      i < reservations.length - 1
                        ? "1px solid #141d27"
                        : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#e8edf2",
                      maxWidth: 180,
                    }}
                  >
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.title}
                    </div>
                    {r.description && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#4a5568",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#6b7c8d",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    <div>{r.roomNumber}</div>
                    <div style={{ fontSize: 11, color: "#4a5568" }}>
                      {r.classroomName}
                    </div>
                  </td>
                  {isAdmin && (
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#6b7c8d",
                      }}
                    >
                      <div>{r.userFullName}</div>
                      <div style={{ fontSize: 11, color: "#4a5568" }}>
                        {r.userEmail}
                      </div>
                    </td>
                  )}
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 11,
                      color: "#6b7c8d",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    <div>{new Date(r.startTime).toLocaleDateString()}</div>
                    <div>
                      {new Date(r.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      —{" "}
                      {new Date(r.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#6b7c8d",
                    }}
                  >
                    {r.purpose}
                    {r.attendeeCount && (
                      <div style={{ fontSize: 11, color: "#4a5568" }}>
                        {r.attendeeCount} attendees
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={r.status} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {isAdmin && r.status === "Pending" && (
                        <>
                          <ActionBtn
                            onClick={() => handleApprove(r.id, "Approved")}
                            color="#198754"
                            label="✓"
                            title="Approve"
                          />
                          <ActionBtn
                            onClick={() => handleApprove(r.id, "Rejected")}
                            color="#DC3545"
                            label="✗"
                            title="Reject"
                          />
                        </>
                      )}
                      {!isAdmin && r.status === "Pending" && (
                        <ActionBtn
                          onClick={() => handleCancel(r.id)}
                          color="#F0AD4E"
                          label="⊗"
                          title="Cancel"
                        />
                      )}
                      <ActionBtn
                        onClick={() => handleDelete(r.id)}
                        color="#6b7c8d"
                        label="🗑"
                        title="Delete"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateReservationModal
          classrooms={classrooms}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
            addToast("Reservation created!", "success");
          }}
          addToast={addToast}
        />
      )}
    </div>
  );
}