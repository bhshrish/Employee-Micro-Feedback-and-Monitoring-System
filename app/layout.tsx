import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SubscriptionProvider } from "@/lib/subscription";
import { ToastProvider } from "@/components/Toast";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: { default: "PULSE — Healthier work, heard earlier", template: "%s · PULSE" },
  description: "Private time awareness and anonymous team wellbeing signals in one calm workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SubscriptionProvider><ToastProvider>{children}</ToastProvider></SubscriptionProvider></body></html>;
}
