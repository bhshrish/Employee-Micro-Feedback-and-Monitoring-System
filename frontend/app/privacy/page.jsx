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
                <p>Workwell currently supports session timing, activity records, and voluntary wellbeing check-ins. Optional screen recording and keyboard activity counts are planned capabilities and are not active in this demo.</p>
            </section>
            <section className="section privacy-document">
                <div className="privacy-callout">
                    <Icon name="shield" size={38} />
                    <div>
                        <h2>Planned capture is a choice.</h2>
                        <p>Screen recording will require an employee to opt in and will be pausable and stoppable by that employee. Keyboard activity will be counted only; typed characters and key values will not be collected.</p>
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
                    </ul>
                </article>
                <article>
                    <h2>Planned capture options</h2>
                    <ul>
                        <li>Screen recording is not available in this demo; any future recording will be off unless the employee explicitly opts in and will include employee pause and stop controls.</li>
                        <li>Keyboard activity will be a count of keypress events only. Workwell will not record typed characters, key values, or text.</li>
                        <li>A screen recording can show whatever is visible, including sensitive information. Employees should be able to avoid recording sensitive screens.</li>
                    </ul>
                </article>
                <article>
                    <h2>What managers can see</h2>
                    <p>The current manager views show workspace or team summaries, not individual activity timelines or raw screen recordings. Team groups below the workspace's configured privacy minimum are suppressed. The access rules for any future recordings must be clearly disclosed before that feature is enabled.</p>
                </article>
                <article>
                    <h2>Where workspace data lives</h2>
                    <p>Account, activity, pulse, report, and billing records are stored in the workspace database and scoped to the authenticated organization. The browser stores short-lived access session state and non-sensitive preferences; refresh credentials are held in an HTTP-only cookie. Payment details are collected by the configured billing provider and are not submitted to the Workwell API.</p>
                </article>
                <article>
                    <h2>Access, security, and retention</h2>
                    <p>Workspace operators are responsible for configuring appropriate access, database security, retention, consent, and privacy-review policies before collecting employee data. Before any capture feature is rolled out, its purpose, access controls, storage, and retention period must be defined and disclosed. Workwell does not collect pulse comments.</p>
                </article>
            </section>
        </main>
        <MarketingFooter />
    </>;
}
