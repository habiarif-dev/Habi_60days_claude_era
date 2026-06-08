import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend
} from "recharts";

const CITIES = [
  { id:"islamabad", name:"Islamabad", short:"ISB", province:"ICT", aqi:139, pm25:44.2, pm10:62.5, no2:42, co:0.9, category:"Poor", wqScore:30, airScore:38, envScore:34, airGrade:"D", wqGrade:"D+", hairRisk:"High", skinRisk:"High", wqNote:"Arsenic & bacterial contamination above WHO limits", pop:"1.1M" },
  { id:"lahore",     name:"Lahore",     short:"LHR", province:"Punjab",      aqi:188, pm25:68,   pm10:180,  no2:55, co:1.4, category:"Very Poor", wqScore:22, airScore:18, envScore:20, airGrade:"F",  wqGrade:"F",  hairRisk:"High",     skinRisk:"High",     wqNote:"Arsenic far above limits; widespread bacterial contamination", pop:"14M" },
  { id:"karachi",    name:"Karachi",    short:"KHI", province:"Sindh",       aqi:88,  pm25:28,   pm10:75,   no2:38, co:0.7, category:"Moderate",  wqScore:25, airScore:55, envScore:40, airGrade:"C",  wqGrade:"D",  hairRisk:"High",     skinRisk:"High",     wqNote:"High TDS, hardness & chloride above permissible limits", pop:"16M" },
  { id:"peshawar",   name:"Peshawar",   short:"PEW", province:"KPK",         aqi:136, pm25:44,   pm10:130,  no2:40, co:0.8, category:"Poor",      wqScore:35, airScore:40, envScore:37, airGrade:"D",  wqGrade:"D+", hairRisk:"Moderate", skinRisk:"High",     wqNote:"Turbidity & bacterial contamination in supply water", pop:"2.2M" },
  { id:"rawalpindi", name:"Rawalpindi", short:"RWP", province:"Punjab",      aqi:153, pm25:52,   pm10:148,  no2:47, co:1.1, category:"Poor",      wqScore:28, airScore:30, envScore:29, airGrade:"D",  wqGrade:"D",  hairRisk:"High",     skinRisk:"High",     wqNote:"Bacterial contamination found in 94% of samples (2023)", pop:"2.2M" },
  { id:"faisalabad", name:"Faisalabad", short:"LYP", province:"Punjab",      aqi:200, pm25:80,   pm10:220,  no2:60, co:1.6, category:"Very Poor", wqScore:20, airScore:12, envScore:16, airGrade:"F",  wqGrade:"F",  hairRisk:"High",     skinRisk:"High",     wqNote:"Highest industrial pollution; severely degraded groundwater", pop:"3.6M" },
  { id:"multan",     name:"Multan",     short:"MUX", province:"Punjab",      aqi:165, pm25:58,   pm10:165,  no2:50, co:1.2, category:"Poor",      wqScore:27, airScore:24, envScore:25, airGrade:"F",  wqGrade:"D",  hairRisk:"High",     skinRisk:"High",     wqNote:"Elevated nitrates & fluoride; surface water contamination", pop:"1.9M" },
  { id:"quetta",     name:"Quetta",     short:"UET", province:"Balochistan", aqi:78,  pm25:22,   pm10:95,   no2:28, co:0.5, category:"Moderate",  wqScore:45, airScore:62, envScore:53, airGrade:"C",  wqGrade:"C",  hairRisk:"Moderate", skinRisk:"Moderate", wqNote:"Relatively better; some fluoride concerns in groundwater", pop:"1.1M" },
  { id:"gilgit",     name:"Gilgit",     short:"GIL", province:"Gilgit-B",   aqi:18,  pm25:4,    pm10:12,   no2:8,  co:0.1, category:"Good",      wqScore:72, airScore:95, envScore:83, airGrade:"A",  wqGrade:"B",  hairRisk:"Low",      skinRisk:"Low",      wqNote:"Clean mountain water; within most WHO limits", pop:"0.3M" },
  { id:"hyderabad",  name:"Hyderabad",  short:"HDD", province:"Sindh",      aqi:72,  pm25:20,   pm10:68,   no2:30, co:0.5, category:"Moderate",  wqScore:30, airScore:60, envScore:45, airGrade:"C",  wqGrade:"D",  hairRisk:"Moderate", skinRisk:"High",     wqNote:"Elevated TDS and arsenic levels detected", pop:"1.8M" },
];

const ISLAMABAD = CITIES[0];

function aqiColor(v) {
  if (v <= 50) return "#22c55e";
  if (v <= 100) return "#84cc16";
  if (v <= 150) return "#f59e0b";
  if (v <= 200) return "#f97316";
  if (v <= 300) return "#ef4444";
  return "#991b1b";
}
function riskColor(r) {
  return r === "Low" ? "#22c55e" : r === "Moderate" ? "#f59e0b" : "#ef4444";
}
function riskEmoji(r) {
  return r === "Low" ? "🟢" : r === "Moderate" ? "🟡" : "🔴";
}
function gradeColor(g) {
  if (g === "A") return "#22c55e";
  if (g === "B") return "#84cc16";
  if (g === "C") return "#f59e0b";
  if (g === "D" || g === "D+") return "#f97316";
  return "#ef4444";
}
function scoreColor(s) {
  if (s >= 70) return "#22c55e";
  if (s >= 45) return "#f59e0b";
  return "#ef4444";
}

// ─── SHARED STYLES ──────────────────────────────────────────
const S = {
  card: {
    background: "#0d1424",
    border: "1px solid rgba(99,179,237,0.13)",
    borderRadius: 14,
    padding: 16,
  },
  label: {
    fontFamily: "'Syne',sans-serif",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  sectionTitle: {
    fontFamily: "'Syne',sans-serif",
    fontSize: 20,
    fontWeight: 800,
    background: "linear-gradient(90deg,#e2e8f0,#94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 2,
  },
  sub: { fontSize: 12, color: "#64748b", marginBottom: 16, fontFamily: "'DM Sans',sans-serif" },
};

// ─── TOOLTIP ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#121a2e", border: "1px solid rgba(99,179,237,0.2)", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", color: "#e2e8f0" }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#38bdf8" }}>{p.name}: <b>{p.value}</b></div>
      ))}
    </div>
  );
};

// ─── SCORE RING ─────────────────────────────────────────────
function ScoreRing({ score, label, size = 100 }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const c = scoreColor(score);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={8}
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ filter: `drop-shadow(0 0 6px ${c}88)` }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size * 0.22, fill: c }}>{score}</text>
        <text x="50%" y="68%" textAnchor="middle"
          style={{ fontFamily: "'DM Sans',sans-serif", fontSize: size * 0.1, fill: "#64748b" }}>/100</text>
      </svg>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, color: "#94a3b8", textAlign: "center", maxWidth: size }}>{label}</div>
    </div>
  );
}

// ─── AQI GAUGE BAR ──────────────────────────────────────────
function AQIBar({ aqi, max = 300 }) {
  const pct = Math.min((aqi / max) * 100, 100);
  const c = aqiColor(aqi);
  return (
    <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3, boxShadow: `0 0 8px ${c}88`, transition: "width 0.8s ease" }} />
    </div>
  );
}

// ─── PROG BAR ───────────────────────────────────────────────
function ProgBar({ value, color, max = 100 }) {
  return (
    <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: "width 1s ease" }} />
    </div>
  );
}

// ─── METRIC CARD ────────────────────────────────────────────
function MetricCard({ label, value, sub, accentColor = "#38bdf8" }) {
  return (
    <div style={{ ...S.card, position: "relative", overflow: "hidden", transition: "transform 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accentColor, borderRadius: "14px 14px 0 0" }} />
      <div style={S.label}>{label}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: accentColor, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{sub}</div>}
    </div>
  );
}

// ─── BADGE ──────────────────────────────────────────────────
function Badge({ children, color }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: "'Syne',sans-serif", letterSpacing: "0.05em", background: `${color}18`, color, border: `1px solid ${color}44`, margin: 2 }}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════
function DashboardTab() {
  const sorted = [...CITIES].sort((a, b) => b.aqi - a.aqi);
  const chartData = sorted.map(c => ({ name: c.short, AQI: c.aqi, fill: aqiColor(c.aqi) }));

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0d1424,#111827)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 18, padding: "20px 22px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(56,189,248,0.07),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, color: "#38bdf8", fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>📍 Islamabad, Pakistan — Live</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 72, fontWeight: 900, lineHeight: 1, color: aqiColor(139) }}>{ISLAMABAD.aqi}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: aqiColor(139), marginTop: 2 }}>⚠️ Poor — Unhealthy for Sensitive Groups</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>
          PM2.5: 44.2 µg/m³ &nbsp;·&nbsp; PM10: 62.5 µg/m³ &nbsp;·&nbsp; NO₂: 42 µg/m³ &nbsp;·&nbsp; Temp: 31°C &nbsp;·&nbsp; Humidity: 19%
        </div>
        <AQIBar aqi={139} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569", marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>
          <span>0 Good</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300 Severe</span>
        </div>
      </div>

      {/* Metric grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 14 }}>
        <MetricCard label="Avg AQI Pakistan" value="156" sub="2025 national avg" accentColor="#38bdf8" />
        <MetricCard label="Highest AQI City" value="Lahore" sub="AQI 188 — Very Poor" accentColor="#ef4444" />
        <MetricCard label="Cleanest City" value="Gilgit" sub="AQI 18 — Good ✅" accentColor="#22c55e" />
        <MetricCard label="Cities Analyzed" value="10" sub="Major urban centers" accentColor="#f59e0b" />
        <MetricCard label="Env Health Score" value="34" sub="Islamabad / 100" accentColor="#a78bfa" />
        <MetricCard label="WHO Exceedance" value="14×" sub="Above WHO PM2.5 limit" accentColor="#f87171" />
      </div>

      {/* Executive summary */}
      <div style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.05),rgba(52,211,153,0.03))", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: "#38bdf8", marginBottom: 8 }}>📄 Executive Summary</div>
        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75, fontFamily: "'DM Sans',sans-serif" }}>
          Islamabad records a current AQI of <b style={{ color: "#f97316" }}>139 (Poor)</b>, placing it in the Unhealthy for Sensitive Groups category. PM2.5 at <b style={{ color: "#38bdf8" }}>44.2 µg/m³</b> is nearly 9× above WHO guidelines. Among Pakistan's 10 major cities, <b style={{ color: "#ef4444" }}>Lahore</b> is the most polluted (AQI 188) and <b style={{ color: "#22c55e" }}>Gilgit</b> is the cleanest (AQI 18). The most shocking anomaly: <b style={{ color: "#f59e0b" }}>Faisalabad's PM10 reached 568 µg/m³</b> during peak smog — 38× above WHO limits. Water quality across all cities shows widespread contamination exceeding WHO limits for TDS, arsenic and bacterial parameters.
        </div>
      </div>

      {/* Overview chart */}
      <div style={S.card}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>🏙 AQI — All 10 Cities</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "'Syne',sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="AQI" radius={[5,5,0,0]}>
              {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CITIES TAB
// ═══════════════════════════════════════════════════════════
function CitiesTab() {
  const [selected, setSelected] = useState("islamabad");
  const [sortBy, setSortBy] = useState("aqi");
  const [maxAqi, setMaxAqi] = useState(300);
  const [riskF, setRiskF] = useState("all");

  let list = [...CITIES].filter(c => c.aqi <= maxAqi);
  if (riskF === "poor") list = list.filter(c => c.aqi > 100);
  if (riskF === "good") list = list.filter(c => c.aqi <= 50);
  if (sortBy === "aqi") list.sort((a, b) => b.aqi - a.aqi);
  else if (sortBy === "aqi-asc") list.sort((a, b) => a.aqi - b.aqi);
  else if (sortBy === "pm25") list.sort((a, b) => b.pm25 - a.pm25);
  else if (sortBy === "wq") list.sort((a, b) => b.wqScore - a.wqScore);

  const city = CITIES.find(c => c.id === selected);

  return (
    <div>
      {/* Filters */}
      <div style={{ ...S.card, display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14, alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={S.label}>AQI Max: <span style={{ color: "#38bdf8" }}>≤{maxAqi}</span></div>
          <input type="range" min={18} max={300} value={maxAqi} onChange={e => setMaxAqi(+e.target.value)}
            style={{ width: "100%", accentColor: "#38bdf8", marginTop: 6 }} />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={S.label}>Sort By</div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ width: "100%", marginTop: 4, background: "#121a2e", border: "1px solid rgba(99,179,237,0.2)", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
            <option value="aqi">AQI High→Low</option>
            <option value="aqi-asc">AQI Low→High</option>
            <option value="pm25">PM2.5</option>
            <option value="wq">Water Quality</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <div style={S.label}>Health Risk</div>
          <select value={riskF} onChange={e => setRiskF(e.target.value)}
            style={{ width: "100%", marginTop: 4, background: "#121a2e", border: "1px solid rgba(99,179,237,0.2)", color: "#e2e8f0", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", outline: "none" }}>
            <option value="all">All Cities</option>
            <option value="poor">Poor AQI Only</option>
            <option value="good">Good AQI Only</option>
          </select>
        </div>
      </div>

      {/* City Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 10, marginBottom: 16 }}>
        {list.map(c => {
          const ac = aqiColor(c.aqi);
          return (
            <div key={c.id} onClick={() => setSelected(c.id)} style={{ ...S.card, cursor: "pointer", border: selected === c.id ? `1px solid ${ac}` : "1px solid rgba(99,179,237,0.13)", boxShadow: selected === c.id ? `0 0 16px ${ac}22` : "none", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>{c.province}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 900, color: ac, lineHeight: 1 }}>{c.aqi}</div>
                  <div style={{ fontSize: 9, color: ac, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{c.category}</div>
                </div>
              </div>
              <AQIBar aqi={c.aqi} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginTop: 10 }}>
                {[["PM2.5", `${c.pm25} µg/m³`], ["PM10", `${c.pm10} µg/m³`], ["Air Score", `${c.airScore}/100`], ["Water Score", `${c.wqScore}/100`]].map(([k, v]) => (
                  <div key={k} style={{ background: "#121a2e", borderRadius: 7, padding: "5px 7px" }}>
                    <div style={{ fontSize: 9, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>{k}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* City Detail */}
      {city && (
        <div style={{ ...S.card, border: `1px solid ${aqiColor(city.aqi)}44` }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{city.name} — Detailed Report</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8, marginBottom: 14 }}>
            {[
              ["AQI", city.aqi, aqiColor(city.aqi), city.category],
              ["PM2.5", `${city.pm25} µg/m³`, aqiColor(city.aqi), `${(city.pm25/5).toFixed(1)}× WHO`],
              ["PM10", `${city.pm10} µg/m³`, "#f59e0b", "WHO: 45 µg/m³/yr"],
              ["Air Grade", city.airGrade, gradeColor(city.airGrade), `Score: ${city.airScore}/100`],
              ["Water Grade", city.wqGrade, gradeColor(city.wqGrade), `Score: ${city.wqScore}/100`],
              ["Env Score", city.envScore, scoreColor(city.envScore), "Overall /100"],
            ].map(([l, v, col, s]) => (
              <div key={l} style={{ background: "#121a2e", borderRadius: 10, padding: 10, borderTop: `2px solid ${col}` }}>
                <div style={S.label}>{l}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: col, marginTop: 2 }}>{v}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div><div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>Hair Risk</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: riskColor(city.hairRisk) }}>{riskEmoji(city.hairRisk)} {city.hairRisk}</div></div>
              <div><div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>Skin Risk</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: riskColor(city.skinRisk) }}>{riskEmoji(city.skinRisk)} {city.skinRisk}</div></div>
              <div style={{ flex: 1, minWidth: 180 }}><div style={{ fontSize: 10, color: "#64748b", marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>Water Note</div><div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Sans',sans-serif" }}>{city.wqNote}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CHARTS TAB
// ═══════════════════════════════════════════════════════════
function ChartsTab() {
  const [pollutant, setPollutant] = useState("aqi");
  const sorted = [...CITIES].sort((a, b) => b.aqi - a.aqi);
  const ranked = [...CITIES].sort((a, b) => a.aqi - b.aqi);

  const aqiData = sorted.map(c => ({ name: c.short, AQI: c.aqi, fill: aqiColor(c.aqi) }));
  const pm25Data = sorted.map(c => ({ name: c.short, "PM2.5": c.pm25 }));
  const pm10Data = sorted.map(c => ({ name: c.short, "PM10": c.pm10 }));
  const wqData = [...CITIES].sort((a,b)=>b.wqScore-a.wqScore).map(c => ({ name: c.short, "Water Score": c.wqScore }));
  const rankData = ranked.map(c => ({ name: c.short, AQI: c.aqi, fill: aqiColor(c.aqi) }));

  const catCounts = [
    { name: "Good (0-50)", value: CITIES.filter(c => c.aqi <= 50).length, color: "#22c55e" },
    { name: "Moderate (51-100)", value: CITIES.filter(c => c.aqi > 50 && c.aqi <= 100).length, color: "#84cc16" },
    { name: "Poor (101-150)", value: CITIES.filter(c => c.aqi > 100 && c.aqi <= 150).length, color: "#f59e0b" },
    { name: "Very Poor (151+)", value: CITIES.filter(c => c.aqi > 150).length, color: "#ef4444" },
  ];

  const chartCard = (title, children) => (
    <div style={S.card}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 12 }}>
        {chartCard("📊 AQI Comparison",
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={aqiData} margin={{ top: 0, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Syne',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="AQI" radius={[5,5,0,0]}>{aqiData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard("🌫 PM2.5 Comparison (µg/m³)",
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pm25Data} margin={{ top: 0, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Syne',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="PM2.5" fill="#38bdf8" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard("🌪 PM10 Comparison (µg/m³)",
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pm10Data} margin={{ top: 0, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Syne',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="PM10" fill="#f59e0b" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard("🏆 City Ranking (Clean→Polluted)",
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rankData} layout="vertical" margin={{ top: 0, right: 4, left: 20, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Syne',sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="AQI" radius={[0,5,5,0]}>{rankData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartCard("📉 AQI Distribution",
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catCounts} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" paddingAngle={3}>
                {catCounts.map((d,i)=><Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10, fontFamily: "'DM Sans',sans-serif", color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartCard("💧 Water Quality Score",
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={wqData} margin={{ top: 0, right: 4, left: -22, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "'Syne',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Water Score" fill="#34d399" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HEALTH TAB
// ═══════════════════════════════════════════════════════════
function HealthTab() {
  const [cityId, setCityId] = useState("islamabad");
  const city = CITIES.find(c => c.id === cityId);
  const aqi = city.aqi;
  const wq = city.wqScore;

  function ar(low, mod, high) { return aqi <= 50 ? low : aqi <= 150 ? mod : high; }
  function wr(low, mod, high) { return wq >= 60 ? low : wq >= 35 ? mod : high; }

  const airImpacts = [
    { icon: "🫁", label: "Lungs & Breathing", items: [["Respiratory Irritation", ar("Low","Moderate","High")], ["Asthma Trigger Risk", ar("Low","Moderate","High")], ["Bronchial Inflammation", ar("Low","Moderate","High")]] },
    { icon: "😴", label: "Sleep Quality", items: [["Disrupted Sleep Patterns", ar("Low","Moderate","High")], ["Nasal Congestion", ar("Low","Moderate","High")]] },
    { icon: "⚡", label: "Energy & Focus", items: [["Fatigue & Lethargy", ar("Low","Moderate","High")], ["Cognitive Fog / Brain Fog", ar("Low","Moderate","High")]] },
    { icon: "🏃", label: "Exercise Performance", items: [["Outdoor Exercise Risk", ar("Low","Moderate","High")], ["Cardiovascular Strain", ar("Low","Moderate","High")], ["VO₂ Max Reduction", ar("Low","Moderate","High")]] },
    { icon: "❤️", label: "Long-term Health", items: [["Cardiovascular Disease", ar("Low","Moderate","High")], ["Lung Cancer Risk", ar("Low","Moderate","High")], ["Immune Suppression", ar("Low","Moderate","High")]] },
  ];

  const waterImpacts = [
    { icon: "💇", label: "Hair Health", items: [["Hair Fall / Breakage", wr("Low","Moderate","High")], ["Hair Dryness & Frizz", wr("Low","Moderate","High")], ["Scalp Irritation", wr("Low","Moderate","High")], ["Dandruff Risk", wr("Low","Moderate","High")]] },
    { icon: "🧴", label: "Skin Health", items: [["Skin Dryness", wr("Low","Moderate","High")], ["Acne & Breakouts", wr("Low","Moderate","High")], ["Sensitive Skin Flares", wr("Low","Moderate","High")], ["Eczema Risk", wr("Low","Moderate","High")]] },
  ];

  return (
    <div>
      <div style={{ ...S.card, marginBottom: 14 }}>
        <div style={S.label}>Select City</div>
        <select value={cityId} onChange={e => setCityId(e.target.value)}
          style={{ marginTop: 4, background: "#121a2e", border: "1px solid rgba(99,179,237,0.2)", color: "#e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%" }}>
          {CITIES.map(c => <option key={c.id} value={c.id}>{c.name} — AQI {c.aqi} ({c.category})</option>)}
        </select>
      </div>

      <div style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.05),rgba(52,211,153,0.03))", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 12, padding: 14, marginBottom: 14, display: "flex", gap: 16, flexWrap: "wrap", fontFamily: "'DM Sans',sans-serif" }}>
        <div><div style={{ fontSize: 10, color: "#64748b" }}>City</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15 }}>{city.name}</div></div>
        <div><div style={{ fontSize: 10, color: "#64748b" }}>AQI</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: aqiColor(aqi) }}>{aqi}</div></div>
        <div><div style={{ fontSize: 10, color: "#64748b" }}>Category</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: aqiColor(aqi) }}>{city.category}</div></div>
        <div><div style={{ fontSize: 10, color: "#64748b" }}>Water Score</div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#34d399" }}>{wq}/100</div></div>
      </div>

      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 10 }}>🌬 Air Quality Health Impacts</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 10, marginBottom: 16 }}>
        {airImpacts.map(g => (
          <div key={g.label} style={S.card}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 10, display: "flex", gap: 6 }}>{g.icon} {g.label}</div>
            {g.items.map(([name, risk]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "'DM Sans',sans-serif" }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{name}</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, color: riskColor(risk) }}>{riskEmoji(risk)} {risk}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "rgba(99,179,237,0.1)", margin: "4px 0 14px" }} />
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: "#34d399", marginBottom: 10 }}>💧 Water Quality Health Impacts</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 10 }}>
        {waterImpacts.map(g => (
          <div key={g.label} style={S.card}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 10, display: "flex", gap: 6 }}>{g.icon} {g.label}</div>
            {g.items.map(([name, risk]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "'DM Sans',sans-serif" }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{name}</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, color: riskColor(risk) }}>{riskEmoji(risk)} {risk}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REPORT CARD TAB
// ═══════════════════════════════════════════════════════════
function ReportTab() {
  const grades = [
    { label: "Air Quality", grade: "D", detail: "AQI 139 — Unhealthy for Sensitive Groups" },
    { label: "Water Quality", grade: "D+", detail: "Arsenic & bacterial contamination above WHO" },
    { label: "Hair Risk", grade: "F", detail: "Hard water + particulates damage hair follicles" },
    { label: "Skin Risk", grade: "F", detail: "PM2.5 clogs pores; hard water strips moisture barrier" },
    { label: "Exercise Safety", grade: "D", detail: "Outdoor exercise not recommended on Poor AQI days" },
    { label: "Sleep Environment", grade: "D", detail: "Particulate matter disrupts respiratory health at night" },
  ];
  const breakdown = [
    { label: "PM2.5 Component", score: 34, color: "#38bdf8" },
    { label: "PM10 Component", score: 45, color: "#f59e0b" },
    { label: "NO₂ Component", score: 50, color: "#a78bfa" },
    { label: "Water — Bacterial", score: 25, color: "#34d399" },
    { label: "Water — Chemical", score: 35, color: "#06b6d4" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16, justifyItems: "center" }}>
        <div style={{ ...S.card, width: "100%", display: "flex", justifyContent: "center" }}><ScoreRing score={34} label="Overall Env Score" size={100} /></div>
        <div style={{ ...S.card, width: "100%", display: "flex", justifyContent: "center" }}><ScoreRing score={38} label="Air Quality Score" size={100} /></div>
        <div style={{ ...S.card, width: "100%", display: "flex", justifyContent: "center" }}><ScoreRing score={30} label="Water Quality Score" size={100} /></div>
      </div>

      <div style={{ ...S.card, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>📋 Grade Card — Islamabad</div>
        {grades.map(g => (
          <div key={g.label} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${gradeColor(g.grade)}18`, border: `1px solid ${gradeColor(g.grade)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 16, color: gradeColor(g.grade), flexShrink: 0 }}>{g.grade}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700 }}>{g.label}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>{g.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>📊 Score Breakdown</div>
        {breakdown.map(b => (
          <div key={b.label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5, fontFamily: "'DM Sans',sans-serif" }}>
              <span style={{ color: "#94a3b8" }}>{b.label}</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: b.color }}>{b.score}/100</span>
            </div>
            <ProgBar value={b.score} color={b.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INSIGHTS TAB
// ═══════════════════════════════════════════════════════════
function InsightsTab() {
  const top3clean = [{ n: "Gilgit", aqi: 18 }, { n: "Hyderabad", aqi: 72 }, { n: "Karachi", aqi: 88 }];
  const top3polluted = [{ n: "Faisalabad", aqi: 200 }, { n: "Lahore", aqi: 188 }, { n: "Multan", aqi: 165 }];

  const insightItems = [
    { icon: "⚡", bg: "rgba(245,158,11,0.12)", title: "Biggest Anomaly — Faisalabad's PM10", body: "Faisalabad recorded PM10 at 568 µg/m³ during peak smog season — among the highest globally, dwarfing WHO's 15 µg/m³ annual limit by 38×. Industrial textile dyeing combined with open waste burning and brick kilns creates a toxic particulate cocktail unlike any other city in this dataset." },
    { icon: "🌍", bg: "rgba(239,68,68,0.12)", title: "Most Surprising: Pakistan = World's #1 Most Polluted Country", body: "Pakistan became the world's most polluted country in 2025 (IQAir World Air Quality Report), overtaking Bangladesh and Chad. Average annual PM2.5 of 67.3 µg/m³ equals smoking ~2 cigarettes per day just by breathing outdoors in Lahore — every single day of the year." },
    { icon: "🏔", bg: "rgba(52,211,153,0.12)", title: "Gilgit-Baltistan — Nature's Air Purifier", body: "Gilgit's AQI of ~18 is comparable to Scandinavian cities — yet it sits in the same country as some of the world's most polluted urban centers. High altitude (1,500m+), sparse industrial activity and mountain winds create an extraordinary clean-air haven just 300 km from Islamabad." },
    { icon: "💧", bg: "rgba(56,189,248,0.12)", title: "Water Crisis Hidden in Every City", body: "COMSATS University research (2023) confirmed bacterial contamination in drinking water across ALL major cities studied — Karachi, Lahore, Peshawar, Abbottabad and Gilgit. Arsenic far exceeds WHO limits in Lahore groundwater. Karachi's TDS, hardness and chloride are all above permissible levels." },
    { icon: "📈", bg: "rgba(167,139,250,0.12)", title: "Seasonal Smog Phenomenon", body: "Lahore's AQI spiked to an extraordinary 563 in October 2025 — classified Hazardous, making it the world's #1 most polluted city for that period. This annual winter smog crisis is driven by crop stubble burning in Punjab, brick kilns, vehicle emissions, and temperature inversions trapping pollutants near the ground." },
    { icon: "🚿", bg: "rgba(249,115,22,0.12)", title: "Islamabad's Hidden Water Problem", body: "Despite being the capital, 94% of Islamabad/Rawalpindi water samples were found bacteriologically contaminated in a 2023 study. High TDS causes mineral deposit buildup on hair cuticles and disrupts skin pH — a silent daily health impact affecting millions of residents who assume their water is safe because it looks clear." },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={S.card}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: "#22c55e", marginBottom: 12 }}>🏆 Top 3 Cleanest Cities</div>
          {top3clean.map((c, i) => (
            <div key={c.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 900, color: "#22c55e", minWidth: 26 }}>#{i+1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13 }}>{c.n}</div>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>AQI {c.aqi}</div>
              </div>
              <Badge color="#22c55e">{c.aqi}</Badge>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 12 }}>☠️ Top 3 Most Polluted</div>
          {top3polluted.map((c, i) => (
            <div key={c.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 900, color: "#ef4444", minWidth: 26 }}>#{i+1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13 }}>{c.n}</div>
                <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>AQI {c.aqi}</div>
              </div>
              <Badge color="#ef4444">{c.aqi}</Badge>
            </div>
          ))}
        </div>
      </div>
      {insightItems.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: 14, background: "#0d1424", border: "1px solid rgba(99,179,237,0.12)", borderRadius: 12, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif" }}>{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACTIONS TAB
// ═══════════════════════════════════════════════════════════
function ActionsTab() {
  const sections = [
    {
      icon: "☀️", title: "Daily Protective Actions", color: "#f59e0b",
      items: [
        "Check AQI every morning on IQAir or AQI.in before stepping outside",
        "Wear an N95/KN95 mask on Poor (AQI 100+) days — surgical masks don't filter PM2.5",
        "Limit time outdoors between 7–10 AM when pollution peaks in Islamabad",
        "Keep windows closed on high-pollution days; ventilate only in the evening when AQI drops",
        "Drink 3+ litres of filtered or bottled water daily to flush inhaled particulates",
      ],
    },
    {
      icon: "🏠", title: "Indoor Air Improvements", color: "#38bdf8",
      items: [
        "Invest in a HEPA air purifier (CADR ≥ 300 m³/hr) for your bedroom — it's the highest-ROI health investment",
        "Add indoor plants: Snake Plant, Peace Lily, Spider Plant absorb VOCs and boost humidity",
        "Use exhaust fans while cooking to remove combustion particles instantly",
        "Avoid scented candles, incense, and aerosol sprays indoors — they spike indoor PM2.5",
        "Vacuum with a HEPA-filter vacuum weekly; particulates settle deep into carpets and upholstery",
      ],
    },
    {
      icon: "🏃", title: "Outdoor Activity Guidance", color: "#34d399",
      items: [
        "AQI below 100: outdoor exercise is safe — ideal in F-6, F-7 or Margalla Hills green zones",
        "AQI 100–150: sensitive groups (asthma, elderly, children) should stay indoors",
        "AQI above 150: postpone all outdoor workouts; switch to indoor gym or home yoga",
        "Early-morning Margalla Hills hikes before 8 AM offer the cleanest air of the day",
      ],
    },
    {
      icon: "💆", title: "Hair-Care Recommendations", color: "#a78bfa",
      items: [
        "Install a shower filter (Sprite or AquaBliss) to remove chlorine, TDS and hard minerals — the single most impactful hair action",
        "Use a chelating shampoo (e.g., Malibu C, Ion Hard Water) once weekly to strip mineral buildup",
        "Apply a deep conditioner or hair mask every 5–7 days to restore moisture stripped by hard water",
        "Rinse with diluted apple cider vinegar (1 tbsp per litre of water) to restore scalp pH balance",
        "Avoid hot water washing — lukewarm or cool water closes cuticles and reduces mineral-induced frizz",
        "Massage scalp with argan or coconut oil twice weekly to strengthen follicles weakened by oxidative stress",
      ],
    },
    {
      icon: "🧴", title: "Skin-Care Recommendations", color: "#f87171",
      items: [
        "Double cleanse every evening: oil cleanser first to dissolve PM2.5 lodged in pores, then a foaming cleanser",
        "Apply antioxidant serum (Vitamin C + Niacinamide) every morning to neutralise particulate free radicals",
        "Use SPF 50+ mineral sunscreen — pollution-sensitised skin burns faster; UV and PM2.5 accelerate aging together",
        "Use a ceramide-rich moisturiser to repair the skin barrier stripped by hard water minerals",
        "Keep showers to 5–7 minutes max — hot showers remove protective oils already compromised by hard water",
      ],
    },
    {
      icon: "💧", title: "Water Quality Improvements", color: "#06b6d4",
      items: [
        "Use RO (Reverse Osmosis) filtered water for all drinking — removes arsenic, TDS, bacteria and heavy metals",
        "Never drink directly from the tap in Islamabad; at minimum boil water or use WHO-safe purification tablets",
        "Use filtered water for cooking too — contaminants concentrate as water evaporates",
        "Test home water annually with a basic TDS meter (available under PKR 500) and a bacterial test kit",
      ],
    },
  ];

  return (
    <div>
      <div style={{ background: "linear-gradient(135deg,rgba(56,189,248,0.05),rgba(52,211,153,0.03))", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: "#34d399", marginBottom: 8 }}>🎯 Top 3 Immediate Priorities for Islamabad</div>
        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, fontFamily: "'DM Sans',sans-serif" }}>
          <div><b style={{ color: "#38bdf8" }}>1. Get an N95 mask</b> — the single highest-impact action today for lung health at AQI 139.</div>
          <div><b style={{ color: "#a78bfa" }}>2. Install a shower filter</b> — reverses hair loss and skin dryness caused by Islamabad's hard water within 4–8 weeks.</div>
          <div><b style={{ color: "#34d399" }}>3. Use an RO water filter</b> — eliminates bacterial and arsenic contamination found in 94% of Islamabad water samples.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 12 }}>
        {sections.map(s => (
          <div key={s.title} style={S.card}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
              {s.icon} {s.title}
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {s.items.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#94a3b8", lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
                  <span style={{ color: s.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("dashboard");

  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "cities",    label: "🏙 Cities" },
    { id: "charts",    label: "📈 Charts" },
    { id: "health",    label: "🫁 Health" },
    { id: "report",    label: "📋 Report Card" },
    { id: "insights",  label: "💡 Insights" },
    { id: "actions",   label: "✅ Actions" },
  ];

  const TAB_TITLES = {
    dashboard: ["Environmental Overview", "Islamabad, Pakistan · June 2026 · Source: IQAir, WHO, COMSATS Research"],
    cities:    ["City Explorer", "Click any city to view detailed stats · AQI data: June 2026"],
    charts:    ["Pollution Visualizations", "Interactive charts across 10 major Pakistani cities"],
    health:    ["Health Impact Analysis", "Air quality & water quality effects on body, hair & skin"],
    report:    ["Personal Report Card", "Environmental Health Scores — Islamabad"],
    insights:  ["Intelligence Insights", "Data-driven observations · Pakistan 2025–2026"],
    actions:   ["Personalised Action Plan", "Based on Islamabad AQI 139 & water quality data"],
  };

  const content = {
    dashboard: <DashboardTab />,
    cities: <CitiesTab />,
    charts: <ChartsTab />,
    health: <HealthTab />,
    report: <ReportTab />,
    insights: <InsightsTab />,
    actions: <ActionsTab />,
  };

  return (
    <div style={{ background: "#070b14", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", position: "relative" }}>
      {/* Bg glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 40% at 10% 10%,rgba(56,189,248,0.06) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 90% 80%,rgba(52,211,153,0.05) 0%,transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(7,11,20,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,179,237,0.12)", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 16, background: "linear-gradient(90deg,#38bdf8,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          🌍 Env Health Analyzer
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Badge color="#38bdf8">📍 Islamabad</Badge>
          <Badge color="#34d399">● Live</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "10px 18px 0", borderBottom: "1px solid rgba(99,179,237,0.12)", overflowX: "auto", scrollbarWidth: "none", background: "rgba(7,11,20,0.5)", backdropFilter: "blur(12px)", position: "sticky", top: 50, zIndex: 99 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 12px", borderRadius: "8px 8px 0 0", fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", border: tab === t.id ? "1px solid rgba(99,179,237,0.25)" : "1px solid transparent", borderBottom: "none", background: tab === t.id ? "#0d1424" : "transparent", color: tab === t.id ? "#38bdf8" : "#64748b", outline: "none" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "18px 16px", position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto" }}>
        <div style={S.sectionTitle}>{TAB_TITLES[tab][0]}</div>
        <div style={S.sub}>{TAB_TITLES[tab][1]}</div>
        {content[tab]}
      </div>

      {/* Footer */}
      <div style={{ fontSize: 10, color: "#475569", padding: "12px 18px", borderTop: "1px solid rgba(99,179,237,0.08)", textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>
        Sources: IQAir World Air Quality Report 2025 · AQI.in · WHO Global Air Quality Guidelines 2021 · COMSATS University Water Quality Study 2023 · Updated June 2026
      </div>
    </div>
  );
}
