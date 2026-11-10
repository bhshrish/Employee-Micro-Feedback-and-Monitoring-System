import Link from "next/link";
import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { Icon } from "@/components/Icon";

export const metadata = { title: "About" };

export default function AboutPage() {
    return <>
        <MarketingNavbar />
        <main className="page-main">
            <section className="page-hero">
                <p className="section-label">About WellTrack</p>
                <h1>Technology should<br />help work feel<br /><em>more human.</em></h1>
                <p>WellTrack is a workplace wellbeing product built around a simple belief: useful insights require trust, context, and clear privacy boundaries.</p>
            </section>
            <section className="section about-grid">
                <article>
                    <span>01</span>
                    <h2>Insight with employee choice</h2>
                    <p>WellTrack supports employee-controlled activity timing and wellbeing check-ins. Employees may optionally count keypresses locally during an active session. Screen recording is not available; any future screen recording would require explicit employee opt-in and pause and stop controls.</p>
                </article>
                <article>
                    <span>02</span>
                    <h2>Count activity, not content</h2>
                    <p>Optional keypress counting stores only a count in the employee's browser. It never reads or saves key values, typed characters, or text. WellTrack does not record screens.</p>
                </article>
                <article>
                    <span>03</span>
                    <h2>Privacy people can explain</h2>
                    <p>Current manager reports focus on workspace or team summaries. Access rules, storage, and retention for any future recordings must be clearly defined before rollout.</p>
                </article>
            </section>
            <section className="cta-strip">
                <div>
                    <p>See the product concept in action.</p>
                    <h2>Build a healthier work rhythm.</h2>
                </div>
                <Link href="/login?mode=signup" className="button button-light">Start free <Icon name="arrow" /></Link>
            </section>
        </main>
        <MarketingFooter />
    </>;
}
