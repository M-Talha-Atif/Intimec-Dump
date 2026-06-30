import { _refreshToken } from "@/lib/auth";

export async function POST() {
    const result = await _refreshToken();
    return Response.json(result);
}