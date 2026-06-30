import { apiFetch } from "@/lib/server/apiFetch";
import { wrapRoute } from "@/lib/server/wrapRoute";
import { NextRequest, NextResponse } from "next/server";

// const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";
const MOCK_URL = process.env.MOCK_DATA_API_URL || "http://localhost:4000";

export const POST = wrapRoute(async (req: NextRequest) => {
  const body = await req.json();
  const { config } = body;
  
	const data = await apiFetch(
    `${MOCK_URL}/applications/add-application/validate-config`,
    {
      method: "POST",
      body: JSON.stringify({ config }),
    },
  );

  return NextResponse.json(data);
});
