import {getRole, getEmail } from "../api";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "reservations", label: "Reservations", icon: "📅" },
  { id: "classrooms", label: "Classrooms", icon: "🏫" },
  { id: "users", label: "Users", icon: "👥", adminOnly: true },
  { id: "profile", label: "Profile", icon: "⚙" },
];

export default function Sidebar({ active, onNav, onLogout }) {
  const isAdmin = getRole() === "Admin";
  const email = getEmail();

  return (
    <div
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#0d1117",
        borderRight: "1px solid #1e2d3d",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "22px 18px 16px",
          borderBottom: "1px solid #1e2d3d",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            🏫
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#e8edf2",
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "-0.01em",
              }}
            >
              ClassroomRes
            </div>
            <div style={{ fontSize: 10, color: "#4a5568" }}>
              {isAdmin ? "Administrator" : "User"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 8px" }}>
        {NAV_ITEMS.filter((n) => !n.adminOnly || isAdmin).map((n) => {
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                marginBottom: 2,
                background: isActive ? "#1e2d3d" : "transparent",
                border: "none",
                borderRadius: 7,
                color: isActive ? "#e8edf2" : "#6b7c8d",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
                textAlign: "left",
                transition: "all 0.12s",
                position: "relative",
              }}
            >
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 18,
                    background: "#2563eb",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
              <span style={{ fontSize: 14 }}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid #1e2d3d" }}>
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 7,
            background: "#080c10",
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 11, color: "#6b7c8d", marginBottom: 2 }}>
            Signed in as
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#e8edf2",
              fontFamily: "'IBM Plex Mono', monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {email}
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "8px 10px",
            background: "transparent",
            border: "1px solid #1e2d3d",
            borderRadius: 7,
            color: "#6b7c8d",
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}