import Link from "next/link";
import { MarketingNavbar, MarketingFooter, FAQ } from "@/components/Marketing";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { PricingPlans } from "@/components/Plans";
import { Sparkline, SvgDonut } from "@/components/Charts";
const features = [
    { title: "Productivity planner", text: "Plan tasks, set realistic estimates, and keep track of the work that matters to you.", icon: "clock" },
    { title: "Wellbeing check-in", text: "Use a short weekly form to reflect on mood, stress, and workload.", icon: "shield" },
    { title: "Burnout scale", text: "See aggregated wellbeing patterns and spot when stress or workload may need attention.", icon: "bell" },
    { title: "Free reports", text: "Generate and download clear PDF or CSV reports at no extra cost.", icon: "chart" },
    { title: "People management", text: "Workspace admins can invite employees, organize teams, and manage roles.", icon: "users" },
    { title: "Meetings & reminders", text: "Keep events and reminders organized alongside your tasks.", icon: "calendar" },
];
export default function Home() {
    return <div className="landing"><MarketingNavbar /><main>
    <section className="hero"><div className="hero-grid-lines" aria-hidden="true"/><div className="hero-copy"><div className="hero-kicker"><span className="live-dot"/>Clear choices · Human by default</div><h1><span>Work better.</span><span>Notice sooner.</span></h1><p>CalmWork brings practical productivity tools and wellbeing check-ins together, with clear burnout insights and reports built from submitted forms.</p><div className="hero-actions"><Link href="/login?mode=signup" className="button button-light">Create your account <Icon name="arrow"/></Link><Link href="#how-it-works" className="button button-ghost-light">See how it works</Link></div><small>Use any valid email. Your wellbeing matters. Reports from $99.</small></div>
      <div className="hero-product"><div className="animated-frame"><div className="product-preview"><div className="preview-top"><div><span className="preview-label">Wellbeing dashboard</span><h2>Good morning, Alex.</h2></div><span className="status-chip"><i />Live preview</span></div><div className="preview-grid"><div className="preview-score"><span>Wellbeing score</span><strong>4.2<small>/ 5</small></strong><p><b>↑ 8%</b> from last week</p><Sparkline data={[3.7, 3.8, 3.9, 3.8, 4, 4.1, 4.2]}/></div><div className="preview-donut"><SvgDonut productive={84} size={170}/></div></div><div className="preview-alert"><Icon name="spark"/><div><strong>Your wellbeing check-in is ready</strong><span>2 minutes · Anonymous responses</span></div><Icon name="arrow"/></div></div></div></div>
    </section>

    <section className="manifesto section"><Reveal><p className="section-label">Useful signals need clear boundaries.</p><h2>Your team shouldn’t have to <em>burn out</em> to be heard.</h2><div className="manifesto-grid"><p>CalmWork gives employees a simple way to share how work feels and offers useful productivity tools without monitoring their activity.</p></div></Reveal></section>

    <section className="features section" id="features"><Reveal><div className="section-heading"><div><p className="section-label">One transparent workspace</p><h2>Clear signals.<br />Clear choices.</h2></div><p>Personal productivity tools, aggregated wellbeing insights, and reports based on voluntary employee check-ins.</p></div><div className="feature-grid">{features.map((feature, i) => <article key={feature.title} className={`feature-item feature-${i + 1}`}><Icon name={feature.icon} size={32}/><span>0{i + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div></Reveal></section>

    <section className="how section" id="how-it-works"><Reveal><p className="section-label">From check-in to insight</p><h2>A healthier rhythm<br />in three steps.</h2><div className="steps">{[
            ["Plan your work", "Use the planner, calendar, and reminders to organize your day around realistic priorities."],
            ["Share a wellbeing check-in", "Use the weekly form to reflect on mood, stress, and workload. Your response helps shape burnout insights."],
            ["Generate a report", "Review the dashboard and download a PDF or CSV report for free when you need one."],
        ].map(([title, text], i) => <article key={title}><strong>0{i + 1}</strong><div className="step-line"/><h3>{title}</h3><p>{text}</p></article>)}</div></Reveal></section>

    <section className="pricing-section section" id="pricing"><Reveal><div className="section-heading"><div><p className="section-label">Simple pricing</p><h2>Start small.<br />Scale clearly.</h2></div></div><PricingPlans /></Reveal></section>

    <section className="faq-section section"><Reveal><div className="section-heading"><div><p className="section-label">Questions, answered</p><h2>Clarity before<br />you commit.</h2></div><p>Need something else? <Link href="/contact" className="underlined">Talk to our team.</Link></p></div><FAQ /></Reveal></section>

    <section className="cta-strip"><div><p>One small check-in can make a difference.</p><h2>Build a healthier work rhythm.</h2></div><Link href="/login?mode=signup" className="button button-light">Create your account <Icon name="arrow"/></Link></section>
  </main><MarketingFooter /></div>;
}
