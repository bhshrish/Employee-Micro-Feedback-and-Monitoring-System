import Link from "next/link";
import type { CSSProperties } from "react";
export function Logo({ inverse = false, style }: { inverse?: boolean; style?: CSSProperties }) {
    return <Link href="/" style={style} className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="CalmWork home"><span className="logo-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>CalmWork</span></Link>;
}
