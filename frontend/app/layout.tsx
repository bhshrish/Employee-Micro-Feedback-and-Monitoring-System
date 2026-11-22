import "./globals.css";
import { SubscriptionProvider } from "@/lib/subscription";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/components/Toast";
import type { ReactNode } from "react";
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
export const metadata = {
    title: { default: "CalmWork — Healthier work, heard earlier", template: "%s · CalmWork" },
    description: "Private time awareness and anonymous team wellbeing signals in one calm workspace.",
};
interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return <html lang="en"><body><ThemeProvider><SubscriptionProvider><ToastProvider>{children}</ToastProvider></SubscriptionProvider></ThemeProvider></body></html>;
}
