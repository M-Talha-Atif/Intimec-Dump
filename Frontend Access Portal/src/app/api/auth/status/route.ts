import { _getTokenStatus } from "@/lib/auth";

export async function GET() {
    const status = await _getTokenStatus();
    return Response.json(status);
}