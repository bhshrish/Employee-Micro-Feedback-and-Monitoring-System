import Link from "next/link";
import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { Icon } from "@/components/Icon";

export const metadata = { title: "About" };

export default function AboutPage() {
    return <>
        <MarketingNavbar />
        <main className="page-main">
            <section className="page-hero">
                <p className="section-label">About PULSE</p>
                <h1>Technology should<br />help work feel<br /><em>more human.</em></h1>
                <p>PULSE is a workplace wellbeing product built around a simple belief: useful insights require trust, context, and clear privacy boundaries.</p>
            </section>
            <section className="section about-grid">
                <article>
                    <span>01</span>
                    <h2>Insight with employee choice</h2>
                    <p>PULSE supports activity timing and employee wellbeing check-ins. Optional screen recording is planned to require explicit employee opt-in, with controls to pause or stop. It is not active in this demo.</p>
                </article>
                <article>
                    <span>02</span>
                    <h2>Count activity, not content</h2>
                    <p>The planned keyboard signal counts keypress events only. It will not capture typed characters, key values, or text. Screen recording, if enabled by an employee, can show visible screen content.</p>
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
