import Link from "next/link";
import { Icon } from "./Icon";
export function PricingPlans() {
    return <div className="plans-grid">
        <article className="plan-card featured">
            <span className="plan-badge">Lifetime access</span>
            <h3>For individuals</h3>
            <p>Personal planning, wellbeing check-ins, and free downloadable reports.</p>
            <div className="plan-price"><strong>$4</strong><span>one-time<br />lifetime</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Personal activity tracking</li>
                <li><Icon name="check" size={20}/>Weekly wellbeing check-ins</li>
                <li><Icon name="check" size={20}/>Free PDF and CSV reports</li>
            </ul>
            <Link href="/login?mode=signup" className="button">Subscribe for $4<Icon name="arrow" size={19}/></Link>
        </article>
        <article className="plan-card">
            <span className="plan-badge">Team workspace</span>
            <h3>For businesses</h3>
            <p>Anonymous team insights, alerts, and reporting for the whole workspace.</p>
            <div className="plan-price"><strong>$8</strong><span>per month<br />for your business</span></div>
            <ul>
                <li><Icon name="check" size={20}/>Team and organization management</li>
                <li><Icon name="check" size={20}/>Aggregated wellbeing insights</li>
                <li><Icon name="check" size={20}/>Unlimited report downloads</li>
            </ul>
            <Link href="/contact" className="button button-outline">Talk to our team<Icon name="arrow" size={19}/></Link>
        </article>
    </div>;
}
