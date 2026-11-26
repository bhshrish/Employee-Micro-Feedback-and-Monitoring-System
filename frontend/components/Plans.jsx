import Link from "next/link";
import { Icon } from "./Icon";

export function PricingPlans() {
    return <div className="plans-grid">
        <article className="plan-card">
            <span className="plan-badge">Small teams</span>
            <h3>Pro</h3>
            <p>Essential wellbeing check-ins and simple reporting for small teams.</p>
            <div className="plan-price"><strong>$4</strong><span>per employee<br />per month</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Up to 25 employees and 3 teams</li>
                <li><Icon name="check" size={20}/>Weekly anonymous check-ins</li>
                <li><Icon name="check" size={20}/>Basic wellbeing dashboard</li>
                <li><Icon name="check" size={20}/>Free PDF and CSV reports</li>
            </ul>
            <Link href="/login?mode=signup" className="button button-outline">Start 14-day trial<Icon name="arrow" size={19}/></Link>
        </article>
        <article className="plan-card featured">
            <span className="plan-badge">Most popular</span>
            <h3>Pro Max</h3>
            <p>Team insights and early alerts for growing companies.</p>
            <div className="plan-price"><strong>$8</strong><span>per employee<br />per month</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Up to 150 employees and 15 teams</li>
                <li><Icon name="check" size={20}/>Team scorecards and 12-week trends</li>
                <li><Icon name="check" size={20}/>Burnout alerts and workload views</li>
                <li><Icon name="check" size={20}/>Manager roles and free reports</li>
            </ul>
            <Link href="/login?mode=signup" className="button">Start 14-day trial<Icon name="arrow" size={19}/></Link>
        </article>
        <article className="plan-card">
            <span className="plan-badge">Organization-wide</span>
            <h3>Pro Ultra</h3>
            <p>Advanced controls and dedicated support for larger organizations.</p>
            <div className="plan-price"><strong>$16</strong><span>per employee<br />per month</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Unlimited employees and teams</li>
                <li><Icon name="check" size={20}/>Custom alert rules and retention</li>
                <li><Icon name="check" size={20}/>Audit logs and salary checker</li>
                <li><Icon name="check" size={20}/>Dedicated onboarding and priority support</li>
            </ul>
            <Link href="/contact" className="button button-outline">Talk to sales<Icon name="arrow" size={19}/></Link>
        </article>
    </div>;
}