import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/api-proxy";

/**
 * BFF route: Fetches entitlement filter options from the Identity Service.
 * Transforms backend FilterOptionDto[] to the frontend FilterOptionGroup[] format.
 *
 * Frontend:  GET /api/applications/{appId}/entitlements/filters
 * Backend:   GET /api/v1/entitlements/by-resource/{appId}/filters
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;

  try {
    const response = await proxyFetch(
      `/entitlements/by-resource/${appid}/filters`
    );

    if (!response.ok) {
      return NextResponse.json({ filters: [] });
    }

    const backendFilters = await response.json();

    // Transform backend FilterOptionDto[] → frontend FilterOptionGroup[]
    // Backend: { key, label, values: [{ value, label, count }] }
    // Frontend: { title, type, key, options: [{ label, value }], defaultValue }
    const filters = (backendFilters || []).map(
      (f: { key: string; label: string; values: { value: string; label: string }[] }) => ({
        title: f.label,
        type: "checkbox" as const,
        key: f.key,
        options: (f.values || []).map((v: { value: string; label: string }) => ({
          label: v.label,
          value: v.value,
        })),
        defaultValue: null,
      })
    );

    return NextResponse.json({ filters });
  } catch (error) {
    console.error("Error proxying entitlement filters:", error);
    return NextResponse.json({ filters: [] });
  }
}
