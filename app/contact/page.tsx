import type { Metadata } from "next";
import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
export const metadata: Metadata={title:"Contact"};
export default function ContactPage(){return <><MarketingNavbar/><main className="page-main contact-page"><section className="contact-intro"><p className="section-label">Contact</p><h1>Let’s talk about<br/>healthier work.</h1><p>Ask about the product concept, privacy model, or how a future backend could connect to the mock service layer.</p><div><Icon name="mail"/><span>hello@demo.pulse<br/><small>Demo address—not monitored</small></span></div></section><ContactForm/></main><MarketingFooter/></>}
