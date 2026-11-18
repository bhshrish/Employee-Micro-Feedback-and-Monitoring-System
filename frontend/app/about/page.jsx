import Link from "next/link";
import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { Icon } from "@/components/Icon";

export const metadata = { title: "About" };

export default function AboutPage() {
    return <>
        <MarketingNavbar />
        <main className="page-main">
            <section className="page-hero">
                <p className="section-label">About CalmWork</p>
                <h1>Technology should<br />help work feel<br /><em>more human.</em></h1>
                <p>CalmWork is a workplace wellbeing product built around a simple belief: useful insights require trust, context, and clear privacy boundaries.</p>
            </section>
            <section className="section about-grid">
                <article>
                    <span>01</span>
                    <h2>Insight without monitoring</h2>
                    <p>CalmWork combines self-directed productivity tools with voluntary wellbeing check-ins. Work activity is not monitored or collected for manager reports.</p>
                </article>
                <article>
                    <span>02</span>
                    <h2>Reports from employee voice</h2>
                    <p>Employees can share their mood, stress, and workload through a short form. Reports use aggregated check-in data and suppress small groups.</p>
                </article>
                <article>
                    <span>03</span>
                    <h2>Privacy people can explain</h2>
                    <p>Workspaces can use shared productivity features, leave applications, and reports while keeping individual check-in responses private.</p>
                </article>
            </section>
            <section className="cta-strip">
                <div>
                    <p>One small check-in can make a difference.</p>
                    <h2>Build a healthier work rhythm.</h2>
                </div>
                <Link href="/login?mode=signup" className="button button-light">Create account <Icon name="arrow" /></Link>
            </section>
        </main>
        <MarketingFooter />
    </>;
}
