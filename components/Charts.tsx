import { useId } from "react";

export function SvgBarChart({ data }: { data: { label: string; active: number; idle: number }[] }) {
  const max = Math.max(60, ...data.flatMap((item) => [item.active, item.idle]));
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
  const points = data.map((n, i) => `${pad + i * ((width-pad*2)/(data.length-1))},${height-pad-(Math.max(0, Math.min(100, n))/100)*(height-pad*2)}`).join(" ");
  return <svg className="chart line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".22"/><stop offset="1" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`${pad},${height-pad} ${points} ${width-pad},${height-pad}`} fill={`url(#${id})`}/><polyline points={points} fill="none" className="trend-line"/>{data.map((n,i) => { const [x,y] = points.split(" ")[i].split(","); return <circle key={i} cx={x} cy={y} r="4" className="trend-dot"><title>{n}%</title></circle>; })}</svg>;
}

export function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const min = Math.min(...data)-.2, max = Math.max(...data)+.2;
  const points = data.map((n,i) => `${i*(120/(data.length-1))},${44-((n-min)/(max-min||1))*36}`).join(" ");
  return <svg className="sparkline" viewBox="0 0 120 48" role="img" aria-label="Seven week morale trend"><polyline points={points} fill="none"/><circle cx="120" cy={points.split(" ").at(-1)?.split(",")[1]} r="3"/></svg>;
}

export function Heatmap({ data }: { data: { teamId: string; teamName: string; weekStart: string; riskScore: number }[] }) {
  const weekStarts = [...new Set(data.map((cell) => cell.weekStart))].sort().slice(-6);
  const weeks = weekStarts.map((week, index) => ({ key: week, label: `W${index + 1}` }));
  const teams = [...new Map(data.map((cell) => [cell.teamId, cell.teamName])).entries()];
  const level = (score: number) => score >= 75 ? 3 : score >= 50 ? 2 : score >= 25 ? 1 : 0;
  return <div className="heatmap" role="img" aria-label="Burnout risk heatmap over eligible team responses">
    <div className="heatmap-row heatmap-header"><span/>{weeks.map((week) => <span key={week.key}>{week.label}</span>)}</div>
    {teams.length ? teams.map(([teamId, teamName]) => <div className="heatmap-row" key={teamId}>
      <strong>{teamName}</strong>{weeks.map((week) => {
        const score = data.find((cell) => cell.teamId === teamId && cell.weekStart === week.key)?.riskScore;
        const value = score === undefined ? null : level(score);
        return <span key={week.key} className={value === null ? "" : `heat-${value}`} title={`${teamName}, ${week.key}: ${score === undefined ? "no eligible data" : `risk ${score}%`}`}>
          {value === null ? "—" : value === 3 ? "High" : value === 2 ? "Watch" : value === 1 ? "Mild" : "Low"}
        </span>;
      })}
    </div>) : <div className="heatmap-row"><strong>No eligible team data</strong></div>}
  </div>;
}
