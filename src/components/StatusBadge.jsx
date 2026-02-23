const STATUS_COLORS = {
  Pending: { bg: "#FFF3CD", text: "#856404", dot: "#F0AD4E" },
  Approved: { bg: "#D1E7DD", text: "#0F5132", dot: "#198754" },
  Rejected: { bg: "#F8D7DA", text: "#842029", dot: "#DC3545" },
  Cancelled: { bg: "#E2E3E5", text: "#495057", dot: "#6C757D" },
};

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        letterSpacing: "0.03em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}