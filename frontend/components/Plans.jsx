import Link from "next/link";
import { Icon } from "./Icon";

export function PricingPlans() {
    return <div className="plans-grid">
        <article className="plan-card">
            <span className="plan-badge">Small teams</span>
            <h3>For small businesses</h3>
            <p>Anonymous team insights and simple reporting for growing teams.</p>
            <div className="plan-price"><strong>$4</strong><span>per month<br />for your business</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Team and organization management</li>
                <li><Icon name="check" size={20}/>Weekly wellbeing check-ins</li>
                <li><Icon name="check" size={20}/>Free PDF and CSV reports</li>
            </ul>
            <Link href="/login?mode=signup" className="button button-outline">Subscribe for $4<Icon name="arrow" size={19}/></Link>
        </article>
        <article className="plan-card featured">
            <span className="plan-badge">Most popular</span>
            <h3>For medium-sized businesses</h3>
            <p>Deeper insights, alerts, and reporting across multiple teams.</p>
            <div className="plan-price"><strong>$8</strong><span>per month<br />for your business</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Everything in the small plan</li>
                <li><Icon name="check" size={20}/>Aggregated wellbeing insights</li>
                <li><Icon name="check" size={20}/>Unlimited report downloads</li>
            </ul>
            <Link href="/login?mode=signup" className="button">Subscribe for $8<Icon name="arrow" size={19}/></Link>
        </article>
        <article className="plan-card">
            <span className="plan-badge">Organization-wide</span>
            <h3>For large businesses</h3>
            <p>Full-scale burnout monitoring, alerts, and reporting for the whole organization.</p>
            <div className="plan-price"><strong>$16</strong><span>per month<br />for your business</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Everything in the medium plan</li>
                <li><Icon name="check" size={20}/>Advanced manager alerts</li>
                <li><Icon name="check" size={20}/>Priority support</li>
            </ul>
            <Link href="/contact" className="button button-outline">Subscribe for $16<Icon name="arrow" size={19}/></Link>
        </article>
    </div>;
}