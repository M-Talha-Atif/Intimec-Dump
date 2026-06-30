// app/api/v1/applications/[appid]/import/stream/route.ts
import { _getAuthToken } from "@/lib/auth";
import { NextRequest } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskid: string; executionId: string }> }
) {
  const { taskid, executionId } = await params;
  const urlParams = req.nextUrl.searchParams;
  const logLevels = urlParams.getAll("log_level");
  const linesLimit = urlParams.get("lines_limit");
  const search = urlParams.get("search");
  // Forward the request to the backend service
  const backendResp = await fetch(
    `${API_URL}/tasks/${taskid}/runs/${executionId}/logs/stream?` +
      new URLSearchParams(
        logLevels
          .map((level) => ["log_level", level])
          .concat(linesLimit ? [["lines_limit", linesLimit]] : [])
          .concat(search ? [["search", search]] : [])
      ).toString(),
    {
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${await _getAuthToken()}`,
      },
      signal: req.signal,
    }
  );

  return new Response(backendResp.body, {
    status: backendResp.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
