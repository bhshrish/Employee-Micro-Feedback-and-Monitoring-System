import type { Metadata } from "next";
import { Checkout } from "@/components/Checkout";
export const metadata: Metadata = { title: "Demo checkout" };
export default function CheckoutPage() { return <Checkout/>; }
