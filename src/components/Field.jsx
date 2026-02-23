export default function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "#6b7c8d",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}