import Link from "next/link";
export function Logo({ inverse = false }) {
    return <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="Workwell home"><span className="logo-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>Workwell</span></Link>;
}
