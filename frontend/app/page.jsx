import Link from "next/link";
import { MarketingNavbar, MarketingFooter, FAQ } from "@/components/Marketing";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { PricingPlans } from "@/components/Plans";
import { Sparkline, SvgDonut } from "@/components/Charts";
const features = [
    { title: "Time Tracking", text: "Start, pause, or stop private work sessions yourself, with activity saved to your workspace.", icon: "clock" },
    { title: "Idle Detection", text: "A configurable pause prompt lets you keep, discard, or take a break—without judging your day.", icon: "pulse" },
    { title: "Anonymous Pulses", text: "A two-minute weekly check-in for mood, stress, and workload. Individual answers stay private.", icon: "shield" },
    { title: "Burnout Alerts", text: "See team-level changes early, with small groups suppressed and individual pulse answers kept private.", icon: "bell" },
    { title: "Reports", text: "Turn activity and wellbeing trends into clear, exportable summaries for better conversations.", icon: "chart" },
    { title: "Optional keypress counts", text: "Employees can opt in to a local count of keypresses during active work sessions. No key values or typed text are read or saved. Screen recording is not available.", icon: "pulse" },
];
export default function Home() {
    return <div className="landing"><MarketingNavbar /><main>
    <section className="hero"><div className="hero-grid-lines" aria-hidden="true"/><div className="hero-copy"><div className="hero-kicker"><span className="live-dot"/>Clear choices · Human by default</div><h1><span>Work better.</span><span>Notice sooner.</span></h1><p>Workwell pairs work-rhythm insights with anonymous weekly check-ins. Employees control their work sessions and may opt in to local keypress counts—never typed content.</p><div className="hero-actions"><Link href="/login?mode=signup" className="button button-light">Start 7 days free <Icon name="arrow"/></Link><Link href="#how-it-works" className="button button-ghost-light">See how it works</Link></div><small>No screen recording · Optional local keypress counts · No typed text collected</small></div>
      <div className="hero-product"><div className="animated-frame"><div className="product-preview"><div className="preview-top"><div><span className="preview-label">Team wellbeing</span><h2>Good morning, Alex.</h2></div><span className="status-chip"><i />Live preview</span></div><div className="preview-grid"><div className="preview-score"><span>Team morale</span><strong>4.2<small>/ 5</small></strong><p><b>↑ 8%</b> from last week</p><Sparkline data={[3.7, 3.8, 3.9, 3.8, 4, 4.1, 4.2]}/></div><div className="preview-donut"><SvgDonut productive={84} size={170}/></div></div><div className="preview-alert"><Icon name="spark"/><div><strong>Your weekly pulse is ready</strong><span>2 minutes · Always anonymous</span></div><Icon name="arrow"/></div></div></div></div>
    </section>

    <section className="manifesto section"><Reveal><p className="section-label">Useful signals need clear boundaries.</p><h2>Your team shouldn’t have to <em>burn out</em> to be heard.</h2><div className="manifesto-grid"><p>Workwell brings work-rhythm data and employee voice together with visible choices about what is collected and why.</p><div className="callout"><Icon name="shield" size={30}/><strong>Capture by choice.</strong><span>Employees can opt in to keypress counts, stored only in their browser. Workwell does not record key values, typed text, or screens. Team insights require at least five pulse responses.</span></div></div></Reveal></section>

    <section className="features section" id="features"><Reveal><div className="section-heading"><div><p className="section-label">One transparent workspace</p><h2>Clear signals.<br />Clear choices.</h2></div><p>Personal work-rhythm tools, anonymous team insights, and capture options designed around explicit employee choice.</p></div><div className="feature-grid">{features.map((feature, i) => <article key={feature.title} className={`feature-item feature-${i + 1}`}><Icon name={feature.icon} size={32}/><span>0{i + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></Reveal></section>

    <section className="how section" id="how-it-works"><Reveal><p className="section-label">From signal to support</p><h2>A healthier rhythm<br />in three steps.</h2><div className="steps">{[
            ["Track your day, with clear choices", "Workwell tracks session timing and separates idle time. Employees can optionally count keydown events locally; no key values or typed text are inspected, stored, or sent."],
            ["Share a two-minute pulse", "Once a week, check in on mood, stress, and workload. Add a comment only if you want to."],
            ["Act on the team pattern", "Managers see aggregated trends and early alerts—never an individual employee’s answers."],
        ].map(([title, text], i) => <article key={title}><strong>0{i + 1}</strong><div className="step-line"/><h3>{title}</h3><p>{text}</p></article>)}</div></Reveal></section>

    <section className="pricing-section section" id="pricing"><Reveal><div className="section-heading"><div><p className="section-label">Simple pricing</p><h2>Start with seven<br />days on us.</h2></div><p>Every plan begins with a full-featured free trial. No card required. Secure checkout is available when billing is configured.</p></div><PricingPlans /></Reveal></section>

    <section className="testimonials section"><Reveal><p className="section-label">A better conversation starts here</p><h2>“We stopped guessing<br />how work felt.”</h2><div className="quote-grid"><blockquote><p>“The idle prompt feels like a gentle pause, not a surveillance tool. I finally understand where my energy goes.”</p><footer><strong>Maya Chen</strong><span>Product designer</span></footer></blockquote><blockquote><p>“The five-response minimum made our team comfortable enough to participate. The trends are now part of our retros.”</p><footer><strong>Jon Bell</strong><span>Engineering lead</span></footer></blockquote></div></Reveal></section>

    <section className="faq-section section"><Reveal><div className="section-heading"><div><p className="section-label">Questions, answered</p><h2>Clarity before<br />you commit.</h2></div><p>Need something else? <Link href="/contact" className="underlined">Talk to our team.</Link></p></div><FAQ /></Reveal></section>

    <section className="cta-strip"><div><p>Seven days. One healthier habit.</p><h2>Ready to hear your team?</h2></div><Link href="/login?mode=signup" className="button button-light">Start your free trial <Icon name="arrow"/></Link></section>
  </main><MarketingFooter /></div>;
}
