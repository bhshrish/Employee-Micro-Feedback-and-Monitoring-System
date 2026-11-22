import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { PricingPlans } from "@/components/Plans";
export const metadata = { title: "Pricing" };
export default function PricingPage() {
    return <><MarketingNavbar /><main className="page-main"><section className="page-hero compact"><p className="section-label">Pricing without surprises</p><h1>One report.<br/>One simple price.</h1><p>Create an account and use productivity tools and wellbeing check-ins. Pay only when you generate a report.</p></section><section className="section pricing-page"><PricingPlans /></section></main><MarketingFooter /></>;
}
