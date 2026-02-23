export default function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111418",
          border: "1px solid #222b36",
          borderRadius: 12,
          padding: 28,
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#e8edf2",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#6b7c8d",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}