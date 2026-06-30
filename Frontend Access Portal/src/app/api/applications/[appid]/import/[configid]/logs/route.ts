// app/api/v1/applications/[appid]/import/stream/route.ts
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { appid: string } }
) {
  const appid = (await params).appid;
  const backendResp = await fetch(
    `${process.env.MOCK_DATA_API_URL}/applications/${appid}/import/logs`,
    {
      headers: {
        Accept: "text/event-stream",
      },
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
