import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { PricingPlans } from "@/components/Plans";
export const metadata = { title: "Pricing" };
export default function PricingPage() {
    return <><MarketingNavbar /><main className="page-main"><section className="page-hero compact"><p className="section-label">Pricing without surprises</p><h1>Individual or business.<br />Choose what fits.</h1><p>Individuals subscribe once for lifetime access. Businesses subscribe monthly. All report downloads are free.</p></section><section className="section pricing-page"><PricingPlans /></section></main><MarketingFooter /></>;
}
