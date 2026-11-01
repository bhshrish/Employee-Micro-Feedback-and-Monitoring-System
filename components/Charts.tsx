import { useId } from "react";

export function SvgBarChart({ data }: { data: { label: string; active: number; idle: number }[] }) {
  const max = Math.max(60, ...data.flatMap((item) => [item.active, item.idle]));
  const plotStart = 44;
  const plotWidth = 660;
  const slotWidth = data.length ? plotWidth / data.length : plotWidth;
  const groupWidth = Math.min(32, slotWidth * .72);
  const barWidth = Math.max(1, (groupWidth - 2) / 2);
  const labelInterval = Math.max(1, Math.ceil(data.length / 8));
  return <svg className="chart bar-chart" viewBox="0 0 720 260" role="img" aria-label="Daily active and idle activity timeline">
    {[0, 1, 2, 3].map((n) => <line key={n} x1="44" x2="704" y1={30 + n * 55} y2={30 + n * 55} className="grid-line"/>)}
    {data.map((item, i) => {
      const x = plotStart + i * slotWidth + (slotWidth - groupWidth) / 2;
      const active = item.active / max * 160;
      const idle = item.idle / max * 160;
      return <g key={item.label}>
        <rect x={x} y={195-active} width={barWidth} height={active} rx="3" className="bar-active"/>
        <rect x={x+barWidth+2} y={195-idle} width={barWidth} height={idle} rx="3" className="bar-idle"/>
        {i % labelInterval === 0 && <text x={x+groupWidth/2} y="225" textAnchor="middle">{item.label}</text>}
      </g>;
    })}
  </svg>;
}

export function WeeklyStacked({ data }: { data: { day: string; productive: number; neutral: number; idle: number }[] }) {
  const plotStart = 35;
  const plotWidth = 550;
  const slotWidth = data.length ? plotWidth / data.length : plotWidth;
  const barWidth = Math.min(54, slotWidth * .68);
  return <svg className="chart stacked-chart" viewBox="0 0 620 270" role="img" aria-label="Weekly productive neutral and idle time stacked bars">
    {data.map((item, i) => {
      const total = item.productive + item.neutral + item.idle;
      const scale = 175 / Math.max(total, 8);
      const p = item.productive * scale, n = item.neutral * scale, d = item.idle * scale;
      const x = plotStart + (i + .5) * slotWidth - barWidth / 2;
      const center = x + barWidth / 2;
      return <g key={item.day}>
        <rect x={x} y={205-p} width={barWidth} height={p} rx="5" className="bar-active"/>
        <rect x={x} y={205-p-n} width={barWidth} height={n} className="bar-neutral"/>
        <rect x={x} y={205-p-n-d} width={barWidth} height={d} rx="5" className="bar-idle"/>
        <text x={center} y="235" textAnchor="middle">{item.day}</text>
        <text x={center} y={190-p-n-d} textAnchor="middle" className="chart-value">{total.toFixed(1)}h</text>
      </g>;
    })}
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

export function Heatmap({
  data,
  teams,
  weeks: weekCount,
}: {
  data: { teamId: string; teamName: string; weekStart: string; riskScore: number }[];
  teams: { id: string; name: string }[];
  weeks: number;
}) {
  const currentWeek = new Date();
  currentWeek.setUTCHours(0, 0, 0, 0);
  currentWeek.setUTCDate(currentWeek.getUTCDate() - ((currentWeek.getUTCDay() + 6) % 7));
  const weeks = Array.from({ length: weekCount }, (_, index) => {
    const start = new Date(currentWeek);
    start.setUTCDate(start.getUTCDate() - (weekCount - 1 - index) * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return {
      key: start.toISOString(),
      label: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" }).format(start),
      endLabel: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" }).format(end),
      current: index === weekCount - 1,
    };
  });
  const cells = new Map(data.map((cell) => [`${cell.teamId}:${new Date(cell.weekStart).toISOString()}`, cell.riskScore]));
  const level = (score: number) => score >= 65 ? "high" : score >= 40 ? "moderate" : "low";

  if (!teams.length) {
    return <p className="heatmap-empty">No active teams are available for this workspace.</p>;
  }

  return <div className="heatmap-scroll" role="region" aria-label={`${weekCount}-week team burnout-risk heatmap`} tabIndex={0}>
    <table className="heatmap-table">
      <caption className="visually-hidden">{weekCount} weeks of aggregated burnout-risk scores for each team. Weeks below the response minimum are withheld.</caption>
      <thead><tr>
        <th scope="col">Team</th>
        {weeks.map((week) => <th scope="col" key={week.key} aria-label={`${week.label} to ${week.endLabel}${week.current ? ", current week" : ""}`}>
          <span>{week.label}</span><small>{week.current ? "This week" : `– ${week.endLabel}`}</small>
        </th>)}
      </tr></thead>
      <tbody>{teams.map((team) => <tr key={team.id}>
        <th scope="row">{team.name}</th>
        {weeks.map((week) => {
          const score = cells.get(`${team.id}:${week.key}`);
          const description = score === undefined ? "No eligible data" : `${level(score)} risk, ${score}%`;
          return <td key={week.key}>
            <span className={`heatmap-cell ${score === undefined ? "heat-unavailable" : `heat-${level(score)}`}`} title={`${team.name}, week of ${week.label}: ${description}`} aria-label={description}>
              {score === undefined ? "—" : `${score}%`}
            </span>
          </td>;
        })}
      </tr>)}</tbody>
    </table>
  </div>;
}
