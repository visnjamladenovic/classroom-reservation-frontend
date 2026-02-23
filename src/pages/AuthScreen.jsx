import { useState } from "react";
import { apiFetch, setAuth } from "../api";
import Field from "../components/Field";
import { inputStyle } from "../components/inputStyle";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;

      const data = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setAuth(data);
      onAuth(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'IBM Plex Mono', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(30,60,100,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,60,100,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Auth Card */}
      <div
        style={{
          width: 400,
          padding: 40,
          background: "#0f172a",
          borderRadius: 16,
          boxShadow: "0 0 40px rgba(37,99,235,0.15)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <h2 style={{ marginBottom: 24, color: "#fff" }}>
          {mode === "login" ? "Login" : "Register"}
        </h2>

        <Field label="Email">
          <input
            style={inputStyle}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@university.edu"
          />
        </Field>

        <Field label="Password">
          <input
            style={inputStyle}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>

        {mode === "register" && (
          <>
            <Field label="First Name">
              <input
                style={inputStyle}
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                placeholder="Jane"
              />
            </Field>
            <Field label="Last Name">
              <input
                style={inputStyle}
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                placeholder="Doe"
              />
            </Field>
            <Field label="Phone (optional)">
              <input
                style={inputStyle}
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                placeholder="+1 555 0100"
              />
            </Field>
          </>
        )}

        {error && (
          <div
            style={{
              background: "#1a0a0a",
              border: "1px solid #5c1212",
              color: "#ff6b6b",
              borderRadius: 6,
              padding: "10px 12px",
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: loading ? "#1e2d3d" : "#2563eb",
            color: loading ? "#4a5568" : "white",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          {loading ? "..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 13,
          }}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "No account? Register"
            : "Already have an account? Login"}
        </div>
      </div>
    </div>
  );
}