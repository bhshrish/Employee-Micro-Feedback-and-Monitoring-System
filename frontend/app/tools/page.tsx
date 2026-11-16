import { EmployeeTools } from "@/components/EmployeeTools";
import { AppShell } from "@/components/AppShell";
export const metadata = { title: "Work tools" };
export default function ToolsPage() {
    return <AppShell><EmployeeTools /></AppShell>;
}
