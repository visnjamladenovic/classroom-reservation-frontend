import { useState, useEffect, useCallback } from "react";
import { apiFetch, getRole } from "../api";
import StatusBadge from "../components/StatusBadge";
import ActionBtn from "../components/ActionBtn";
import CreateReservationModal from "../components/CreateReservationModal";
import { inputStyle } from "../components/inputStyle";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STATUS_DOT = {
  Pending:   "#F0AD4E",
  Approved:  "#198754",
  Rejected:  "#DC3545",
  Cancelled: "#6C757D",
};

function CalendarView({ reservations, onDayClick, selectedDay }) {
  const [view, setView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const firstDay      = new Date(view.year, view.month, 1).getDay();
  const daysInMonth   = new Date(view.year, view.month + 1, 0).getDate();
  const prevMonthDays = new Date(view.year, view.month, 0).getDate();

  const byDay = {};
  reservations.forEach(r => {
    const d   = new Date(r.startTime);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(r);
  });

  function toKey(day) {
    return `${view.year}-${String(view.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: prevMonthDays - firstDay + 1 + i, ghost: true });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, ghost: false });
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++)
    cells.push({ day: i, ghost: true });

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:18, fontWeight:700, color:"#e8edf2", fontFamily:"'IBM Plex Mono', monospace" }}>
            {MONTHS[view.month]} {view.year}
          </span>
          {selectedDay && (
            <span style={{
              fontSize:11, color:"#2563eb", background:"#2563eb18",
              border:"1px solid #2563eb33", borderRadius:4,
              padding:"2px 8px", fontFamily:"'IBM Plex Mono', monospace",
            }}>
              {selectedDay}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button
            onClick={() => setView({ year: today.getFullYear(), month: today.getMonth() })}
            style={{ padding:"6px 12px", background:"transparent", border:"1px solid #1e2d3d",
              borderRadius:6, color:"#6b7c8d", fontSize:11,
              fontFamily:"'IBM Plex Mono', monospace", cursor:"pointer" }}
          >
            Today
          </button>
          <button onClick={() => setView(v => { const d=new Date(v.year,v.month-1,1); return {year:d.getFullYear(),month:d.getMonth()}; })} style={calBtn}>‹</button>
          <button onClick={() => setView(v => { const d=new Date(v.year,v.month+1,1); return {year:d.getFullYear(),month:d.getMonth()}; })} style={calBtn}>›</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", borderBottom:"1px solid #1e2d3d" }}>
        {DAYS_SHORT.map(d => (
          <div key={d} style={{
            padding:"8px 0", textAlign:"center", fontSize:11, fontWeight:600,
            color:"#4a5568", fontFamily:"'IBM Plex Mono', monospace",
            textTransform:"uppercase", letterSpacing:"0.06em",
          }}>{d}</div>
        ))}
      </div>

      <div style={{
        display:"grid", gridTemplateColumns:"repeat(7, 1fr)",
        border:"1px solid #1e2d3d", borderTop:"none",
        borderRadius:"0 0 10px 10px", overflow:"hidden",
      }}>
        {cells.map((cell, idx) => {
          const key       = cell.ghost ? null : toKey(cell.day);
          const events    = key ? (byDay[key] || []) : [];
          const isToday   = key === todayStr;
          const isSel     = key === selectedDay;
          const isWeekend = idx % 7 === 0 || idx % 7 === 6;

          return (
            <div
              key={idx}
              onClick={() => key && onDayClick(isSel ? null : key)}
              style={{
                minHeight: 100,
                padding: "6px 8px",
                borderRight: idx % 7 !== 6 ? "1px solid #141d27" : "none",
                borderBottom: idx < cells.length - 7 ? "1px solid #141d27" : "none",
                background: isSel ? "#2563eb0d" : isWeekend && !cell.ghost ? "#0a0f14" : "#0d1117",
                cursor: cell.ghost ? "default" : "pointer",
                transition: "background 0.1s",
                boxShadow: isSel ? "inset 0 0 0 1px #2563eb44" : "none",
              }}
              onMouseEnter={e => { if (!cell.ghost && !isSel) e.currentTarget.style.background = "#111820"; }}
              onMouseLeave={e => { if (!cell.ghost && !isSel) e.currentTarget.style.background = isWeekend ? "#0a0f14" : "#0d1117"; }}
            >
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:4 }}>
                <span style={{
                  fontSize:12, fontWeight: isToday ? 700 : 400,
                  fontFamily:"'IBM Plex Mono', monospace",
                  color: cell.ghost ? "#242d38" : isToday ? "#fff" : "#6b7c8d",
                  background: isToday ? "#2563eb" : "transparent",
                  width:22, height:22, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {cell.day}
                </span>
              </div>

              {!cell.ghost && events.slice(0, 3).map(r => (
                <div key={r.id} title={`${r.title} · ${new Date(r.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}–${new Date(r.endTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`}
                  style={{
                    display:"flex", alignItems:"center", gap:4,
                    padding:"2px 5px", marginBottom:2, borderRadius:3,
                    background:`${STATUS_DOT[r.status]}14`,
                    border:`1px solid ${STATUS_DOT[r.status]}30`,
                    overflow:"hidden",
                  }}
                >
                  <span style={{ width:5, height:5, borderRadius:"50%", background:STATUS_DOT[r.status], flexShrink:0 }}/>
                  <span style={{
                    fontSize:10, color:"#9aa5b4", fontFamily:"'IBM Plex Mono', monospace",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1,
                  }}>
                    {new Date(r.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} {r.title}
                  </span>
                </div>
              ))}
              {!cell.ghost && events.length > 3 && (
                <div style={{ fontSize:10, color:"#4a5568", fontFamily:"'IBM Plex Mono', monospace", paddingLeft:4 }}>
                  +{events.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const calBtn = {
  background:"none", border:"1px solid #1e2d3d", borderRadius:5,
  color:"#6b7c8d", cursor:"pointer", width:28, height:28,
  fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1,
};

function DayPanel({ dateStr, reservations, isAdmin, onApprove, onCancel, onDelete }) {
  const [y, m, d] = dateStr.split("-");
  const label = `${MONTHS[parseInt(m)-1]} ${parseInt(d)}, ${y}`;

  const items = reservations.filter(r => {
    const rd  = new Date(r.startTime);
    const key = `${rd.getFullYear()}-${String(rd.getMonth()+1).padStart(2,"0")}-${String(rd.getDate()).padStart(2,"0")}`;
    return key === dateStr;
  });

  return (
    <div style={{
      background:"#0d1117", border:"1px solid #1e2d3d",
      borderRadius:10, marginTop:16, overflow:"hidden",
    }}>
      <div style={{
        padding:"12px 18px", borderBottom:"1px solid #1e2d3d",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ fontSize:13, fontWeight:600, color:"#e8edf2", fontFamily:"'IBM Plex Mono', monospace" }}>
          📅 {label}
        </span>
        <span style={{ fontSize:11, color:"#4a5568", fontFamily:"'IBM Plex Mono', monospace" }}>
          {items.length} reservation{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ padding:"32px 18px", textAlign:"center", color:"#4a5568", fontSize:13 }}>
          No reservations on this day
        </div>
      ) : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              {["Title","Room",...(isAdmin?["User"]:[]),"Time","Purpose","Status","Actions"].map(h => (
                <th key={h} style={{
                  padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600,
                  color:"#4a5568", textTransform:"uppercase", letterSpacing:"0.06em",
                  fontFamily:"'IBM Plex Mono', monospace", borderBottom:"1px solid #1e2d3d",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < items.length-1 ? "1px solid #141d27" : "none" }}>
                <td style={{ padding:"11px 16px", fontSize:13, color:"#e8edf2", maxWidth:160 }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title}</div>
                  {r.description && <div style={{ fontSize:11, color:"#4a5568", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.description}</div>}
                </td>
                <td style={{ padding:"11px 16px", fontSize:12, color:"#6b7c8d", fontFamily:"'IBM Plex Mono', monospace" }}>
                  <div>{r.roomNumber}</div>
                  <div style={{ fontSize:11, color:"#4a5568" }}>{r.classroomName}</div>
                </td>
                {isAdmin && (
                  <td style={{ padding:"11px 16px", fontSize:12, color:"#6b7c8d" }}>
                    <div>{r.userFullName}</div>
                    <div style={{ fontSize:11, color:"#4a5568" }}>{r.userEmail}</div>
                  </td>
                )}
                <td style={{ padding:"11px 16px", fontSize:11, color:"#6b7c8d", fontFamily:"'IBM Plex Mono', monospace", whiteSpace:"nowrap" }}>
                  {new Date(r.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                  {" — "}
                  {new Date(r.endTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </td>
                <td style={{ padding:"11px 16px", fontSize:12, color:"#6b7c8d" }}>
                  {r.purpose}
                  {r.attendeeCount && <div style={{ fontSize:11, color:"#4a5568" }}>{r.attendeeCount} attendees</div>}
                </td>
                <td style={{ padding:"11px 16px" }}>
                  <StatusBadge status={r.status} />
                </td>
                <td style={{ padding:"11px 16px" }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {isAdmin && r.status === "Pending" && (
                      <>
                        <ActionBtn onClick={() => onApprove(r.id,"Approved")} color="#198754" label="✓" title="Approve"/>
                        <ActionBtn onClick={() => onApprove(r.id,"Rejected")} color="#DC3545" label="✗" title="Reject"/>
                      </>
                    )}
                    {/* FIX: allow cancelling both Pending and Approved reservations */}
                    {!isAdmin && (r.status === "Pending" || r.status === "Approved") && (
                      <ActionBtn onClick={() => onCancel(r.id)} color="#F0AD4E" label="⊗" title="Cancel"/>
                    )}
                    <ActionBtn onClick={() => onDelete(r.id)} color="#6b7c8d" label="🗑" title="Delete"/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ReservationsView({ addToast }) {
  const [reservations,   setReservations]   = useState([]);
  const [classrooms,     setClassrooms]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showCreate,     setShowCreate]     = useState(false);
  const [filterStatus,   setFilterStatus]   = useState("");
  const [classroomSearch,setClassroomSearch]= useState("");
  const [dateFilter,     setDateFilter]     = useState("");
  const [upcomingOnly,   setUpcomingOnly]   = useState(false);
  const [viewMode,       setViewMode]       = useState("list");
  const [selectedDay,    setSelectedDay]    = useState(null);
  const isAdmin = getRole() === "Admin";

  // FIX: addToast correctly listed as dep
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus)    params.set("status",          filterStatus);
      if (classroomSearch) params.set("classroomSearch", classroomSearch);
      if (dateFilter)      params.set("date",            dateFilter);
      if (upcomingOnly)    params.set("upcoming",        "true");
      const query = params.toString() ? `?${params.toString()}` : "";
      const [r, c] = await Promise.all([
        apiFetch(isAdmin ? `/reservation${query}` : `/reservation/my${query}`),
        apiFetch("/classroom"),
      ]);
      setReservations(r || []);
      setClassrooms(c || []);
    } catch (e) {
      addToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filterStatus, classroomSearch, dateFilter, upcomingOnly, addToast]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id, status) {
    try {
      await apiFetch(`/reservation/${id}/status`, { method:"PATCH", body:JSON.stringify({ status }) });
      addToast(`Reservation ${status.toLowerCase()}`, "success");
      load();
    } catch (e) { addToast(e.message, "error"); }
  }

  async function handleCancel(id) {
    try {
      await apiFetch(`/reservation/${id}/cancel`, { method:"PATCH" });
      addToast("Reservation cancelled", "success");
      load();
    } catch (e) { addToast(e.message, "error"); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this reservation?")) return;
    try {
      await apiFetch(`/reservation/${id}`, { method:"DELETE" });
      addToast("Reservation deleted", "success");
      load();
    } catch (e) { addToast(e.message, "error"); }
  }

  function clearFilters() {
    setFilterStatus("");
    setClassroomSearch("");
    setDateFilter("");
    setUpcomingOnly(false);
  }

  const hasActiveFilters = filterStatus || classroomSearch || dateFilter || upcomingOnly;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <h2 style={{ margin:"0 0 2px", fontSize:20, fontWeight:700, color:"#e8edf2" }}>Reservations</h2>
          <p style={{ margin:0, fontSize:13, color:"#6b7c8d" }}>
            {isAdmin ? "All system reservations" : "Your reservations"}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {/* List / Calendar toggle */}
          <div style={{
            display:"flex", background:"#0d1117",
            border:"1px solid #1e2d3d", borderRadius:7, overflow:"hidden",
          }}>
            {[{id:"list",icon:"≡",label:"List"},{id:"calendar",icon:"▦",label:"Calendar"}].map(v => (
              <button key={v.id}
                onClick={() => { setViewMode(v.id); setSelectedDay(null); }}
                style={{
                  padding:"7px 14px",
                  background: viewMode === v.id ? "#1e2d3d" : "transparent",
                  border:"none",
                  color: viewMode === v.id ? "#e8edf2" : "#4a5568",
                  fontSize:12, fontFamily:"'IBM Plex Mono', monospace",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.1s",
                }}
              >
                <span style={{ fontSize:14 }}>{v.icon}</span>{v.label}
              </button>
            ))}
          </div>

          <button onClick={() => setShowCreate(true)} style={{
            padding:"8px 16px",
            background:"linear-gradient(135deg, #2563eb, #1d4ed8)",
            border:"none", borderRadius:7, color:"#fff",
            fontSize:12, fontWeight:700, fontFamily:"'IBM Plex Mono', monospace",
            cursor:"pointer", letterSpacing:"0.04em",
          }}>
            + NEW
          </button>
        </div>
      </div>

      {/* ── Filters (list only) ── */}
      {viewMode === "list" && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            {/* Status */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ ...inputStyle, width:"auto", padding:"8px 12px", cursor:"pointer" }}
            >
              <option value="">All statuses</option>
              {["Pending","Approved","Rejected","Cancelled"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Classroom search */}
            <input
              style={{ ...inputStyle, width:200 }}
              placeholder="Search classroom..."
              value={classroomSearch}
              onChange={e => setClassroomSearch(e.target.value)}
            />

            {/* Date filter */}
            <input
              type="date"
              style={{ ...inputStyle, width:"auto", padding:"8px 12px", cursor:"pointer" }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />

            {/* Upcoming toggle */}
            <label style={{
              display:"flex", alignItems:"center", gap:7, cursor:"pointer",
              fontSize:12, color: upcomingOnly ? "#2563eb" : "#6b7c8d",
              fontFamily:"'IBM Plex Mono', monospace",
              background: upcomingOnly ? "#2563eb14" : "transparent",
              border:`1px solid ${upcomingOnly ? "#2563eb44" : "#1e2d3d"}`,
              borderRadius:6, padding:"7px 12px",
              transition:"all 0.15s",
            }}>
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={e => setUpcomingOnly(e.target.checked)}
                style={{ accentColor:"#2563eb" }}
              />
              Upcoming only
            </label>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding:"7px 12px", background:"transparent",
                  border:"1px solid #5c1212", borderRadius:6,
                  color:"#DC3545", fontSize:11,
                  fontFamily:"'IBM Plex Mono', monospace", cursor:"pointer",
                }}
              >
                ✕ Clear
              </button>
            )}

            {!loading && (
              <span style={{ marginLeft:"auto", fontSize:11, color:"#4a5568", fontFamily:"'IBM Plex Mono', monospace" }}>
                {reservations.length} result{reservations.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div style={{ color:"#6b7c8d", fontSize:13 }}>Loading...</div>

      ) : viewMode === "calendar" ? (
        <>
          <div style={{ background:"#0d1117", border:"1px solid #1e2d3d", borderRadius:10, padding:18 }}>
            <CalendarView
              reservations={reservations}
              selectedDay={selectedDay}
              onDayClick={setSelectedDay}
            />
          </div>
          {selectedDay && (
            <DayPanel
              dateStr={selectedDay}
              reservations={reservations}
              isAdmin={isAdmin}
              onApprove={handleApprove}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          )}
        </>

      ) : reservations.length === 0 ? (
        <div style={{
          background:"#0d1117", border:"1px solid #1e2d3d", borderRadius:10,
          padding:"60px 20px", textAlign:"center", color:"#4a5568", fontSize:13,
        }}>
          No reservations found
        </div>

      ) : (
        <div style={{ background:"#0d1117", border:"1px solid #1e2d3d", borderRadius:10 }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Title","Room",...(isAdmin?["User"]:[]),"Time","Purpose","Status","Actions"].map(h => (
                  <th key={h} style={{
                    padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600,
                    color:"#4a5568", textTransform:"uppercase", letterSpacing:"0.06em",
                    fontFamily:"'IBM Plex Mono', monospace", borderBottom:"1px solid #1e2d3d",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < reservations.length-1 ? "1px solid #141d27" : "none" }}>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"#e8edf2", maxWidth:180 }}>
                    <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title}</div>
                    {r.description && <div style={{ fontSize:11, color:"#4a5568", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.description}</div>}
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:"#6b7c8d", fontFamily:"'IBM Plex Mono', monospace" }}>
                    <div>{r.roomNumber}</div>
                    <div style={{ fontSize:11, color:"#4a5568" }}>{r.classroomName}</div>
                  </td>
                  {isAdmin && (
                    <td style={{ padding:"12px 16px", fontSize:12, color:"#6b7c8d" }}>
                      <div>{r.userFullName}</div>
                      <div style={{ fontSize:11, color:"#4a5568" }}>{r.userEmail}</div>
                    </td>
                  )}
                  <td style={{ padding:"12px 16px", fontSize:11, color:"#6b7c8d", fontFamily:"'IBM Plex Mono', monospace" }}>
                    <div>{new Date(r.startTime).toLocaleDateString()}</div>
                    <div>
                      {new Date(r.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                      {" — "}
                      {new Date(r.endTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:"#6b7c8d" }}>
                    {r.purpose}
                    {r.attendeeCount && <div style={{ fontSize:11, color:"#4a5568" }}>{r.attendeeCount} attendees</div>}
                  </td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={r.status}/></td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:5 }}>
                      {isAdmin && r.status === "Pending" && (
                        <>
                          <ActionBtn onClick={() => handleApprove(r.id,"Approved")} color="#198754" label="✓" title="Approve"/>
                          <ActionBtn onClick={() => handleApprove(r.id,"Rejected")} color="#DC3545" label="✗" title="Reject"/>
                        </>
                      )}
                      {/* FIX: allow cancelling both Pending and Approved reservations */}
                      {!isAdmin && (r.status === "Pending" || r.status === "Approved") && (
                        <ActionBtn onClick={() => handleCancel(r.id)} color="#F0AD4E" label="⊗" title="Cancel"/>
                      )}
                      <ActionBtn onClick={() => handleDelete(r.id)} color="#6b7c8d" label="🗑" title="Delete"/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateReservationModal
          classrooms={classrooms}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); addToast("Reservation created!", "success"); }}
          addToast={addToast}
        />
      )}
    </div>
  );
}