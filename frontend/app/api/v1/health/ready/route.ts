import { connectDatabase } from "@/lib/server/db";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
    try {
        await connectDatabase();
        return Response.json({ status: "ready", dependencies: { mongodb: "ok" } });
    } catch (error) {
        console.error("Next.js API readiness check failed", error);
        return Response.json(
            { status: "not_ready", dependencies: { mongodb: "unavailable" } },
            { status: 503 },
        );
    }
}
