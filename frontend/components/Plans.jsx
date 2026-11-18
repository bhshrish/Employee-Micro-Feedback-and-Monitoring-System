import Link from "next/link";
import { Icon } from "./Icon";

export function PricingPlans() {
    return <div className="plans-grid">
        <article className="plan-card featured">
            <span className="plan-badge">Pay as you go</span>
            <h3>One report</h3>
            <p>Generate a downloadable report from your selected metrics and date range.</p>
            <div className="plan-price"><strong>₹99</strong><span>one-time<br/>per report</span></div>
            <ul>
                <li><Icon name="check" size={20}/>PDF or CSV download</li>
                <li><Icon name="check" size={20}/>Choose the date range and metrics</li>
                <li><Icon name="check" size={20}/>Secure payment with Razorpay</li>
            </ul>
            <Link href="/login?mode=signup" className="button">Create your account<Icon name="arrow" size={19}/></Link>
        </article>
    </div>;
}
