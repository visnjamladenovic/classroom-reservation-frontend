import { useState } from "react";
import { apiFetch, setAuth } from "../api";

export default function AuthScreen({ onAuth })    
{
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

        <Field
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />

        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
        />

        {mode === "register" && (
          <>
            <Field
              label="First Name"
              value={form.firstName}
              onChange={(v) => setForm({ ...form, firstName: v })}
            />
            <Field
              label="Last Name"
              value={form.lastName}
              onChange={(v) => setForm({ ...form, lastName: v })}
            />
            <Field
              label="Phone"
              value={form.phoneNumber}
              onChange={(v) => setForm({ ...form, phoneNumber: v })}
            />
          </>
        )}

        {error && (
          <div style={{ color: "#ef4444", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Loading..." : mode === "login" ? "Login" : "Register"}
        </button>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#94a3b8",
            cursor: "pointer",
          }}
          onClick={() =>
            setMode(mode === "login" ? "register" : "login")
          }
        >
          {mode === "login"
            ? "No account? Register"
            : "Already have an account? Login"}
        </div>
      </div>
    </div>
  );
}