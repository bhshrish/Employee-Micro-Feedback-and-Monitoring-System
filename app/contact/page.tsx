import type { Metadata } from "next";
import { MarketingNavbar, MarketingFooter } from "@/components/Marketing";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
export const metadata: Metadata={title:"Contact"};
export default function ContactPage(){return <><MarketingNavbar/><main className="page-main contact-page"><section className="contact-intro"><p className="section-label">Contact</p><h1>Let’s talk about<br/>healthier work.</h1><p>Ask about the product, privacy model, or how the platform supports your team.</p><div><Icon name="mail"/><span>hello@pulse.example<br/><small>Email is not monitored</small></span></div></section><ContactForm/></main><MarketingFooter/></>}
