import type { Metadata } from "next";
import { Billing } from "@/components/Billing";
export const metadata: Metadata = { title: "Billing" };
export default function BillingPage() { return <Billing/>; }
