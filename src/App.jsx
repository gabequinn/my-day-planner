import { useState } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const PEOPLE = [
  { id: "owen",   label: "Owen",   emoji: "🐍", color: "#34D399" },
  { id: "elliot", label: "Elliot", emoji: "🚀", color: "#60A5FA" },
  { id: "arthur", label: "Arthur", emoji: "🦄", color: "#F472B6" },
  { id: "mom",    label: "Mom",    emoji: "🌸", color: "#A78BFA" },
  { id: "dad",    label: "Dad",    emoji: "🤖", color: "#FB923C" },
];

const CATEGORIES = [
  { id: "kids",   label: "👧 Kids",    color: "#FF8FAB" },
  { id: "home",   label: "🏠 Home",    color: "#7EC8A4" },
  { id: "errand", label: "🚗 Errands", color: "#FFB347" },
  { id: "self",   label: "💛 Me Time", color: "#A78BFA" },
  { id: "other",  label: "📋 Other",   color: "#60B8D4" },
];

const URGENCY = [
  { id: "now",   label: "Right Now", emoji: "🔥", points: 100 },
  { id: "today", label: "Today",     emoji: "☀️", points: 60  },
  { id: "soon",  label: "Soon",      emoji: "🌤",  points: 30  },
  { id: "later", label: "Later",     emoji: "🌙", points: 10  },
];

const EFFORT = [
  { id: "quick",  label: "Quick (< 5 min)",   emoji: "⚡",  points: 30 },
  { id: "medium", label: "Medium (5–20 min)", emoji: "🔧",  points: 20 },
  { id: "long",   label: "Long (20+ min)",    emoji: "🏋️", points: 5  },
];

const ITEM_TYPES = [
  { id: "task",  label: "✅ Task",  color: "#10B981", bg: "#ECFDF5" },
  { id: "event", label: "📅 Event", color: "#6366F1", bg: "#EEF2FF" },
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function todayKey() { return toDateKey(new Date()); }

function getPriorityScore(item) {
  if (item.type === "event") return 999; // events always sort to top within their time
  const u = URGENCY.find(x => x.id === item.urgency)?.points || 0;
  const e = EFFORT.find(x => x.id === item.effort)?.points   || 0;
  return u + e + (item.blocksOthers ? 25 : 0) + (item.lowEnergy ? 15 : 0);
}

function getPriorityBadge(score) {
  if (score >= 120) return { label: "Do First!", color: "#EF4444", bg: "#FEF2F2" };
  if (score >= 80)  return { label: "Do Soon",   color: "#F97316", bg: "#FFF7ED" };
  if (score >= 40)  return { label: "Today",     color: "#10B981", bg: "#ECFDF5" };
  return                   { label: "Whenever",  color: "#6B7280", bg: "#F9FAFB" };
}

function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour  = h % 12 || 12;
  return `${hour}:${String(m).padStart(2,"0")}${ampm}`;
}

function getDaysInMonth(year, month) { return new Date(year, month+1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

// ─── Seed Data ────────────────────────────────────────────────────────────────

function buildSeedTasks() {
  const tk = todayKey();
  const d  = new Date();
  const tomorrow  = new Date(d); tomorrow.setDate(d.getDate()+1);
  const tmk = toDateKey(tomorrow);
  const dayAfter  = new Date(d); dayAfter.setDate(d.getDate()+2);
  const dak = toDateKey(dayAfter);

  return [
    { id:1, text:"Pack school lunches",         type:"task",  category:"kids",  urgency:"now",   effort:"quick",  blocksOthers:true,  lowEnergy:true,  done:false, people:["owen","elliot","arthur"], time:"",     dateKey:tk  },
    { id:2, text:"Switch laundry",              type:"task",  category:"home",  urgency:"today", effort:"quick",  blocksOthers:true,  lowEnergy:true,  done:false, people:["mom"],                    time:"",     dateKey:tk  },
    { id:3, text:"Boy Scouts",                  type:"event", category:"kids",  urgency:"now",   effort:"medium", blocksOthers:false, lowEnergy:false, done:false, people:["owen"],                   time:"18:00",dateKey:tk  },
    { id:4, text:"Arthur's doctor appointment", type:"event", category:"kids",  urgency:"now",   effort:"long",   blocksOthers:false, lowEnergy:false, done:false, people:["arthur","mom"],           time:"10:30",dateKey:tmk },
    { id:5, text:"Grocery run",                 type:"task",  category:"errand",urgency:"soon",  effort:"long",   blocksOthers:false, lowEnergy:false, done:false, people:["mom"],                    time:"",     dateKey:tmk },
    { id:6, text:"10 min stretching",           type:"task",  category:"self",  urgency:"later", effort:"quick",  blocksOthers:false, lowEnergy:true,  done:false, people:["mom"],                    time:"",     dateKey:dak },
    { id:7, text:"Owen's book report due",      type:"task",  category:"kids",  urgency:"now",   effort:"medium", blocksOthers:false, lowEnergy:false, done:false, people:["owen"],                   time:"",     dateKey:dak },
    { id:8, text:"Date night 🍷",               type:"event", category:"self",  urgency:"today", effort:"medium", blocksOthers:false, lowEnergy:false, done:false, people:["mom","dad"],              time:"19:00",dateKey:dak },
  ];
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ item, onComplete, onDelete }) {
  const score    = getPriorityScore(item);
  const badge    = getPriorityBadge(score);
  const cat      = CATEGORIES.find(c => c.id === item.category);
  const urg      = URGENCY.find(u => u.id === item.urgency);
  const eff      = EFFORT.find(e => e.id === item.effort);
  const typeInfo = ITEM_TYPES.find(t => t.id === item.type);
  const itemPeople = (item.people || []).map(pid => PEOPLE.find(p => p.id === pid)).filter(Boolean);

  return (
    <div style={{
      background:"white", borderRadius:18, padding:"14px 16px",
      marginBottom:10, boxShadow:"0 2px 10px rgba(0,0,0,0.06)",
      borderLeft:`5px solid ${item.type === "event" ? "#6366F1" : cat?.color || "#ddd"}`,
      opacity: item.done ? 0.45 : 1,
      transition:"all 0.25s ease",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, flex:1, minWidth:0 }}>
          <button onClick={() => onComplete(item.id)} style={{
            width:24, height:24, borderRadius:"50%", flexShrink:0, marginTop:2,
            border:`2.5px solid ${item.done ? "#7EC8A4" : "#ccc"}`,
            background: item.done ? "#7EC8A4" : "white",
            cursor:"pointer", fontSize:12, color:"white",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.2s",
          }}>{item.done ? "✓" : ""}</button>

          <div style={{ flex:1, minWidth:0 }}>
            {/* Title row with time */}
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <div style={{
                fontFamily:"'Nunito', sans-serif", fontSize:15, fontWeight:700,
                color: item.done ? "#aaa" : "#1E1B4B",
                textDecoration: item.done ? "line-through" : "none",
                lineHeight:1.3, wordBreak:"break-word",
              }}>{item.text}</div>
              {item.time && (
                <span style={{
                  fontSize:12, fontWeight:800, color:"#6366F1",
                  background:"#EEF2FF", borderRadius:20, padding:"1px 8px",
                  whiteSpace:"nowrap",
                }}>🕐 {formatTime(item.time)}</span>
              )}
            </div>

            {/* Tags row */}
            <div style={{ marginTop:6, display:"flex", flexWrap:"wrap", gap:5 }}>
              {/* Type badge */}
              <span style={{ fontSize:11, background:typeInfo?.bg, color:typeInfo?.color, borderRadius:20, padding:"2px 8px", fontWeight:800 }}>
                {typeInfo?.label}
              </span>
              {/* Category */}
              <span style={{ fontSize:11, background:cat?.color+"22", color:cat?.color, borderRadius:20, padding:"2px 8px", fontWeight:700 }}>
                {cat?.label}
              </span>
              {/* People */}
              {itemPeople.map(p => (
                <span key={p.id} style={{ fontSize:11, background:p.color+"22", color:p.color, borderRadius:20, padding:"2px 8px", fontWeight:700 }}>
                  {p.emoji} {p.label}
                </span>
              ))}
              {/* Urgency + effort only for tasks */}
              {item.type === "task" && <>
                <span style={{ fontSize:11, background:"#F3F4F6", color:"#6B7280", borderRadius:20, padding:"2px 8px" }}>{urg?.emoji} {urg?.label}</span>
                <span style={{ fontSize:11, background:"#F3F4F6", color:"#6B7280", borderRadius:20, padding:"2px 8px" }}>{eff?.emoji} {eff?.label}</span>
                {item.blocksOthers && <span style={{ fontSize:11, background:"#FFF3E0", color:"#E65100", borderRadius:20, padding:"2px 8px" }}>🔗 Blocks others</span>}
                {item.lowEnergy    && <span style={{ fontSize:11, background:"#F3E5F5", color:"#7B1FA2", borderRadius:20, padding:"2px 8px" }}>🧠 Low energy ok</span>}
              </>}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
          {item.type === "task" && (
            <span style={{ fontSize:11, fontWeight:700, background:badge.bg, color:badge.color, borderRadius:20, padding:"3px 9px", whiteSpace:"nowrap" }}>
              {badge.label}
            </span>
          )}
          <button onClick={() => onDelete(item.id)} style={{ background:"none", border:"none", color:"#D1D5DB", cursor:"pointer", fontSize:18, lineHeight:1, padding:"0 2px" }} title="Remove">×</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Form ─────────────────────────────────────────────────────────────────

function AddItemForm({ onAdd, dateKey }) {
  const [text,         setText]         = useState("");
  const [type,         setType]         = useState("task");
  const [category,     setCategory]     = useState("home");
  const [urgency,      setUrgency]      = useState("today");
  const [effort,       setEffort]       = useState("medium");
  const [people,       setPeople]       = useState([]);
  const [time,         setTime]         = useState("");
  const [blocksOthers, setBlocksOthers] = useState(false);
  const [lowEnergy,    setLowEnergy]    = useState(false);
  const [expanded,     setExpanded]     = useState(false);

  const togglePerson = (pid) => {
    setPeople(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]);
  };

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd({ text:text.trim(), type, category, urgency, effort, people, time, blocksOthers, lowEnergy, dateKey });
    setText(""); setType("task"); setCategory("home"); setUrgency("today");
    setEffort("medium"); setPeople([]); setTime("");
    setBlocksOthers(false); setLowEnergy(false); setExpanded(false);
  };

  return (
    <div style={{ background:"white", borderRadius:20, boxShadow:"0 4px 20px rgba(0,0,0,0.08)", padding:"16px 18px", marginBottom:20 }}>
      <div style={{ display:"flex", gap:10 }}>
        <input
          type="text" value={text}
          onChange={e => { setText(e.target.value); if (e.target.value) setExpanded(true); }}
          onFocus={() => setExpanded(true)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="✏️  Add a task or event…"
          style={{
            flex:1, fontSize:15, fontFamily:"'Nunito', sans-serif",
            border:"2px solid #EDE9FE", borderRadius:12, padding:"10px 14px",
            outline:"none", color:"#1E1B4B", background:"#FAFAFE",
          }}
        />
        <button onClick={handleAdd} style={{
          background:"linear-gradient(135deg,#A78BFA,#7C3AED)", color:"white",
          border:"none", borderRadius:12, padding:"10px 18px",
          fontSize:20, cursor:"pointer", fontWeight:700,
          boxShadow:"0 4px 10px rgba(124,58,237,0.25)",
        }}>+</button>
      </div>

      {expanded && (
        <div style={{ marginTop:14 }}>

          {/* Task or Event toggle */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", marginBottom:6, letterSpacing:1 }}>TASK OR EVENT?</div>
            <div style={{ display:"flex", gap:8 }}>
              {ITEM_TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t.id)} style={{
                  background: type === t.id ? t.color : "#F3F4F6",
                  color: type === t.id ? "white" : "#555",
                  border:"none", borderRadius:20, padding:"7px 18px",
                  fontSize:13, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                  cursor:"pointer", transition:"all 0.15s",
                  boxShadow: type === t.id ? `0 3px 8px ${t.color}55` : "none",
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Time picker */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", marginBottom:6, letterSpacing:1 }}>
              TIME {type === "task" ? "(optional)" : "(recommended)"}
            </div>
            <input
              type="time" value={time}
              onChange={e => setTime(e.target.value)}
              style={{
                fontSize:14, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                border:"2px solid #EDE9FE", borderRadius:12, padding:"8px 14px",
                outline:"none", color: time ? "#6366F1" : "#9CA3AF",
                background:"#FAFAFE", cursor:"pointer",
              }}
            />
            {time && (
              <button onClick={() => setTime("")} style={{
                marginLeft:8, fontSize:12, color:"#9CA3AF", background:"none",
                border:"none", cursor:"pointer", fontWeight:700,
              }}>✕ clear</button>
            )}
          </div>

          {/* Who is this for */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", marginBottom:6, letterSpacing:1 }}>WHO IS THIS FOR? (select all that apply)</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {PEOPLE.map(p => {
                const selected = people.includes(p.id);
                return (
                  <button key={p.id} onClick={() => togglePerson(p.id)} style={{
                    background: selected ? p.color : "#F3F4F6",
                    color: selected ? "white" : "#555",
                    border: selected ? `2px solid ${p.color}` : "2px solid transparent",
                    borderRadius:20, padding:"6px 13px",
                    fontSize:13, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                    cursor:"pointer", transition:"all 0.15s",
                    boxShadow: selected ? `0 3px 8px ${p.color}55` : "none",
                  }}>
                    {p.emoji} {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", marginBottom:6, letterSpacing:1 }}>CATEGORY</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  background: category === c.id ? c.color : "#F3F4F6",
                  color: category === c.id ? "white" : "#555",
                  border:"none", borderRadius:20, padding:"6px 13px",
                  fontSize:13, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                  cursor:"pointer", transition:"all 0.15s",
                  boxShadow: category === c.id ? `0 3px 8px ${c.color}55` : "none",
                }}>{c.label}</button>
              ))}
            </div>
          </div>

          {/* Urgency + Effort (tasks only) */}
          {type === "task" && <>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", marginBottom:6, letterSpacing:1 }}>HOW URGENT?</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {URGENCY.map(u => (
                  <button key={u.id} onClick={() => setUrgency(u.id)} style={{
                    background: urgency === u.id ? "#FF8FAB" : "#F3F4F6",
                    color: urgency === u.id ? "white" : "#555",
                    border:"none", borderRadius:20, padding:"6px 13px",
                    fontSize:13, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                    cursor:"pointer", transition:"all 0.15s",
                  }}>{u.emoji} {u.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:800, color:"#9CA3AF", marginBottom:6, letterSpacing:1 }}>HOW MUCH EFFORT?</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                {EFFORT.map(e => (
                  <button key={e.id} onClick={() => setEffort(e.id)} style={{
                    background: effort === e.id ? "#60B8D4" : "#F3F4F6",
                    color: effort === e.id ? "white" : "#555",
                    border:"none", borderRadius:20, padding:"6px 13px",
                    fontSize:13, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                    cursor:"pointer", transition:"all 0.15s",
                  }}>{e.emoji} {e.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[
                { val:blocksOthers, set:setBlocksOthers, label:"🔗 Blocks other tasks", color:"#E65100" },
                { val:lowEnergy,    set:setLowEnergy,    label:"🧠 Can do when tired",  color:"#7B1FA2" },
              ].map(({ val, set, label, color }) => (
                <label key={label} style={{
                  display:"flex", alignItems:"center", gap:7,
                  cursor:"pointer", fontSize:12, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                  color: val ? color : "#9CA3AF",
                  background: val ? color+"15" : "#F3F4F6",
                  borderRadius:10, padding:"6px 11px", userSelect:"none", transition:"all 0.15s",
                }}>
                  <input type="checkbox" checked={val} onChange={e => set(e.target.checked)}
                    style={{ accentColor:color, width:13, height:13 }} />
                  {label}
                </label>
              ))}
            </div>
          </>}
        </div>
      )}
    </div>
  );
}

// ─── Calendar ────────────────────────────────────────────────────────────────

function Calendar({ items, selectedKey, onSelectDay, year, month }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const tk          = todayKey();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:800, color:"#9CA3AF", padding:"4px 0", letterSpacing:0.5 }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dk         = toDateKey(new Date(year, month, day));
          const dayItems   = items.filter(t => t.dateKey === dk);
          const pending    = dayItems.filter(t => !t.done).length;
          const hasEvent   = dayItems.some(t => t.type === "event");
          const isToday    = dk === tk;
          const isSelected = dk === selectedKey;
          const isPast     = new Date(year, month, day) < new Date(new Date().setHours(0,0,0,0));
          const peopleDots = [...new Set(dayItems.flatMap(t => t.people || []))].slice(0, 4);

          return (
            <button key={dk} onClick={() => onSelectDay(dk)} style={{
              background: isSelected ? "#7C3AED" : isToday ? "#EDE9FE" : "white",
              color:      isSelected ? "white"   : isPast  ? "#9CA3AF" : "#1E1B4B",
              border:     isToday && !isSelected ? "2px solid #A78BFA" : "2px solid transparent",
              borderRadius:12, padding:"5px 3px 5px",
              cursor:"pointer", transition:"all 0.15s",
              minHeight:56, display:"flex", flexDirection:"column",
              alignItems:"center", gap:2,
              boxShadow: isSelected ? "0 4px 12px rgba(124,58,237,0.35)" : "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <span style={{ fontSize:13, fontWeight: isToday||isSelected ? 800 : 600, lineHeight:1 }}>{day}</span>

              {/* event dot */}
              {hasEvent && (
                <span style={{ width:5, height:5, borderRadius:"50%", background: isSelected ? "rgba(255,255,255,0.9)" : "#6366F1", display:"inline-block" }} />
              )}

              {pending > 0 && (
                <span style={{
                  fontSize:10, fontWeight:800, lineHeight:1,
                  background: isSelected ? "rgba(255,255,255,0.25)" : "#F3F4F6",
                  color: isSelected ? "white" : "#6B7280",
                  borderRadius:20, padding:"1px 5px",
                }}>{pending}</span>
              )}

              {peopleDots.length > 0 && (
                <div style={{ display:"flex", gap:2, justifyContent:"center", flexWrap:"wrap" }}>
                  {peopleDots.map(pid => {
                    const p = PEOPLE.find(x => x.id === pid);
                    return <span key={pid} style={{ width:5, height:5, borderRadius:"50%", background: isSelected ? "rgba(255,255,255,0.7)" : p?.color, display:"inline-block" }} />;
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const now = new Date();
  const [items,       setItems]       = useState(buildSeedTasks);
  const [year,        setYear]        = useState(now.getFullYear());
  const [month,       setMonth]       = useState(now.getMonth());
  const [selectedKey, setSelectedKey] = useState(todayKey());
  const [showDone,    setShowDone]    = useState(false);
  const [filterWho,   setFilterWho]   = useState("all");
  const [filterType,  setFilterType]  = useState("all");

  const addItem     = data => setItems(prev => [...prev, { ...data, id:Date.now(), done:false }]);
  const completeItem = id => setItems(prev => prev.map(t => t.id === id ? { ...t, done:!t.done } : t));
  const deleteItem   = id => setItems(prev => prev.filter(t => t.id !== id));

  const prevMonth = () => { if (month===0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===11){ setMonth(0);  setYear(y=>y+1); } else setMonth(m=>m+1); };

  const allDayItems = items.filter(t => t.dateKey === selectedKey);

  const dayItems = allDayItems
    .filter(t => showDone || !t.done)
    .filter(t => filterWho  === "all" || (t.people || []).includes(filterWho))
    .filter(t => filterType === "all" || t.type === filterType)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      // Sort by time first if both have times
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      return getPriorityScore(b) - getPriorityScore(a);
    });

  const doneCount  = allDayItems.filter(t => t.done).length;
  const totalCount = allDayItems.length;
  const progress   = totalCount ? Math.round((doneCount/totalCount)*100) : 0;

  const selDate   = new Date(selectedKey + "T12:00:00");
  const isToday   = selectedKey === todayKey();
  const isPast    = selDate < new Date(new Date().setHours(0,0,0,0));
  const dateLabel = isToday ? "Today ✨" : selDate.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#F0EBFF; min-height:100vh; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:#C4B5FD; border-radius:3px; }
      `}</style>

      <div style={{
        minHeight:"100vh",
        background:"linear-gradient(160deg,#F0EBFF 0%,#FDF2F8 50%,#ECFDF5 100%)",
        fontFamily:"'Nunito', sans-serif",
        paddingBottom:60,
      }}>

        {/* ── Header ── */}
        <div style={{
          background:"linear-gradient(135deg,#6D28D9 0%,#9333EA 55%,#EC4899 100%)",
          padding:"24px 20px 20px",
          borderRadius:"0 0 32px 32px",
          boxShadow:"0 8px 30px rgba(109,40,217,0.25)",
          marginBottom:20,
        }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <div style={{ fontFamily:"'Fredoka One', cursive", fontSize:26, color:"white", letterSpacing:0.5 }}>
              ✨ My Day Planner
            </div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13, marginTop:3, fontWeight:600, display:"flex", gap:10, flexWrap:"wrap" }}>
              {PEOPLE.map(p => (
                <span key={p.id}>{p.emoji} {p.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth:600, margin:"0 auto", padding:"0 14px" }}>

          {/* ── Calendar Card ── */}
          <div style={{
            background:"white", borderRadius:24,
            boxShadow:"0 4px 24px rgba(0,0,0,0.08)",
            padding:"18px 16px", marginBottom:18,
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <button onClick={prevMonth} style={{ background:"#F3F4F6", border:"none", borderRadius:10, width:34, height:34, cursor:"pointer", fontSize:16, color:"#6D28D9", fontWeight:800 }}>‹</button>
              <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:18, color:"#1E1B4B", letterSpacing:0.5 }}>
                {MONTH_NAMES[month]} {year}
              </span>
              <button onClick={nextMonth} style={{ background:"#F3F4F6", border:"none", borderRadius:10, width:34, height:34, cursor:"pointer", fontSize:16, color:"#6D28D9", fontWeight:800 }}>›</button>
            </div>

            <Calendar items={items} selectedKey={selectedKey} onSelectDay={setSelectedKey} year={year} month={month} />

            {/* Legend */}
            <div style={{ display:"flex", gap:10, marginTop:14, justifyContent:"center", flexWrap:"wrap" }}>
              {PEOPLE.map(p => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:p.color, display:"inline-block" }}/>
                  <span style={{ fontSize:11, color:"#9CA3AF", fontWeight:700 }}>{p.emoji} {p.label}</span>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#6366F1", display:"inline-block" }}/>
                <span style={{ fontSize:11, color:"#9CA3AF", fontWeight:700 }}>📅 Event</span>
              </div>
            </div>
          </div>

          {/* ── Day Panel ── */}
          <div>
            {/* Day header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontFamily:"'Fredoka One', cursive", fontSize:20, color:"#1E1B4B" }}>{dateLabel}</div>
                {totalCount > 0 && (
                  <div style={{ fontSize:12, color:"#9CA3AF", fontWeight:600, marginTop:2 }}>{doneCount} of {totalCount} done</div>
                )}
              </div>
              {totalCount > 0 && (
                <div style={{ position:"relative", width:46, height:46 }}>
                  <svg width={46} height={46} style={{ transform:"rotate(-90deg)" }}>
                    <circle cx={23} cy={23} r={18} fill="none" stroke="#EDE9FE" strokeWidth={4}/>
                    <circle cx={23} cy={23} r={18} fill="none" stroke="#7C3AED" strokeWidth={4}
                      strokeDasharray={`${2*Math.PI*18}`}
                      strokeDashoffset={`${2*Math.PI*18*(1-progress/100)}`}
                      strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.4s ease" }}/>
                  </svg>
                  <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#6D28D9" }}>{progress}%</span>
                </div>
              )}
            </div>

            {/* Filter bar */}
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:10 }}>
              {/* Type filter */}
              {[{ id:"all", label:"All", color:"#7C3AED" }, ...ITEM_TYPES].map(t => (
                <button key={t.id} onClick={() => setFilterType(t.id)} style={{
                  background: filterType === t.id ? (t.color || "#7C3AED") : "white",
                  color:      filterType === t.id ? "white" : "#6B7280",
                  border:"none", borderRadius:20, padding:"5px 12px",
                  fontSize:12, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                  cursor:"pointer", boxShadow:"0 1px 5px rgba(0,0,0,0.07)", transition:"all 0.15s",
                }}>{t.label}</button>
              ))}
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
              {/* People filter */}
              {[{ id:"all", label:"Everyone", color:"#7C3AED", emoji:"" }, ...PEOPLE].map(p => (
                <button key={p.id} onClick={() => setFilterWho(p.id)} style={{
                  background: filterWho === p.id ? p.color : "white",
                  color:      filterWho === p.id ? "white" : "#6B7280",
                  border:"none", borderRadius:20, padding:"5px 12px",
                  fontSize:12, fontFamily:"'Nunito', sans-serif", fontWeight:700,
                  cursor:"pointer", boxShadow:"0 1px 5px rgba(0,0,0,0.07)", transition:"all 0.15s",
                }}>{p.emoji} {p.label}</button>
              ))}
            </div>

            {/* Add form */}
            <AddItemForm onAdd={addItem} dateKey={selectedKey} />

            {/* Items */}
            {dayItems.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:"#D1D5DB" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>{isPast ? "🌿" : "🌸"}</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#A78BFA" }}>{isPast ? "Nothing here" : "All clear!"}</div>
                <div style={{ fontSize:13, marginTop:4 }}>
                  {isPast ? "No items recorded for this day." : "Add a task or event above! 💜"}
                </div>
              </div>
            ) : (
              dayItems.map(item => (
                <ItemCard key={item.id} item={item} onComplete={completeItem} onDelete={deleteItem} />
              ))
            )}

            {allDayItems.some(t => t.done) && (
              <button onClick={() => setShowDone(v => !v)} style={{
                background:"none", border:"2px dashed #DDD6FE", borderRadius:12,
                color:"#A78BFA", fontFamily:"'Nunito', sans-serif", fontWeight:700,
                fontSize:13, padding:"9px 18px", cursor:"pointer", width:"100%", marginTop:6,
              }}>
                {showDone ? "🙈 Hide completed" : `🎊 Show ${doneCount} completed item${doneCount!==1?"s":""}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}