export function StatCard({ label, value, note }) {
    return <article className="org-stat-card">
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
    </article>;
}

export function DataTable({ columns, rows, emptyMessage = "No records yet." }) {
    return <div className="org-table-wrap"><table className="org-table">
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{rows.length
            ? rows.map((row, index) => <tr key={row.id ?? index}>{row.cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)
            : <tr><td className="org-table-empty" colSpan={columns.length}>{emptyMessage}</td></tr>}
        </tbody>
    </table></div>;
}

export function ChartPanel({ title, children, description }) {
    return <section className="org-panel">
        <div className="org-panel-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {children}
    </section>;
}
