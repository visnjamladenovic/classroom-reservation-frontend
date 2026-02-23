import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../api";
import ActionBtn from "../components/ActionBtn";
import { inputStyle } from "../components/inputStyle";

export default function UsersView({ addToast }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(
        `/user${search ? `?search=${encodeURIComponent(search)}` : ""}`
      );
      setUsers(data || []);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleActive(user) {
    try {
      await apiFetch(`/user/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      addToast(
        `User ${!user.isActive ? "activated" : "deactivated"}`,
        "success"
      );
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  async function toggleRole(user) {
    const newRole = user.role === "Admin" ? "User" : "Admin";
    try {
      await apiFetch(`/user/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      addToast(`Role changed to ${newRole}`, "success");
      load();
    } catch (e) {
      addToast(e.message, "error");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await apiFetch(`/user/${id}`, { method: "DELETE" });
      addToast("User deleted", "success");
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
            Users
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7c8d" }}>
            {users.length} total users
          </p>
        </div>
        <input
          style={{ ...inputStyle, width: 240 }}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ color: "#6b7c8d", fontSize: 13 }}>Loading...</div>
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
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom:
                      i < users.length - 1 ? "1px solid #141d27" : "none",
                  }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: `hsl(${
                            (u.firstName.charCodeAt(0) * 20) % 360
                          }, 50%, 25%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#e8edf2",
                          flexShrink: 0,
                        }}
                      >
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "#e8edf2" }}>
                          {u.firstName} {u.lastName}
                        </div>
                        {u.phoneNumber && (
                          <div style={{ fontSize: 11, color: "#4a5568" }}>
                            {u.phoneNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#6b7c8d",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {u.email}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: u.role === "Admin" ? "#F0AD4E" : "#6b7c8d",
                        background:
                          u.role === "Admin" ? "#F0AD4E18" : "#6b7c8d18",
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: u.isActive ? "#198754" : "#DC3545",
                        background: u.isActive ? "#19875418" : "#DC354518",
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#4a5568",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <ActionBtn
                        onClick={() => toggleRole(u)}
                        color="#F0AD4E"
                        label="★"
                        title={
                          u.role === "Admin"
                            ? "Demote to User"
                            : "Promote to Admin"
                        }
                      />
                      <ActionBtn
                        onClick={() => toggleActive(u)}
                        color={u.isActive ? "#DC3545" : "#198754"}
                        label={u.isActive ? "⊗" : "✓"}
                        title={u.isActive ? "Deactivate" : "Activate"}
                      />
                      <ActionBtn
                        onClick={() => handleDelete(u.id)}
                        color="#6b7c8d"
                        label="🗑"
                        title="Delete user"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}