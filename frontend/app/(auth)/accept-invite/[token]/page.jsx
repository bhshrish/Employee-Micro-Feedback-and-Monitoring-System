import { AuthPage } from "@/components/auth/AuthPage";
export const metadata = { title: "Accept invitation" };
export default async function AcceptInvitePage({ params }) {
    const { token } = await params;
    return <AuthPage mode="invite" token={token} />;
}
