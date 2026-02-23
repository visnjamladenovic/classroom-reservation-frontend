import { useState } from "react";
import { apiFetch } from "../api";
import Modal from "./Modal";
import Field, { inputStyle } from "./Field";

export default function ClassroomModal({ room, onClose, onSaved, addToast }) {
  const [form, setForm] = useState({
    name: room?.name || "",
    roomNumber: room?.roomNumber || "",
    location: room?.location || "",
    capacity: room?.capacity || "",
    classroomType: room?.classroomType || "Lecture",
    hasProjector: room?.hasProjector || false,
    hasWhiteboard: room?.hasWhiteboard || false,
    hasComputers: room?.hasComputers || false,
    description: room?.description || "",
    isActive: room?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      if (room) {
        await apiFetch(`/classroom/${room.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) }),
        });
      } else {
        await apiFetch("/classroom", {
          method: "POST",
          body: JSON.stringify({ ...form, capacity: parseInt(form.capacity) }),
        });
      }
      onSaved();
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function Checkbox({ fieldKey, label }) {
    return (
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          fontSize: 12,
          color: "#6b7c8d",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <input
          type="checkbox"
          checked={form[fieldKey]}
          onChange={(e) => setForm({ ...form, [fieldKey]: e.target.checked })}
          style={{ accentColor: "#2563eb" }}
        />
        {label}
      </label>
    );
  }

  return (
    <Modal title={room ? "Edit Classroom" : "Add Classroom"} onClose={onClose}>
      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Room number">
          <input
            style={inputStyle}
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
            placeholder="A-101"
          />
        </Field>
        <Field label="Name">
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Main Lecture Hall"
          />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Location">
          <input
            style={inputStyle}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Building A, Floor 1"
          />
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            style={inputStyle}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            placeholder="60"
            min={1}
          />
        </Field>
      </div>

      <Field label="Type">
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={form.classroomType}
          onChange={(e) => setForm({ ...form, classroomType: e.target.value })}
        >
          {["Lecture", "Lab", "Seminar", "Conference"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field label="Description (optional)">
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </Field>

      <Field label="Equipment & Status">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
          <Checkbox fieldKey="hasProjector" label="Has Projector" />
          <Checkbox fieldKey="hasWhiteboard" label="Has Whiteboard" />
          <Checkbox fieldKey="hasComputers" label="Has Computers" />
          {room && <Checkbox fieldKey="isActive" label="Active" />}
        </div>
      </Field>

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "transparent",
            border: "1px solid #1e2d3d",
            borderRadius: 7,
            color: "#6b7c8d",
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: "pointer",
          }}
        >
          CANCEL
        </button>
        <button
          onClick={submit}
          disabled={loading}
          style={{
            flex: 2,
            padding: "10px 0",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            border: "none",
            borderRadius: 7,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "SAVING..." : room ? "UPDATE" : "CREATE"}
        </button>
      </div>
    </Modal>
  );
}