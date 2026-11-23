import { AuthForm } from "@/components/AuthForm";
export const metadata = { title: "Sign in or create an account" };
export default async function LoginPage({ searchParams }) {
    const { mode } = await searchParams;
    return <AuthForm initialMode={mode === "signup" ? "signup" : "signin"}/>;
}
