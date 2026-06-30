import { _getAuthToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appid: string; configid: string }> }
) {
  const { appid, configid } = await params;
  const urlParams = req.nextUrl.searchParams;
  const logLevels = urlParams.getAll("log_level");
  const linesLimit = urlParams.get("lines_limit");
  const search = urlParams.get("search");
  // Forward the request to the backend service
  const backendResp = await fetch(
    `${process.env.MOCK_DATA_API_URL}/applications/${appid}/import/config/${configid}/stream?` +
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
