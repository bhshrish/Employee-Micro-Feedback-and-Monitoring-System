import type { Metadata } from "next";
import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { PricingPlans } from "@/components/Plans";
import { DataTable } from "@/components/UI";
import { Icon } from "@/components/Icon";
export const metadata: Metadata = { title: "Pricing" };
const check = <Icon name="check" size={20}/>;
export default function PricingPage() {
  return <><MarketingNavbar/><main className="page-main"><section className="page-hero compact"><p className="section-label">Pricing without surprises</p><h1>Choose room<br/>to grow.</h1><p>Start free for seven days. Upgrade, downgrade, or cancel in the demo whenever you like.</p></section><section className="section pricing-page"><PricingPlans/><div className="comparison"><h2>Compare plans</h2><DataTable headers={["Feature","Starter","Team","Business"]} rows={[["Automatic time tracking",check,check,check],["Configurable idle detection",check,check,check],["Anonymous weekly pulse",check,check,check],["Team wellbeing scorecards","—",check,check],["Burnout-risk alerts","—",check,check],["PDF & CSV exports","—",check,check],["Teams","1","Up to 5","Unlimited"],["Support","Standard","Priority","Priority"]]}/></div></section></main><MarketingFooter/></>;
}
