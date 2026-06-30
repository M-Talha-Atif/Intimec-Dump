import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/api-proxy";

/**
 * BFF route: Proxies entitlement search requests to the Identity Service
 * via the API Gateway. Transforms Spring Page responses to the frontend
 * pagination format and maps backend field names to frontend conventions.
 *
 * Frontend:  GET /api/applications/{appId}/entitlements?page=0&size=10&search=...&riskLevel=...&lifecycle=...&type=...
 * Backend:   GET /api/v1/entitlements/by-resource/{appId}/search?page=0&size=10&search=...&riskLevel=...&lifecycle=...&kind=...
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;
  const searchParams = req.nextUrl.searchParams;

  // Build backend query params — map frontend "type" to backend "kind"
  const backendParams = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key === "type") {
      backendParams.append("kind", value);
    } else {
      backendParams.append(key, value);
    }
  }

  try {
    const response = await proxyFetch(
      `/entitlements/by-resource/${appid}/search?${backendParams.toString()}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend entitlement search error:", response.status, errorText);
      return NextResponse.json(
        { data: [], pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 } },
        { status: 200 }
      );
    }

    const springPage = await response.json();

    // Transform Spring Page → frontend { data, pagination } format
    // Map backend field names → frontend field names
    const data = (springPage.content || []).map(mapEntitlementToFrontend);

    return NextResponse.json({
      data,
      pagination: {
        page: springPage.number ?? 0,
        size: springPage.size ?? 10,
        totalElements: springPage.totalElements ?? 0,
        totalPages: springPage.totalPages ?? 0,
      },
    });
  } catch (error) {
    console.error("Error proxying entitlement search:", error);
    return NextResponse.json(
      { data: [], pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 } },
      { status: 200 }
    );
  }
}

/**
 * Maps backend EntitlementResponseDto to the frontend Entitlement shape.
 * Key differences: displayName→name, resourceId→applicationId, kind→type,
 * Instant timestamps→epoch ms, governance field casing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEntitlementToFrontend(backend: Record<string, any>) {
  return {
    id: backend.id,
    name: backend.displayName ?? "",
    description: backend.description ?? "",
    applicationId: backend.resourceId ?? "",
    owner: backend.ownerId ?? null,
    type: backend.kind ?? "entitlement",
    lifecycle: backend.lifecycle ?? "Active",
    requestable: backend.requestable ?? false,
    classification: backend.classification ?? [],
    lastUsed: null,
    riskLevel: backend.riskLevel ?? null,
    riskReason: backend.riskReason ?? null,
    privilegeLevel: backend.privilegeLevel ?? null,
    identityType: backend.identityType ?? null,
    requireApproval: backend.requireApproval ?? false,
    AutoExpireDurationMs: backend.autoExpireDurationMs ?? null,
    MaximumDurationMs: backend.maxDurationMs ?? null,
    AllowedAutomatedGrant: backend.allowedAutomatedGrant ?? false,
    assignedUsersCount: backend.assignedUsersCount ?? 0,
    createdAt: backend.createdAt ? new Date(backend.createdAt).getTime() : Date.now(),
    updatedAt: backend.updatedAt ? new Date(backend.updatedAt).getTime() : Date.now(),
    users: null, // Members loaded via separate /{id}/members endpoint
  };
}
