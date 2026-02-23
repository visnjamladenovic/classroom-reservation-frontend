import { useState, useEffect, useCallback } from "react";
import { apiFetch, getRole } from "../api";
import StatusBadge from "../components/StatusBadge";
import ActionBtn from "../components/ActionBtn";
import CreateReservationModal from "../components/CreateReservationModal";
import { inputStyle } from "../components/Field";

export default function ReservationsView({ addToast }) {
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const isAdmin = getRole() === "Admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        apiFetch(
          isAdmin
            ? `/reservation${filterStatus ? `?status=${filterStatus}` : ""}`
            : `/reservation/my${filterStatus ? `?status=${filterStatus}` : ""}`
        ),
        apiFetch("/classroom"),
      ]);
      setReservations(r || []);
      setClassrooms(c || []);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filterStatus]);

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
            Reservations
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7c8d" }}>
            {isAdmin ? "All system reservations" : "Your reservations"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, width: "auto", padding: "8px 12px", cursor: "pointer" }}
          >
            <option value="">All statuses</option>
            {["Pending", "Approved", "Rejected", "Cancelled"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
      </div>

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
          No reservations found
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