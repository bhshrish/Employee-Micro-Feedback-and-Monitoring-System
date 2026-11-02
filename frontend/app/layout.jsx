import "./globals.css";
import { SubscriptionProvider } from "@/lib/subscription";
import { ToastProvider } from "@/components/Toast";
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
export const metadata = {
    title: { default: "PULSE — Healthier work, heard earlier", template: "%s · PULSE" },
    description: "Private time awareness and anonymous team wellbeing signals in one calm workspace.",
};
export default function RootLayout({ children }) {
    return <html lang="en"><body><SubscriptionProvider><ToastProvider>{children}</ToastProvider></SubscriptionProvider></body></html>;
}
