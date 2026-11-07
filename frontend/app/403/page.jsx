import Link from "next/link";
export const metadata = { title: "Access denied" };
export default function ForbiddenPage() {
    return <main className="error-page">
        <p className="section-label">403 · Access denied</p>
        <h1>This workspace area isn’t available to your role.</h1>
        <p>Use your role-specific dashboard or contact an organization administrator.</p>
        <Link className="button" href="/dashboard">Go to dashboard</Link>
    </main>;
}
