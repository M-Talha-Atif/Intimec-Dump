import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/api-proxy";

/**
 * BFF route: Proxies entitlement member requests to the Identity Service.
 * Frontend:  GET /api/applications/{appId}/entitlements/{entitlementId}/members?page=0&size=20
 * Backend:   GET /api/v1/entitlements/{entitlementId}/members?page=0&size=20
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appid: string; entitlementId: string }> }
) {
  const { entitlementId } = await params;
  const searchParams = req.nextUrl.searchParams;

  try {
    const response = await proxyFetch(
      `/entitlements/${entitlementId}/members?${searchParams.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend entitlement members error:", response.status, errorText);
      return NextResponse.json(
        { data: [], pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 } },
        { status: 200 }
      );
    }

    const springPage = await response.json();

    return NextResponse.json({
      data: (springPage.content || []).map(mapMemberToFrontend),
      pagination: {
        page: springPage.number ?? 0,
        size: springPage.size ?? 20,
        totalElements: springPage.totalElements ?? 0,
        totalPages: springPage.totalPages ?? 0,
      },
    });
  } catch (error) {
    console.error("Error proxying entitlement members:", error);
    return NextResponse.json(
      { data: [], pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 } },
      { status: 200 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMemberToFrontend(backend: Record<string, any>) {
  // Mock departments and risk levels for demo purposes
  const departments = ["Engineering", "Backend", "Frontend", "DevOps", "QA", "Security", "Operations"];
  const riskLevels = ["High", "Medium", "Low", null];
  
  return {
    assignmentId: backend.assignmentId,
    shadowId: backend.shadowId,
    accountName: backend.accountName ?? "Unknown",
    identityId: backend.identityId ?? null,
    identityName: backend.identityName ?? null,
    source: backend.source ?? "IMPORT",
    assignedAt: backend.assignedAt ?? null,
    updatedAt: backend.updatedAt ?? null,
    department: backend.department ?? departments[Math.floor(Math.random() * departments.length)],
    riskLevel: backend.riskLevel ?? riskLevels[Math.floor(Math.random() * riskLevels.length)],
    status: backend.status ?? "Active",
  };
}
