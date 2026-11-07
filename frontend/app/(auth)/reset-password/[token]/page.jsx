import { AuthPage } from "@/components/auth/AuthPage";
export const metadata = { title: "Reset password" };
export default async function ResetPasswordPage({ params }) {
    const { token } = await params;
    return <AuthPage mode="reset" token={token} />;
}
