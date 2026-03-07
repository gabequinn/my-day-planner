import { useState, useEffect, useMemo, useCallback } from "react";

// ─── Supabase config ──────────────────────────────────────────────────────────

const SUPABASE_URL = "https://bjlohnxvpokrzijyislq.supabase.co";
const SUPABASE_KEY = "sb_publishable_TXGZAxGBvTTUodWPZ6OEPQ__BkF3KnV";

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Prefer": "return=representation",
};

const api = {
  async getItems() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/items?order=id`, { headers });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async addItem(item) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/items`, {
      method: "POST", headers,
      body: JSON.stringify(dbItem(item)),
    });
    if (!r.ok) throw new Error(await r.text());
    const rows = await r.json();
    return appItem(rows[0]);
  },
  async updateItem(item) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/items?id=eq.${item.id}`, {
      method: "PATCH", headers,
      body: JSON.stringify(dbItem(item)),
    });
    if (!r.ok) throw new Error(await r.text());
    const rows = await r.json();
    return appItem(rows[0]);
  },
  async deleteItem(id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/items?id=eq.${id}`, {
      method: "DELETE", headers,
    });
    if (!r.ok) throw new Error(await r.text());
  },
  async getDoneMap() {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/done_map`, { headers });
    if (!r.ok) throw new Error(await r.text());
    const rows = await r.json();
    const map = {};
    rows.forEach(row => { map[row.key] = row.value; });
    return map;
  },
  async setDone(key, value) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/done_map`, {
      method: "POST",
      headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ key, value }),
    });
    if (!r.ok) throw new Error(await r.text());
  },
};

// Convert between app format and DB format
function dbItem(item) {
  return {
    id: item.id,
    text: item.text,
    type: item.type,
    category: item.category,
    urgency: item.urgency,
    effort: item.effort,
    people: item.people || [],
    time: item.time || "",
    date_key: item.dateKey,
    recurrence: item.recurrence || "none",
    blocks_others: item.blocksOthers || false,
    low_energy: item.lowEnergy || false,
  };
}

function appItem(row) {
  return {
    id: row.id,
    text: row.text,
    type: row.type,
    category: row.category,
    urgency: row.urgency,
    effort: row.effort,
    people: row.people || [],
    time: row.time || "",
    dateKey: row.date_key,
    recurrence: row.recurrence || "none",
    blocksOthers: row.blocks_others || false,
    lowEnergy: row.low_energy || false,
  };
}

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

const RECURRENCE = [
  { id: "none",    label: "No repeat",   emoji: "1️⃣" },
  { id: "daily",   label: "Every day",   emoji: "🔁" },
  { id: "weekly",  label: "Every week",  emoji: "📆" },
  { id: "monthly", label: "Every month", emoji: "🗓️" },
];

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_SHORT   = ["S","M","T","W","T","F","S"];

const QUOTES = [
  { text: "You're not behind. You're exactly where you need to be.", author: "💜" },
  { text: "Motherhood: powered by love, fueled by coffee, sustained by wine.", author: "😂" },
  { text: "Done is better than perfect.", author: "✨" },
  { text: "You've survived 100% of your hard days so far.", author: "💪" },
  { text: "Cleaning with kids in the house is like brushing teeth while eating Oreos.", author: "😅" },
  { text: "You are doing a great job, even on the days it doesn't feel like it.", author: "🌸" },
  { text: "May your coffee be strong and your kids' naps be long.", author: "☕" },
  { text: "Progress, not perfection.", author: "🌟" },
  { text: "You can't pour from an empty cup. Take care of yourself too.", author: "💛" },
  { text: "Toddlers are just tiny drunk adults who don't understand the concept of personal space.", author: "🤣" },
  { text: "One load of laundry at a time. One day at a time.", author: "🧺" },
  { text: "Behind every great kid is a mom who's pretty sure she's messing it all up.", author: "😂" },
  { text: "You are enough. You have enough. You do enough.", author: "🌷" },
  { text: "Parenting: the only job where the more you love it, the harder it gets.", author: "❤️" },
  { text: "Rest is productive. Recharge without guilt.", author: "🌙" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function todayKey() { return toDateKey(new Date()); }
function parseDate(dk) { return new Date(dk + "T12:00:00"); }

function getPriorityScore(item) {
  if (item.type === "event") return 999;
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

function itemAppliesToDate(item, dk) {
  if (item.dateKey === dk) return true;
  if (!item.recurrence || item.recurrence === "none") return false;
  const origin = parseDate(item.dateKey);
  const target = parseDate(dk);
  if (target < origin) return false;
  if (item.recurrence === "daily")   return true;
  if (item.recurrence === "weekly")  return origin.getDay() === target.getDay();
  if (item.recurrence === "monthly") return origin.getDate() === target.getDate();
  return false;
}

function doneKey(itemId, dk) { return `${itemId}_${dk}`; }
function getDailyDone(doneMap, itemId, dk) { return !!doneMap[doneKey(itemId, dk)]; }

function getWeekDates(selectedKey) {
  const d = parseDate(selectedKey);
  const day = d.getDay();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(d);
    dd.setDate(d.getDate() - day + i);
    dates.push(toDateKey(dd));
  }
  return dates;
}

function getDailyQuote() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

// ─── Shared form hook ─────────────────────────────────────────────────────────

function useItemForm(initial = {}) {
  const [text,         setText]         = useState(initial.text         ?? "");
  const [type,         setType]         = useState(initial.type         ?? "task");
  const [category,     setCategory]     = useState(initial.category     ?? "home");
  const [urgency,      setUrgency]      = useState(initial.urgency      ?? "today");
  const [effort,       setEffort]       = useState(initial.effort       ?? "medium");
  const [people,       setPeople]       = useState(initial.people       ?? []);
  const [time,         setTime]         = useState(initial.time         ?? "");
  const [recurrence,   setRecurrence]   = useState(initial.recurrence   ?? "none");
  const [blocksOthers, setBlocksOthers] = useState(initial.blocksOthers ?? false);
  const [lowEnergy,    setLowEnergy]    = useState(initial.lowEnergy    ?? false);
  const togglePerson = (pid) =>
    setPeople(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]);
  const values  = { text, type, category, urgency, effort, people, time, recurrence, blocksOthers, lowEnergy };
  const setters = { setText, setType, setCategory, setUrgency, setEffort, setPeople, setTime, setRecurrence, setBlocksOthers, setLowEnergy, togglePerson };
  return [values, setters];
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const sectionLabel = { fontSize: 11, fontWeight: 800, color: "#9CA3AF", marginBottom: 6, letterSpacing: 1 };

function Pill({ active, color, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? color : "#F3F4F6",
      color: active ? "white" : "#555",
      border: active ? `2px solid ${color}` : "2px solid transparent",
      borderRadius: 20, padding: "7px 14px", fontSize: 13,
      fontFamily: "'Nunito', sans-serif", fontWeight: 700, cursor: "pointer",
      transition: "all 0.15s",
      boxShadow: active ? `0 3px 8px ${color}44` : "none",
    }}>{children}</button>
  );
}

// ─── Form Fields ──────────────────────────────────────────────────────────────

function FormFields({ values, setters }) {
  const { text, type, category, urgency, effort, people, time, recurrence, blocksOthers, lowEnergy } = values;
  const { setType, setCategory, setUrgency, setEffort, setTime, setRecurrence, setBlocksOthers, setLowEnergy, togglePerson } = setters;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>TASK OR EVENT?</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ITEM_TYPES.map(t => <Pill key={t.id} active={type===t.id} color={t.color} onClick={()=>setType(t.id)}>{t.label}</Pill>)}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>TIME {type==="task" ? "(optional)" : "(recommended)"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{
            fontSize: 14, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
            border: "2px solid #EDE9FE", borderRadius: 12, padding: "8px 12px",
            outline: "none", color: time ? "#6366F1" : "#9CA3AF", background: "#FAFAFE",
          }}/>
          {time && <button onClick={()=>setTime("")} style={{ fontSize: 12, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>✕ clear</button>}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>REPEAT?</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RECURRENCE.map(r => <Pill key={r.id} active={recurrence===r.id} color="#6366F1" onClick={()=>setRecurrence(r.id)}>{r.emoji} {r.label}</Pill>)}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>WHO IS THIS FOR?</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PEOPLE.map(p => <Pill key={p.id} active={people.includes(p.id)} color={p.color} onClick={()=>togglePerson(p.id)}>{p.emoji} {p.label}</Pill>)}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={sectionLabel}>CATEGORY</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => <Pill key={c.id} active={category===c.id} color={c.color} onClick={()=>setCategory(c.id)}>{c.label}</Pill>)}
        </div>
      </div>

      {type === "task" && <>
        <div style={{ marginBottom: 14 }}>
          <div style={sectionLabel}>HOW URGENT?</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {URGENCY.map(u => <Pill key={u.id} active={urgency===u.id} color="#FF8FAB" onClick={()=>setUrgency(u.id)}>{u.emoji} {u.label}</Pill>)}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={sectionLabel}>HOW MUCH EFFORT?</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EFFORT.map(e => <Pill key={e.id} active={effort===e.id} color="#60B8D4" onClick={()=>setEffort(e.id)}>{e.emoji} {e.label}</Pill>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { val: blocksOthers, set: setBlocksOthers, label: "🔗 Blocks other tasks", color: "#E65100" },
            { val: lowEnergy,    set: setLowEnergy,    label: "🧠 Can do when tired",  color: "#7B1FA2" },
          ].map(({ val, set, label, color }) => (
            <label key={label} style={{
              display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
              fontSize: 12, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
              color: val ? color : "#9CA3AF", background: val ? color+"15" : "#F3F4F6",
              borderRadius: 10, padding: "6px 11px", userSelect: "none", transition: "all 0.15s",
            }}>
              <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} style={{ accentColor: color, width: 13, height: 13 }}/>
              {label}
            </label>
          ))}
        </div>
      </>}
    </div>
  );
}

// ─── Add Form ─────────────────────────────────────────────────────────────────

function AddItemForm({ onAdd, dateKey }) {
  const [values, setters] = useItemForm();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setters.setText(""); setters.setType("task"); setters.setCategory("home");
    setters.setUrgency("today"); setters.setEffort("medium"); setters.setPeople([]);
    setters.setTime(""); setters.setRecurrence("none");
    setters.setBlocksOthers(false); setters.setLowEnergy(false);
    setExpanded(false);
  };

  const handleAdd = async () => {
    if (!values.text.trim() || saving) return;
    setSaving(true);
    await onAdd({ ...values, dateKey });
    reset();
    setSaving(false);
  };

  return (
    <div style={{ background: "white", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: "16px 18px", marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text" value={values.text}
          onChange={e => { setters.setText(e.target.value); if (e.target.value) setExpanded(true); }}
          onFocus={() => setExpanded(true)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="✏️  Add a task or event…"
          style={{
            flex: 1, fontSize: 15, fontFamily: "'Nunito', sans-serif",
            border: "2px solid #EDE9FE", borderRadius: 12, padding: "12px 14px",
            outline: "none", color: "#1E1B4B", background: "#FAFAFE",
          }}
        />
        <button onClick={handleAdd} disabled={saving} style={{
          background: "linear-gradient(135deg,#A78BFA,#7C3AED)", color: "white",
          border: "none", borderRadius: 12, padding: "12px 18px",
          fontSize: 20, cursor: saving ? "wait" : "pointer", fontWeight: 700,
          boxShadow: "0 4px 10px rgba(124,58,237,0.25)", minWidth: 50,
          opacity: saving ? 0.7 : 1,
        }}>{saving ? "…" : "+"}</button>
      </div>
      {expanded && (
        <div style={{ marginTop: 16 }}>
          <FormFields values={values} setters={setters} />
          <button onClick={handleAdd} disabled={saving} style={{
            marginTop: 14, width: "100%", background: "linear-gradient(135deg,#A78BFA,#7C3AED)",
            color: "white", border: "none", borderRadius: 14, padding: "13px",
            fontSize: 15, fontWeight: 800, cursor: saving ? "wait" : "pointer",
            fontFamily: "'Nunito', sans-serif", boxShadow: "0 4px 12px rgba(124,58,237,0.25)",
            opacity: saving ? 0.7 : 1,
          }}>{saving ? "Saving…" : "Add ✨"}</button>
        </div>
      )}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onSave, onClose }) {
  const [values, setters] = useItemForm(item);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!values.text.trim() || saving) return;
    setSaving(true);
    await onSave({ ...item, ...values });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(30,27,75,0.5)",
      zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "white", borderRadius: "24px 24px 0 0",
        padding: "20px 18px 48px", width: "100%", maxWidth: 600,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#1E1B4B" }}>Edit ✏️</span>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: 10, width: 34, height: 34, fontSize: 18, cursor: "pointer", color: "#6B7280" }}>✕</button>
        </div>
        <input
          type="text" value={values.text}
          onChange={e => setters.setText(e.target.value)}
          style={{
            width: "100%", fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 700,
            border: "2px solid #EDE9FE", borderRadius: 12, padding: "12px 14px",
            outline: "none", color: "#1E1B4B", background: "#FAFAFE", marginBottom: 16,
          }}
        />
        <FormFields values={values} setters={setters} />
        <button onClick={handleSave} disabled={saving} style={{
          marginTop: 18, width: "100%", background: "linear-gradient(135deg,#A78BFA,#7C3AED)",
          color: "white", border: "none", borderRadius: 14, padding: "14px",
          fontSize: 16, fontWeight: 800, cursor: saving ? "wait" : "pointer",
          fontFamily: "'Nunito', sans-serif", boxShadow: "0 4px 12px rgba(124,58,237,0.25)",
          opacity: saving ? 0.7 : 1,
        }}>{saving ? "Saving…" : "Save Changes 💾"}</button>
      </div>
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ item, dateKey, done, onComplete, onDelete, onEdit }) {
  const score      = getPriorityScore(item);
  const badge      = getPriorityBadge(score);
  const cat        = CATEGORIES.find(c => c.id === item.category);
  const urg        = URGENCY.find(u => u.id === item.urgency);
  const eff        = EFFORT.find(e => e.id === item.effort);
  const typeInfo   = ITEM_TYPES.find(t => t.id === item.type);
  const rec        = RECURRENCE.find(r => r.id === item.recurrence);
  const itemPeople = (item.people||[]).map(pid => PEOPLE.find(p => p.id===pid)).filter(Boolean);

  return (
    <div style={{
      background: "white", borderRadius: 18, padding: "14px 14px", marginBottom: 10,
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      borderLeft: `5px solid ${item.type==="event" ? "#6366F1" : cat?.color||"#ddd"}`,
      opacity: done ? 0.45 : 1, transition: "all 0.25s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
          <button onClick={() => onComplete(item.id, dateKey)} style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 2,
            border: `2.5px solid ${done ? "#7EC8A4" : "#ccc"}`,
            background: done ? "#7EC8A4" : "white", cursor: "pointer",
            fontSize: 13, color: "white", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>{done ? "✓" : ""}</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{
                fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 700,
                color: done ? "#aaa" : "#1E1B4B", textDecoration: done ? "line-through" : "none",
                lineHeight: 1.3, wordBreak: "break-word",
              }}>{item.text}</div>
              {item.time && (
                <span style={{ fontSize: 12, fontWeight: 800, color: "#6366F1", background: "#EEF2FF", borderRadius: 20, padding: "1px 8px", whiteSpace: "nowrap" }}>
                  🕐 {formatTime(item.time)}
                </span>
              )}
            </div>
            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 5 }}>
              <span style={{ fontSize: 11, background: typeInfo?.bg, color: typeInfo?.color, borderRadius: 20, padding: "2px 8px", fontWeight: 800 }}>{typeInfo?.label}</span>
              <span style={{ fontSize: 11, background: cat?.color+"22", color: cat?.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{cat?.label}</span>
              {rec && rec.id !== "none" && <span style={{ fontSize: 11, background: "#EEF2FF", color: "#6366F1", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{rec.emoji} {rec.label}</span>}
              {itemPeople.map(p => <span key={p.id} style={{ fontSize: 11, background: p.color+"22", color: p.color, borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{p.emoji} {p.label}</span>)}
              {item.type === "task" && <>
                <span style={{ fontSize: 11, background: "#F3F4F6", color: "#6B7280", borderRadius: 20, padding: "2px 8px" }}>{urg?.emoji} {urg?.label}</span>
                <span style={{ fontSize: 11, background: "#F3F4F6", color: "#6B7280", borderRadius: 20, padding: "2px 8px" }}>{eff?.emoji} {eff?.label}</span>
                {item.blocksOthers && <span style={{ fontSize: 11, background: "#FFF3E0", color: "#E65100", borderRadius: 20, padding: "2px 8px" }}>🔗 Blocks others</span>}
                {item.lowEnergy    && <span style={{ fontSize: 11, background: "#F3E5F5", color: "#7B1FA2", borderRadius: 20, padding: "2px 8px" }}>🧠 Low energy ok</span>}
              </>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
          {item.type === "task" && <span style={{ fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, borderRadius: 20, padding: "3px 9px", whiteSpace: "nowrap" }}>{badge.label}</span>}
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => onEdit(item)} style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
            <button onClick={() => onDelete(item.id)} style={{ background: "#FEF2F2", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Day Column (week view) ───────────────────────────────────────────────────

function DayColumn({ dk, items, doneMap, onComplete, onDelete, onEdit, onSelectDay, isToday, isSelected }) {
  const d = parseDate(dk);
  const dayItems = items
    .filter(item => itemAppliesToDate(item, dk))
    .sort((a,b) => {
      const aDone = getDailyDone(doneMap, a.id, dk);
      const bDone = getDailyDone(doneMap, b.id, dk);
      if (aDone !== bDone) return aDone ? 1 : -1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1; if (b.time) return 1;
      return getPriorityScore(b) - getPriorityScore(a);
    });
  const pending = dayItems.filter(i => !getDailyDone(doneMap, i.id, dk)).length;

  return (
    <div style={{
      flex: "0 0 260px", background: isSelected ? "#FAFAFF" : "white",
      borderRadius: 16, padding: "12px 10px",
      boxShadow: isSelected ? "0 0 0 2px #A78BFA" : "0 2px 8px rgba(0,0,0,0.06)",
      scrollSnapAlign: "start",
    }}>
      <div onClick={() => onSelectDay(dk)} style={{
        textAlign: "center", marginBottom: 10, cursor: "pointer",
        background: isToday ? "linear-gradient(135deg,#7C3AED,#EC4899)" : isSelected ? "#EDE9FE" : "#F9FAFB",
        borderRadius: 12, padding: "8px 4px",
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: isToday ? "rgba(255,255,255,0.8)" : "#9CA3AF", letterSpacing: 1 }}>{DAY_NAMES[d.getDay()].toUpperCase()}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: isToday ? "white" : isSelected ? "#7C3AED" : "#1E1B4B", fontFamily: "'Fredoka One', cursive" }}>{d.getDate()}</div>
        {pending > 0 && <div style={{ fontSize: 10, fontWeight: 800, color: isToday ? "rgba(255,255,255,0.9)" : "#A78BFA" }}>{pending} left</div>}
      </div>
      {dayItems.length === 0 ? (
        <div style={{ textAlign: "center", color: "#D1D5DB", fontSize: 12, padding: "16px 0" }}>
          <div style={{ fontSize: 20 }}>🌸</div>
          <div style={{ fontWeight: 700, marginTop: 3 }}>Free!</div>
        </div>
      ) : dayItems.map(item => {
        const done = getDailyDone(doneMap, item.id, dk);
        const cat = CATEGORIES.find(c => c.id === item.category);
        const typeInfo = ITEM_TYPES.find(t => t.id === item.type);
        return (
          <div key={item.id} style={{
            background: done ? "#F9FAFB" : "white", borderRadius: 10, padding: "7px 8px", marginBottom: 6,
            borderLeft: `4px solid ${item.type==="event" ? "#6366F1" : cat?.color||"#ddd"}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)", opacity: done ? 0.5 : 1,
            display: "flex", alignItems: "flex-start", gap: 6,
          }}>
            <button onClick={() => onComplete(item.id, dk)} style={{
              width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
              border: `2px solid ${done ? "#7EC8A4" : "#ccc"}`,
              background: done ? "#7EC8A4" : "white", cursor: "pointer",
              fontSize: 9, color: "white", display: "flex", alignItems: "center", justifyContent: "center",
            }}>{done ? "✓" : ""}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: done ? "#aaa" : "#1E1B4B", textDecoration: done ? "line-through" : "none", lineHeight: 1.3 }}>{item.text}</div>
              <div style={{ display: "flex", gap: 3, marginTop: 2, flexWrap: "wrap" }}>
                {item.time && <span style={{ fontSize: 9, color: "#6366F1", fontWeight: 700 }}>🕐 {formatTime(item.time)}</span>}
                <span style={{ fontSize: 9, color: typeInfo?.color, fontWeight: 700 }}>{typeInfo?.label}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 1 }}>
              <button onClick={() => onEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, padding: "1px" }}>✏️</button>
              <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, padding: "1px" }}>🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

function MonthCalendar({ items, selectedKey, onSelectDay, year, month }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const tk          = todayKey();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {DAY_SHORT.map((d,i) => <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: "#9CA3AF", padding: "3px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`}/>;
          const dk       = toDateKey(new Date(year, month, day));
          const dayItems = items.filter(item => itemAppliesToDate(item, dk));
          const pending  = dayItems.filter(t => !t.done).length;
          const hasEvent = dayItems.some(t => t.type==="event");
          const isToday  = dk === tk;
          const isSel    = dk === selectedKey;
          const isPast   = new Date(year,month,day) < new Date(new Date().setHours(0,0,0,0));
          const dots     = [...new Set(dayItems.flatMap(t => t.people||[]))].slice(0,3);

          return (
            <button key={dk} onClick={() => onSelectDay(dk)} style={{
              background: isSel ? "#7C3AED" : isToday ? "#EDE9FE" : "white",
              color:      isSel ? "white"   : isPast  ? "#9CA3AF" : "#1E1B4B",
              border:     isToday && !isSel ? "2px solid #A78BFA" : "2px solid transparent",
              borderRadius: 10, padding: "4px 2px", cursor: "pointer", transition: "all 0.15s",
              minHeight: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              boxShadow: isSel ? "0 4px 12px rgba(124,58,237,0.35)" : "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <span style={{ fontSize: 13, fontWeight: isToday||isSel ? 800 : 600, lineHeight: 1 }}>{day}</span>
              {hasEvent && <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSel ? "rgba(255,255,255,0.9)" : "#6366F1", display: "inline-block" }}/>}
              {pending > 0 && <span style={{ fontSize: 9, fontWeight: 800, background: isSel ? "rgba(255,255,255,0.2)" : "#F3F4F6", color: isSel ? "white" : "#6B7280", borderRadius: 20, padding: "0 4px" }}>{pending}</span>}
              {dots.length > 0 && (
                <div style={{ display: "flex", gap: 2 }}>
                  {dots.map(pid => { const p = PEOPLE.find(x=>x.id===pid); return <span key={pid} style={{ width: 4, height: 4, borderRadius: "50%", background: isSel ? "rgba(255,255,255,0.7)" : p?.color }}/>; })}
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
  const [items,       setItems]       = useState([]);
  const [doneMap,     setDoneMap]     = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [year,        setYear]        = useState(now.getFullYear());
  const [month,       setMonth]       = useState(now.getMonth());
  const [selectedKey, setSelectedKey] = useState(todayKey());
  const [viewMode,    setViewMode]    = useState("month");
  const [showDone,    setShowDone]    = useState(false);
  const [filterWho,   setFilterWho]   = useState("all");
  const [filterType,  setFilterType]  = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const quote = useMemo(() => getDailyQuote(), []);

  // ── Load data on mount ──
  useEffect(() => {
    async function load() {
      try {
        const [itemRows, doneRows] = await Promise.all([api.getItems(), api.getDoneMap()]);
        setItems(itemRows.map(appItem));
        setDoneMap(doneRows);
      } catch (e) {
        setError("Couldn't connect. Check your internet connection.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── CRUD ──
  const addItem = async (data) => {
    const newItem = { ...data, id: Date.now() };
    try {
      const saved = await api.addItem(newItem);
      setItems(prev => [...prev, saved]);
    } catch { setError("Couldn't save item. Try again."); }
  };

  const deleteItem = async (id) => {
    setItems(prev => prev.filter(t => t.id !== id));
    try { await api.deleteItem(id); }
    catch { setError("Couldn't delete. Try again."); }
  };

  const saveItem = async (updated) => {
    setItems(prev => prev.map(t => t.id === updated.id ? updated : t));
    try { await api.updateItem(updated); }
    catch { setError("Couldn't save changes. Try again."); }
  };

  const completeItem = async (id, dk) => {
    const k = doneKey(id, dk);
    const newVal = !doneMap[k];
    setDoneMap(prev => ({ ...prev, [k]: newVal }));
    try { await api.setDone(k, newVal); }
    catch { setError("Couldn't save. Try again."); }
  };

  const prevMonth = () => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };
  const prevWeek  = () => { const d=parseDate(selectedKey); d.setDate(d.getDate()-7); setSelectedKey(toDateKey(d)); };
  const nextWeek  = () => { const d=parseDate(selectedKey); d.setDate(d.getDate()+7); setSelectedKey(toDateKey(d)); };

  const weekDates = getWeekDates(selectedKey);

  const allDayItems = items.filter(item => itemAppliesToDate(item, selectedKey));
  const dayItems = allDayItems
    .filter(t => showDone || !getDailyDone(doneMap, t.id, selectedKey))
    .filter(t => filterWho  === "all" || (t.people||[]).includes(filterWho))
    .filter(t => filterType === "all" || t.type === filterType)
    .sort((a,b) => {
      const aDone = getDailyDone(doneMap, a.id, selectedKey);
      const bDone = getDailyDone(doneMap, b.id, selectedKey);
      if (aDone !== bDone) return aDone ? 1 : -1;
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1; if (b.time) return 1;
      return getPriorityScore(b) - getPriorityScore(a);
    });

  const doneCount  = allDayItems.filter(t => getDailyDone(doneMap, t.id, selectedKey)).length;
  const totalCount = allDayItems.length;
  const progress   = totalCount ? Math.round((doneCount/totalCount)*100) : 0;

  const selDate   = parseDate(selectedKey);
  const isToday   = selectedKey === todayKey();
  const isPast    = selDate < new Date(new Date().setHours(0,0,0,0));
  const dateLabel = isToday ? "Today ✨" : selDate.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" });

  const handleSelectDay = (dk) => { setSelectedKey(dk); if (viewMode==="month") setViewMode("day"); };

  const weekStart = parseDate(weekDates[0]);
  const weekEnd   = parseDate(weekDates[6]);
  const weekLabel = `${weekStart.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${weekEnd.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`;

  // ── Loading / Error screens ──
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#F0EBFF,#FDF2F8)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Nunito', sans-serif" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#7C3AED" }}>Loading your planner…</div>
      <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>Connecting to the cloud ☁️</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#F0EBFF; min-height:100vh; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:#C4B5FD; border-radius:3px; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#F0EBFF 0%,#FDF2F8 50%,#ECFDF5 100%)", fontFamily:"'Nunito', sans-serif", paddingBottom:80 }}>

        {/* Error banner */}
        {error && (
          <div style={{ background:"#FEF2F2", borderBottom:"2px solid #FECACA", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:"#EF4444", fontWeight:700 }}>⚠️ {error}</span>
            <button onClick={()=>setError(null)} style={{ background:"none", border:"none", color:"#EF4444", cursor:"pointer", fontSize:16, fontWeight:800 }}>✕</button>
          </div>
        )}

        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#6D28D9 0%,#9333EA 55%,#EC4899 100%)", padding:"20px 16px 16px", borderRadius:"0 0 28px 28px", boxShadow:"0 8px 30px rgba(109,40,217,0.25)", marginBottom:16 }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"'Fredoka One', cursive", fontSize:24, color:"white", letterSpacing:0.5 }}>✨ My Day Planner</div>
                <div style={{ color:"rgba(255,255,255,0.75)", fontSize:12, marginTop:2, fontWeight:600, display:"flex", gap:8, flexWrap:"wrap" }}>
                  {PEOPLE.map(p => <span key={p.id}>{p.emoji} {p.label}</span>)}
                </div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:12, padding:"6px 10px", fontSize:11, color:"rgba(255,255,255,0.8)", fontWeight:700, textAlign:"center" }}>
                ☁️ Synced
              </div>
            </div>
            <div style={{ marginTop:12, background:"rgba(255,255,255,0.12)", borderRadius:14, padding:"10px 14px", backdropFilter:"blur(8px)" }}>
              <div style={{ fontSize:13, color:"white", fontWeight:600, fontStyle:"italic", lineHeight:1.4 }}>"{quote.text}"</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.65)", marginTop:4 }}>{quote.author}</div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:600, margin:"0 auto", padding:"0 12px" }}>

          {/* View Toggle */}
          <div style={{ display:"flex", gap:6, marginBottom:14, background:"white", borderRadius:16, padding:5, boxShadow:"0 2px 8px rgba(0,0,0,0.07)" }}>
            {[{ id:"month", label:"📅 Month" }, { id:"week", label:"📋 Week" }, { id:"day", label:"☀️ Day" }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                flex:1, background: viewMode===v.id ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "transparent",
                color: viewMode===v.id ? "white" : "#9CA3AF",
                border:"none", borderRadius:12, padding:"10px 6px",
                fontSize:13, fontFamily:"'Nunito', sans-serif", fontWeight:800, cursor:"pointer", transition:"all 0.2s",
                boxShadow: viewMode===v.id ? "0 3px 10px rgba(124,58,237,0.25)" : "none",
              }}>{v.label}</button>
            ))}
          </div>

          {/* MONTH VIEW */}
          {viewMode === "month" && (
            <div style={{ background:"white", borderRadius:24, boxShadow:"0 4px 24px rgba(0,0,0,0.08)", padding:"16px 14px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <button onClick={prevMonth} style={{ background:"#F3F4F6", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:18, color:"#6D28D9", fontWeight:800 }}>‹</button>
                <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:18, color:"#1E1B4B" }}>{MONTH_NAMES[month]} {year}</span>
                <button onClick={nextMonth} style={{ background:"#F3F4F6", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:18, color:"#6D28D9", fontWeight:800 }}>›</button>
              </div>
              <MonthCalendar items={items} selectedKey={selectedKey} onSelectDay={handleSelectDay} year={year} month={month} />
              <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"center", flexWrap:"wrap" }}>
                {PEOPLE.map(p => (
                  <div key={p.id} style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:p.color, display:"inline-block" }}/>
                    <span style={{ fontSize:10, color:"#9CA3AF", fontWeight:700 }}>{p.emoji} {p.label}</span>
                  </div>
                ))}
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#6366F1", display:"inline-block" }}/>
                  <span style={{ fontSize:10, color:"#9CA3AF", fontWeight:700 }}>📅 Event</span>
                </div>
              </div>
              <div style={{ textAlign:"center", marginTop:10, fontSize:12, color:"#A78BFA", fontWeight:700 }}>👆 Tap a day to see its tasks</div>
            </div>
          )}

          {/* WEEK VIEW */}
          {viewMode === "week" && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <button onClick={prevWeek} style={{ background:"white", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:18, color:"#6D28D9", fontWeight:800, boxShadow:"0 2px 6px rgba(0,0,0,0.08)" }}>‹</button>
                <span style={{ fontFamily:"'Fredoka One', cursive", fontSize:16, color:"#1E1B4B" }}>{weekLabel}</span>
                <button onClick={nextWeek} style={{ background:"white", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:18, color:"#6D28D9", fontWeight:800, boxShadow:"0 2px 6px rgba(0,0,0,0.08)" }}>›</button>
              </div>
              <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8, scrollSnapType:"x mandatory" }}>
                {weekDates.map(dk => (
                  <DayColumn key={dk} dk={dk} items={items} doneMap={doneMap}
                    onComplete={completeItem} onDelete={deleteItem} onEdit={setEditingItem}
                    onSelectDay={(d) => { setSelectedKey(d); setViewMode("day"); }}
                    isToday={dk===todayKey()} isSelected={dk===selectedKey}
                  />
                ))}
              </div>
            </div>
          )}

          {/* DAY VIEW */}
          {viewMode === "day" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <button onClick={()=>{ const d=parseDate(selectedKey); d.setDate(d.getDate()-1); setSelectedKey(toDateKey(d)); }} style={{ background:"white", border:"none", borderRadius:10, width:34, height:34, cursor:"pointer", fontSize:16, color:"#6D28D9", fontWeight:800, boxShadow:"0 2px 6px rgba(0,0,0,0.08)" }}>‹</button>
                  <div>
                    <div style={{ fontFamily:"'Fredoka One', cursive", fontSize:18, color:"#1E1B4B" }}>{dateLabel}</div>
                    {totalCount > 0 && <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, marginTop:1 }}>{doneCount} of {totalCount} done</div>}
                  </div>
                  <button onClick={()=>{ const d=parseDate(selectedKey); d.setDate(d.getDate()+1); setSelectedKey(toDateKey(d)); }} style={{ background:"white", border:"none", borderRadius:10, width:34, height:34, cursor:"pointer", fontSize:16, color:"#6D28D9", fontWeight:800, boxShadow:"0 2px 6px rgba(0,0,0,0.08)" }}>›</button>
                </div>
                {totalCount > 0 && (
                  <div style={{ position:"relative", width:42, height:42, flexShrink:0 }}>
                    <svg width={42} height={42} style={{ transform:"rotate(-90deg)" }}>
                      <circle cx={21} cy={21} r={16} fill="none" stroke="#EDE9FE" strokeWidth={4}/>
                      <circle cx={21} cy={21} r={16} fill="none" stroke="#7C3AED" strokeWidth={4}
                        strokeDasharray={`${2*Math.PI*16}`}
                        strokeDashoffset={`${2*Math.PI*16*(1-progress/100)}`}
                        strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.4s ease" }}/>
                    </svg>
                    <span style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#6D28D9" }}>{progress}%</span>
                  </div>
                )}
              </div>

              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                {[{ id:"all", label:"All", color:"#7C3AED" }, ...ITEM_TYPES].map(t => (
                  <button key={t.id} onClick={() => setFilterType(t.id)} style={{
                    background: filterType===t.id ? (t.color||"#7C3AED") : "white", color: filterType===t.id ? "white" : "#6B7280",
                    border:"none", borderRadius:20, padding:"5px 12px", fontSize:12,
                    fontFamily:"'Nunito', sans-serif", fontWeight:700, cursor:"pointer",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.07)", transition:"all 0.15s",
                  }}>{t.label}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                {[{ id:"all", label:"Everyone", color:"#7C3AED", emoji:"" }, ...PEOPLE].map(p => (
                  <button key={p.id} onClick={() => setFilterWho(p.id)} style={{
                    background: filterWho===p.id ? p.color : "white", color: filterWho===p.id ? "white" : "#6B7280",
                    border:"none", borderRadius:20, padding:"5px 12px", fontSize:12,
                    fontFamily:"'Nunito', sans-serif", fontWeight:700, cursor:"pointer",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.07)", transition:"all 0.15s",
                  }}>{p.emoji} {p.label}</button>
                ))}
              </div>

              <AddItemForm onAdd={addItem} dateKey={selectedKey} />

              {dayItems.length === 0 ? (
                <div style={{ textAlign:"center", padding:"36px 20px", color:"#D1D5DB" }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>{isPast ? "🌿" : "🌸"}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#A78BFA" }}>{isPast ? "Nothing here" : "All clear!"}</div>
                  <div style={{ fontSize:13, marginTop:4 }}>{isPast ? "No items for this day." : "Add a task or event above! 💜"}</div>
                </div>
              ) : dayItems.map(item => (
                <ItemCard key={item.id} item={item} dateKey={selectedKey}
                  done={getDailyDone(doneMap, item.id, selectedKey)}
                  onComplete={completeItem} onDelete={deleteItem} onEdit={setEditingItem}
                />
              ))}

              {allDayItems.some(t => getDailyDone(doneMap, t.id, selectedKey)) && (
                <button onClick={() => setShowDone(v=>!v)} style={{
                  background:"none", border:"2px dashed #DDD6FE", borderRadius:12,
                  color:"#A78BFA", fontFamily:"'Nunito', sans-serif", fontWeight:700,
                  fontSize:13, padding:"9px 18px", cursor:"pointer", width:"100%", marginTop:6,
                }}>
                  {showDone ? "🙈 Hide completed" : `🎊 Show ${doneCount} completed item${doneCount!==1?"s":""}`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {editingItem && <EditModal item={editingItem} onSave={saveItem} onClose={() => setEditingItem(null)} />}
    </>
  );
}