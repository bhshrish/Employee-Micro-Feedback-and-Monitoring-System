import Link from "next/link";
import { Logo } from "@/components/Logo";
export default function NotFound(){return <main className="not-found"><Logo/><p className="section-label">404 · Signal not found</p><h1>This page went<br/>off the radar.</h1><p>The link may be outdated, or the page may have moved.</p><Link href="/" className="button">Return home</Link></main>}
