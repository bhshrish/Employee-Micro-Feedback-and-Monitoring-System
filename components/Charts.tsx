import { useId } from "react";

export function SvgBarChart({ data }: { data: { label: string; active: number; idle: number }[] }) {
  const max = 65;
  return <svg className="chart bar-chart" viewBox="0 0 720 260" role="img" aria-label="Daily active and idle activity timeline">
    {[0, 1, 2, 3].map((n) => <line key={n} x1="44" x2="704" y1={30 + n * 55} y2={30 + n * 55} className="grid-line"/>)}
    {data.map((item, i) => { const x = 58 + i * 72; const active = item.active / max * 160; const idle = item.idle / max * 160; return <g key={item.label}><rect x={x} y={195-active} width="24" height={active} rx="4" className="bar-active"/><rect x={x+28} y={195-idle} width="24" height={idle} rx="4" className="bar-idle"/><text x={x+24} y="225" textAnchor="middle">{item.label}</text></g>; })}
  </svg>;
}

export function WeeklyStacked({ data }: { data: { day: string; productive: number; neutral: number; idle: number }[] }) {
  return <svg className="chart stacked-chart" viewBox="0 0 620 270" role="img" aria-label="Weekly productive neutral and idle time stacked bars">
    {data.map((item, i) => { const total = item.productive + item.neutral + item.idle; const scale = 175 / Math.max(total, 8); const p = item.productive * scale, n = item.neutral * scale, d = item.idle * scale; const x = 65 + i * 108; return <g key={item.day}><rect x={x} y={205-p} width="54" height={p} rx="5" className="bar-active"/><rect x={x} y={205-p-n} width="54" height={n} className="bar-neutral"/><rect x={x} y={205-p-n-d} width="54" height={d} rx="5" className="bar-idle"/><text x={x+27} y="235" textAnchor="middle">{item.day}</text><text x={x+27} y={190-p-n-d} textAnchor="middle" className="chart-value">{total.toFixed(1)}h</text></g>; })}
  </svg>;
}

export function SvgDonut({ productive = 82, size = 190 }: { productive?: number; size?: number }) {
  const radius = 70, circumference = 2 * Math.PI * radius;
  return <div className="donut-wrap"><svg width={size} height={size} viewBox="0 0 180 180" role="img" aria-label={`${productive}% productive time`}><circle cx="90" cy="90" r={radius} className="donut-track"/><circle cx="90" cy="90" r={radius} className="donut-value" strokeDasharray={`${circumference * productive / 100} ${circumference}`} transform="rotate(-90 90 90)"/><text x="90" y="84" textAnchor="middle" className="donut-number">{productive}%</text><text x="90" y="110" textAnchor="middle">productive</text></svg></div>;
}

export function SvgLine({ data, label = "Four week productivity trend" }: { data: number[]; label?: string }) {
  const id = useId();
  const width = 700, height = 230, pad = 28;
  const points = data.map((n, i) => `${pad + i * ((width-pad*2)/(data.length-1))},${height-pad-((n-60)/35)*(height-pad*2)}`).join(" ");
  return <svg className="chart line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".22"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`${pad},${height-pad} ${points} ${width-pad},${height-pad}`} fill={`url(#${id})`}/><polyline points={points} fill="none" className="trend-line"/>{data.map((n,i) => { const [x,y] = points.split(" ")[i].split(","); return <circle key={i} cx={x} cy={y} r="4" className="trend-dot"><title>{n}%</title></circle>; })}</svg>;
}

export function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const min = Math.min(...data)-.2, max = Math.max(...data)+.2;
  const points = data.map((n,i) => `${i*(120/(data.length-1))},${44-((n-min)/(max-min||1))*36}`).join(" ");
  return <svg className="sparkline" viewBox="0 0 120 48" role="img" aria-label="Seven week morale trend"><polyline points={points} fill="none"/><circle cx="120" cy={points.split(" ").at(-1)?.split(",")[1]} r="3"/></svg>;
}

export function Heatmap() {
  const teams = ["Engineering", "Design", "Customer Success"];
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];
  const values = [[1,1,2,2,3,3],[0,1,1,0,1,1],[1,1,1,2,2,2]];
  return <div className="heatmap" role="img" aria-label="Burnout risk heatmap over six weeks"><div className="heatmap-row heatmap-header"><span/>{weeks.map((w) => <span key={w}>{w}</span>)}</div>{teams.map((team,i) => <div className="heatmap-row" key={team}><strong>{team}</strong>{values[i].map((v,j) => <span key={j} className={`heat-${v}`} title={`${team}, week ${j+1}: risk ${v} of 3`}>{v === 3 ? "High" : v === 2 ? "Watch" : v === 1 ? "Mild" : "Low"}</span>)}</div>)}</div>;
}
