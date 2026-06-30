import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/server/apiFetch";
import { wrapRoute } from "@/lib/server/wrapRoute";

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export const POST = wrapRoute(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ appid: string }> },
  ) => {
    const formData = await req.formData();
    const { appid } = await params;
    const data = await apiFetch(`${API_BASE_URL}/applications/${appid}`, {
      method: "PUT",
      body: formData,
    });

    return NextResponse.json(data);
  },
);
