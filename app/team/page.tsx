import type { Metadata } from "next";
import { Team } from "@/components/Team";
export const metadata: Metadata = { title: "Team pulse" };
export default function TeamPage() { return <Team/>; }
