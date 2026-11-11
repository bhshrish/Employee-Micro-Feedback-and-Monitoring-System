import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
    return <>
        <MarketingNavbar />
        <main className="page-main privacy-page">
            <section className="page-hero compact">
                <p className="section-label">Privacy, in plain language</p>
                <h1>Your work is<br />not our content.</h1>
                <p>CalmWork currently supports employee-controlled session timing, activity records, voluntary wellbeing check-ins, and optional keypress counting. Keypress counts stay in the employee's browser. Screen recording is not available.</p>
            </section>
            <section className="section privacy-document">
                <div className="privacy-callout">
                    <Icon name="shield" size={38} />
                    <div>
                        <h2>Counts, never content.</h2>
                        <p>When an employee opts in, CalmWork counts keydown events during active work sessions. The count stays in that browser and is not shared with managers. CalmWork never reads or stores key values, typed characters, or text, and does not record screens.</p>
                    </div>
                </div>
                <article>
                    <h2>What the current demo supports</h2>
                    <ul>
                        <li>Session start, pause, and stop times</li>
                        <li>Active and idle duration, stored separately</li>
                        <li>Your selected project or task label</li>
                        <li>Your Productive, Neutral, or Distracting tag</li>
                        <li>Voluntary mood, stress, and workload ratings</li>
                        <li>Optional keydown event counts stored locally and erased when the session stops or counting is disabled</li>
                    </ul>
                </article>
                <article>
                    <h2>Screen recording</h2>
                    <ul>
                        <li>Screen recording is not available in CalmWork. No screen content is captured. Any future recording would require explicit employee opt-in, with pause and stop controls.</li>
                    </ul>
                </article>
                <article>
                    <h2>What managers can see</h2>
                    <p>The current manager views show workspace or team summaries, not individual activity timelines, keypress counts, or screen recordings. Team groups below the workspace's configured privacy minimum are suppressed.</p>
                </article>
                <article>
                    <h2>Where workspace data lives</h2>
                    <p>Account, activity, pulse, report, and billing records are stored in the workspace database and scoped to the authenticated organization. Keypress counts are stored locally in the employee's browser and are not sent to the CalmWork API. The browser also stores short-lived access session state and non-sensitive preferences; refresh credentials are held in an HTTP-only cookie. Payment details are collected by the configured billing provider and are not submitted to the CalmWork API.</p>
                </article>
                <article>
                    <h2>Access, security, and retention</h2>
                    <p>Workspace operators are responsible for configuring appropriate access, database security, retention, consent, and privacy-review policies before collecting employee data. Before any capture feature is rolled out, its purpose, access controls, storage, and retention period must be defined and disclosed. CalmWork does not collect pulse comments.</p>
                </article>
            </section>
        </main>
        <MarketingFooter />
    </>;
}
