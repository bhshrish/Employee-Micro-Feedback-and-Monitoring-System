import Link from "next/link";
export function Logo({ inverse = false }) {
    return <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="WellTrack home"><span className="logo-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>WellTrack</span></Link>;
}
