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
                <p>CalmWork supports self-directed productivity tools, attendance and leave applications, and voluntary wellbeing check-ins. It does not monitor employees' work activity.</p>
            </section>
            <section className="section privacy-document">
                <div className="privacy-callout">
                    <Icon name="shield" size={38} />
                    <div>
                        <h2>Employee voice, with privacy.</h2>
                        <p>Wellbeing forms collect mood, stress, and workload ratings without comments. Responses are used in aggregated reports, and small groups are suppressed.</p>
                    </div>
                </div>
                <article>
                    <h2>What the current demo supports</h2>
                    <ul>
                        <li>Voluntary mood, stress, and workload ratings</li>
                        <li>Tasks, calendar events, and leave applications entered by the account holder</li>
                    </ul>
                </article>
                <article>
                    <h2>What administrators can see</h2>
                    <p>Administrators can manage accounts and review submitted leave applications. Reports use aggregated wellbeing patterns, and groups below the workspace's configured privacy minimum are suppressed.</p>
                </article>
                <article>
                    <h2>Where workspace data lives</h2>
                    <p>Account, wellbeing, report, leave, and productivity records are stored in the workspace database and scoped to the authenticated account or workspace. The browser also stores short-lived access session state and non-sensitive preferences; refresh credentials are held in an HTTP-only cookie. Payment details are collected by Razorpay and are not submitted to the CalmWork API.</p>
                </article>
                <article>
                    <h2>Access, security, and retention</h2>
                    <p>Workspace operators are responsible for configuring appropriate access, database security, retention, consent, and privacy-review policies before collecting employee data. CalmWork does not record screens, keystrokes, or typed text, and does not collect comments with wellbeing check-ins.</p>
                </article>
            </section>
        </main>
        <MarketingFooter />
    </>;
}
