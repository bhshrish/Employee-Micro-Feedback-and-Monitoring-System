import { AuthForm } from "@/components/AuthForm";
export const metadata = { title: "Sign in or create an account" };

interface LoginPageProps {
    searchParams: Promise<{ mode?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { mode } = await searchParams;
    return <AuthForm initialMode={mode === "signup" ? "signup" : "signin"} />;
}
