import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { PricingPlans } from "@/components/Plans";
export const metadata = { title: "Pricing" };
export default function PricingPage() {
    return <><MarketingNavbar /><main className="page-main"><section className="page-hero compact"><p className="section-label">Pricing without surprises</p><h1>Try every feature.<br />Choose what fits.</h1><p>Start with a 14-day free trial and Pro Max limits. No credit card required. All PDF and CSV reports are free.</p></section><section className="section pricing-page"><PricingPlans /></section></main><MarketingFooter /></>;
}
