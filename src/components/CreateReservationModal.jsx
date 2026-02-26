import { useState } from "react";
import { apiFetch } from "../api";
import Modal from "./Modal";
import Field from "./Field";
import { inputStyle } from "./inputStyle";

export default function CreateReservationModal({
  classrooms,
  onClose,
  onCreated,
  addToast,
}) {
  const active = classrooms.filter((c) => c.isActive);

  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  const later = new Date(now.getTime() + 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    classroomId: active[0]?.id || "",
    title: "",
    description: "",
    startTime: fmt(now),
    endTime: fmt(later),
    purpose: "Lecture",
    attendeeCount: "",
  });
  const [loading, setLoading] = useState(false);

 async function submit() {
  setLoading(true);

  const [startDateStr, startTimeStr] = form.startTime.split("T");
  const [endDateStr, endTimeStr] = form.endTime.split("T");
  const startHour = parseInt(startTimeStr.split(":")[0]);
  const endHour = parseInt(endTimeStr.split(":")[0]);
  const endMinute = parseInt(endTimeStr.split(":")[1]);

  if (startHour < 8 || startHour > 19) {
    addToast("Reservations can only start between 08:00 and 20:00.", "error");
    setLoading(false);
    return;
  }

  if (endHour > 20 || (endHour === 20 && endMinute > 0)) {
    addToast("Reservations must end by 20:00.", "error");
    setLoading(false);
    return;
  }

  const selectedClassroom = active.find(c => c.id === form.classroomId);
  if (selectedClassroom && form.attendeeCount && parseInt(form.attendeeCount) > selectedClassroom.capacity) {
    addToast(`Attendee count exceeds classroom capacity (${selectedClassroom.capacity}).`, "error");
    setLoading(false);
    return;
  }

  const start = new Date(form.startTime);
  const end = new Date(form.endTime);

  try {
    await apiFetch("/reservation", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        attendeeCount: form.attendeeCount ? parseInt(form.attendeeCount) : null,
      }),
    });
    onCreated();
  } catch (e) {
    addToast(e.message, "error");
  } finally {
    setLoading(false);
  }
}

  return (
    <Modal title="New Reservation" onClose={onClose}>
      <Field label="Classroom">
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={form.classroomId}
          onChange={(e) => setForm({ ...form, classroomId: e.target.value })}
        >
          {active.map((c) => (
            <option key={c.id} value={c.id}>
              {c.roomNumber} — {c.name} (cap. {c.capacity})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Title">
        <input
          style={inputStyle}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Lecture on Algorithms"
        />
      </Field>

      <Field label="Description (optional)">
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Additional details..."
        />
      </Field>

      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Start time">
          <input
            type="datetime-local"
            style={inputStyle}
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </Field>
        <Field label="End time">
          <input
            type="datetime-local"
            style={inputStyle}
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Field label="Purpose">
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
          >
            {["Lecture", "Lab", "Seminar", "Exam", "Meeting", "Workshop", "Other"].map(
              (p) => (
                <option key={p}>{p}</option>
              )
            )}
          </select>
        </Field>
        <Field label="Attendees (optional)">
          <input
            type="number"
            style={inputStyle}
            value={form.attendeeCount}
            onChange={(e) =>
              setForm({ ...form, attendeeCount: e.target.value })
            }
            placeholder="30"
            min={1}
          />
        </Field>
      </div>

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
          disabled={loading || !form.title || !form.classroomId}
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
            opacity: loading || !form.title || !form.classroomId ? 0.6 : 1,
          }}
        >
          {loading ? "CREATING..." : "CREATE RESERVATION"}
        </button>
      </div>
    </Modal>
  );
}