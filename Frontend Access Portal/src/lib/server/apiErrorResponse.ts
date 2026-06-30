import { NextResponse } from "next/server";

export function apiErrorResponse(err: any) {
  const message = err?.message ?? "Internal Server Error";
  const status = err?.status ?? 500;
  const data = err?.data ?? null;

  return NextResponse.json<{
    error: string;
    data: unknown;
  }>({ error: message, data }, { status });
}
