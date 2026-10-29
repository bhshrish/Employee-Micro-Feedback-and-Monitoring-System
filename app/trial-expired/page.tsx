import type { Metadata } from "next";
import { TrialExpired } from "@/components/TrialExpired";
export const metadata: Metadata = { title: "Your trial has ended" };
export default function TrialExpiredPage() { return <TrialExpired/>; }
