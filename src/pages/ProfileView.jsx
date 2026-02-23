import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Field, { inputStyle } from "../components/Field";

export default function ProfileView({ addToast }) {
  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/user/me")
      .then((u) => {
        setUser(u);
        setEditForm({
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: u.phoneNumber || "",
        });
      })
      .catch((e) => addToast(e.message, "error"));
  }, []);

  async function saveProfile() {
    setLoading(true);
    try {
      const updated = await apiFetch("/user/me", {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setUser(updated);
      addToast("Profile updated!", "success");
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    setLoading(true);
    try {
      await apiFetch("/user/me/change-password", {
        method: "POST",
        body: JSON.stringify(pwForm),
      });
      setPwForm({ currentPassword: "", newPassword: "" });
      addToast("Password changed!", "success");
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (!user || !editForm)
    return <div style={{ color: "#6b7c8d", fontSize: 13 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 520 }}>
      <h2
        style={{
          margin: "0 0 20px",
          fontSize: 20,
          fontWeight: 700,
          color: "#e8edf2",
        }}
      >
        Profile
      </h2>

      {/* Personal info card */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #1e2d3d",
          borderRadius: 10,
          padding: 22,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7c8d",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontFamily: "'IBM Plex Mono', monospace",
            marginBottom: 16,
          }}
        >
          Personal info
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Field label="First name">
            <input
              style={inputStyle}
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm({ ...editForm, firstName: e.target.value })
              }
            />
          </Field>
          <Field label="Last name">
            <input
              style={inputStyle}
              value={editForm.lastName}
              onChange={(e) =>
                setEditForm({ ...editForm, lastName: e.target.value })
              }
            />
          </Field>
        </div>

        <Field label="Phone number">
          <input
            style={inputStyle}
            value={editForm.phoneNumber}
            onChange={(e) =>
              setEditForm({ ...editForm, phoneNumber: e.target.value })
            }
            placeholder="+1 555 0100"
          />
        </Field>

        <div
          style={{
            fontSize: 12,
            color: "#4a5568",
            marginBottom: 14,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          Email:{" "}
          <span style={{ color: "#6b7c8d" }}>{user.email}</span>
          {" · "}Role:{" "}
          <span style={{ color: "#F0AD4E" }}>{user.role}</span>
        </div>

        <button
          onClick={saveProfile}
          disabled={loading}
          style={{
            padding: "9px 20px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            border: "none",
            borderRadius: 7,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "SAVING..." : "SAVE CHANGES"}
        </button>
      </div>

      {/* Change password card */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #1e2d3d",
          borderRadius: 10,
          padding: 22,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7c8d",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontFamily: "'IBM Plex Mono', monospace",
            marginBottom: 16,
          }}
        >
          Change password
        </div>

        <Field label="Current password">
          <input
            type="password"
            style={inputStyle}
            value={pwForm.currentPassword}
            onChange={(e) =>
              setPwForm({ ...pwForm, currentPassword: e.target.value })
            }
            placeholder="••••••••"
          />
        </Field>

        <Field label="New password">
          <input
            type="password"
            style={inputStyle}
            value={pwForm.newPassword}
            onChange={(e) =>
              setPwForm({ ...pwForm, newPassword: e.target.value })
            }
            placeholder="Min 8 characters"
          />
        </Field>

        <button
          onClick={changePassword}
          disabled={loading || !pwForm.currentPassword || !pwForm.newPassword}
          style={{
            padding: "9px 20px",
            background: "#1e2d3d",
            border: "1px solid #2d3d4d",
            borderRadius: 7,
            color: "#e8edf2",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: loading ? "not-allowed" : "pointer",
            opacity:
              loading || !pwForm.currentPassword || !pwForm.newPassword
                ? 0.5
                : 1,
          }}
        >
          {loading ? "UPDATING..." : "UPDATE PASSWORD"}
        </button>
      </div>
    </div>
  );
}