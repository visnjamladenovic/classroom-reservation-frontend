import { useState, useEffect } from "react";
import { apiFetch, getRole } from "../api";
import StatusBadge from "../components/StatusBadge";

function StatCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #1e2d3d",
        borderRadius: 10,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accent || "#2563eb",
        }}
      />
      <div
        style={{
          fontSize: 11,
          color: "#6b7c8d",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#e8edf2",
          lineHeight: 1,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#4a5568", marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StatsTable({ title, accent, rows, columns }) {
  return (
    <div
      style={{
        background: "#0d1117",
        border: "1px solid #1e2d3d",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #1e2d3d",
          fontSize: 13,
          fontWeight: 600,
          color: "#e8edf2",
          fontFamily: "'IBM Plex Mono', monospace",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accent || "#2563eb",
            display: "inline-block",
          }}
        />
        {title}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "10px 18px",
                  textAlign: col.align || "left",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4a5568",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'IBM Plex Mono', monospace",
                  borderBottom: "1px solid #1e2d3d",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: i < rows.length - 1 ? "1px solid #141d27" : "none",
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "11px 18px",
                    fontSize: 12,
                    color: col.highlight ? "#e8edf2" : "#6b7c8d",
                    fontFamily: "'IBM Plex Mono', monospace",
                    textAlign: col.align || "left",
                    fontWeight: col.highlight ? 600 : 400,
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardView({ addToast }) {
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = getRole() === "Admin";

  useEffect(() => {
    const requests = [
      apiFetch(isAdmin ? "/reservation" : "/reservation/my").catch(() => []),
      apiFetch("/classroom").catch(() => []),
    ];
    if (isAdmin) {
      requests.push(apiFetch("/reservation/stats").catch(() => null));
    }

    Promise.all(requests).then(([r, c, s]) => {
      setReservations(r || []);
      setClassrooms(c || []);
      if (s) setStats(s);
      setLoading(false);
    });
  }, [isAdmin]);

  const pending = reservations.filter((r) => r.status === "Pending").length;
  const approved = reservations.filter((r) => r.status === "Approved").length;
  const upcoming = reservations.filter(
    (r) => r.status === "Approved" && new Date(r.startTime) > new Date()
  ).length;
  const activeRooms = classrooms.filter((c) => c.isActive).length;

  const recent = [...reservations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <h2
        style={{
          margin: "0 0 6px",
          fontSize: 20,
          fontWeight: 700,
          color: "#e8edf2",
        }}
      >
        Dashboard
      </h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7c8d" }}>
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      {loading ? (
        <div style={{ color: "#6b7c8d", fontSize: 13 }}>Loading...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="Total Reservations"
              value={reservations.length}
              accent="#2563eb"
            />
            <StatCard
              label="Pending"
              value={pending}
              sub="awaiting approval"
              accent="#F0AD4E"
            />
            <StatCard
              label="Upcoming"
              value={upcoming}
              sub="approved & future"
              accent="#198754"
            />
            <StatCard
              label={isAdmin ? "Active Rooms" : "Approved"}
              value={isAdmin ? activeRooms : approved}
              accent="#6f42c1"
            />
          </div>

          {/* Recent Reservations Table */}
          <div
            style={{
              background: "#0d1117",
              border: "1px solid #1e2d3d",
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #1e2d3d",
                fontSize: 13,
                fontWeight: 600,
                color: "#e8edf2",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              Recent Reservations
            </div>
            {recent.length === 0 ? (
              <div
                style={{
                  padding: "40px 18px",
                  textAlign: "center",
                  color: "#4a5568",
                  fontSize: 13,
                }}
              >
                No reservations yet
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Title", "Room", "Professor", "Date", "Status"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 18px",
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
                  {recent.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom:
                          i < recent.length - 1 ? "1px solid #141d27" : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 18px",
                          fontSize: 13,
                          color: "#e8edf2",
                        }}
                      >
                        {r.title}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          fontSize: 12,
                          color: "#6b7c8d",
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {r.roomNumber} — {r.classroomName}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          fontSize: 12,
                          color: "#6b7c8d",
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {r.userFullName}
                      </td>
                      <td
                        style={{
                          padding: "12px 18px",
                          fontSize: 12,
                          color: "#6b7c8d",
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}
                      >
                        {new Date(r.startTime).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Statistics (Admin only) */}
          {isAdmin && stats && (
            <>
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#6b7c8d",
                  fontFamily: "'IBM Plex Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Statistics
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <StatsTable
                  title="Reservations by Classroom"
                  accent="#2563eb"
                  columns={[
                    { key: "room", label: "Room", highlight: true },
                    { key: "name", label: "Name" },
                    { key: "count", label: "Reservations", align: "right", highlight: true },
                  ]}
                  rows={stats.byClassroom.map((item) => ({
                    room: item.roomNumber,
                    name: item.classroomName,
                    count: item.count,
                  }))}
                />
                <StatsTable
                  title="Reservations by Professor"
                  accent="#6f42c1"
                  columns={[
                    { key: "name", label: "Professor", highlight: true },
                    { key: "count", label: "Reservations", align: "right", highlight: true },
                  ]}
                  rows={stats.byUser.map((item) => ({
                    name: item.userFullName,
                    count: item.count,
                  }))}
                />
                <StatsTable
                  title="Reservations by Status"
                  accent="#F0AD4E"
                  columns={[
                    { key: "status", label: "Status", highlight: true },
                    { key: "count", label: "Count", align: "right", highlight: true },
                  ]}
                  rows={Object.entries(stats.byStatus).map(([status, count]) => ({
                    status,
                    count,
                  }))}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
