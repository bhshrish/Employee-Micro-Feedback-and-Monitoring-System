import { ResetPasswordForm } from "./ResetPasswordForm";
export const metadata = { title: "Reset password · CalmWork" };
export default async function ResetPasswordPage({ searchParams }) {
    const params = await searchParams;
    return <ResetPasswordForm token={params.token || ""} />;
}
