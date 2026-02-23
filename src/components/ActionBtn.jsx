export default function ActionBtn({ onClick, color, label, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28,
        height: 28,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: 5,
        color: color,
        cursor: "pointer",
        fontSize: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {label}
    </button>
  );
}