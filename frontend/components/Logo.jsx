import Link from "next/link";
export function Logo({ inverse = false }) {
    return <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="CalmWork home"><span className="logo-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>CalmWork</span></Link>;
}
