import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
export const metadata: Metadata = { title: "Sign in or start a trial" };
export default function LoginPage() { return <AuthForm/>; }
