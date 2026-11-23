import Link from "next/link";
export function Logo({ inverse = false, className = "", style }) {
    return <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""} ${className}`.trim()} style={style} aria-label="CalmWork home"><span className="logo-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>CalmWork</span></Link>;
}
