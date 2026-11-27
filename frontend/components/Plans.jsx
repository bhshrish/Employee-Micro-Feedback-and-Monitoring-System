import Link from "next/link";
import { Icon } from "./Icon";

export function PricingPlans() {
    return <div className="plans-grid">
        <article className="plan-card">
            <h3>Starter</h3>
            <div className="plan-price"><strong>₹99</strong><span>Pay-as-you-go</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Up to 25 employees and 3 teams</li>
                <li><Icon name="check" size={20}/>Basic wellbeing check-ins</li>
                <li><Icon name="check" size={20}/>Basic people management</li>
                <li><Icon name="check" size={20}/>1 team workspace</li>
            </ul>
            <Link href="/login?mode=signup" className="button button-dark">Get Started</Link>
        </article>
        <article className="plan-card featured">
            <h3>Team</h3>
            <div className="plan-price"><strong>₹199</strong><span>Team insights and early<br />alerts for growing companies</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Unlimited productivity planning</li>
                <li><Icon name="check" size={20}/>Burnout scales and trend insights</li>
                <li><Icon name="check" size={20}/>Employee and team management</li>
                <li><Icon name="check" size={20}/>Advanced dashboards and reports</li>
            </ul>
            <Link href="/login?mode=signup" className="button button-light">Get Started</Link>
        </article>
        <article className="plan-card">
            <h3>Business</h3>
            <div className="plan-price"><strong>₹499</strong><span>Advanced controls and<br />dedicated support for larger organizations</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Unlimited employees and teams</li>
                <li><Icon name="check" size={20}/>Basic wellbeing check-ins</li>
                <li><Icon name="check" size={20}/>Basic wellbeing dashboard</li>
                <li><Icon name="check" size={20}/>1 team workspace</li>
            </ul>
            <Link href="/contact" className="button button-dark">Get Started</Link>
        </article>
    </div>;
}