import Link from "next/link";
import Image from "next/image";

export function Logo({ inverse = false, className = "", style }) {
    return <Link href="/" className={`logo ${inverse ? "logo-inverse" : ""} ${className}`.trim()} style={style} aria-label="CalmWork home">
        <Image
            src={inverse ? "/Logo=workmark2.png" : "/Logo=workmark3.png"}
            alt=""
            width={516}
            height={107}
        />
    </Link>;
}
