export default function Toast({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 9999,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "error" ? "#1a0a0a" : "#0a1a0f",
            color: t.type === "error" ? "#ff6b6b" : "#69db7c",
            border: `1px solid ${t.type === "error" ? "#5c1212" : "#1a4a24"}`,
            padding: "12px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "'IBM Plex Mono', monospace",
            minWidth: 260,
            animation: "slideIn 0.2s ease",
          }}
        >
          {t.type === "error" ? "✗ " : "✓ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}