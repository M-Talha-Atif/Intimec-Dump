import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

interface AppMeta {
  name: string | null;
  ownerName: string | null;
  isAuthoritative: boolean;
  riskLevel: string | null;
  connectorId: string | null;
}

/** Fetch application display metadata by resource UUID. */
async function fetchAppMeta(
  resourceId: string,
  headers: Record<string, string>
): Promise<AppMeta> {
  const empty: AppMeta = { name: null, ownerName: null, isAuthoritative: false, riskLevel: null, connectorId: null };
  try {
    const resp = await fetch(`${API_BASE_URL}/applications/${resourceId}`, { headers });
    if (!resp.ok) return empty;
    const app = await resp.json();
    const details = app?.details ?? {};
    // owner may be a list [{id, name, kind}] or a single object
    const owners: Array<{ name?: string }> = Array.isArray(details.owner)
      ? details.owner
      : details.owner
        ? [details.owner]
        : [];
    const ownerName = owners.find((o) => o.name)?.name ?? null;
    return {
      name: (details.name as string) ?? null,
      ownerName,
      isAuthoritative: Boolean(details.isAuthoritative),
      riskLevel: (details.riskLevel as string) ?? null,
      connectorId: (app?.connector?.connectorId as string) ?? null,
    };
  } catch {
    return empty;
  }
}

// Get shadows (linked resource accounts) for an identity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identityId: string }> }
) {
  try {
    const { identityId } = await params;
    const { searchParams } = new URL(request.url);
    const resourceUid = searchParams.get("resourceUid");
    const objectClass = searchParams.get("objectClass");

    if (!identityId) {
      return NextResponse.json(
        { message: "identityId path parameter is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value ?? null;
    const sessionId = cookieStore.get('session_id')?.value ?? null;

    const queryParams = new URLSearchParams();
    if (resourceUid) queryParams.set("resourceUid", resourceUid);
    if (objectClass) queryParams.set("objectClass", objectClass);
    const queryString = queryParams.toString();

    const backendUrl = `${API_BASE_URL}/identity/${identityId}/shadows${queryString ? `?${queryString}` : ""}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    if (sessionId) headers['X-Session-Id'] = sessionId;

    const response = await fetch(backendUrl, { method: "GET", headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: (errorData as { message?: string }).message || `Backend error ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    const shadows: Array<{ resourceId: string; attributes?: Record<string, unknown> }> =
      data.shadows || [];

    if (shadows.length > 0) {
      const uniqueResourceIds = [...new Set(shadows.map((s) => s.resourceId))];

      const metaMap = new Map<string, AppMeta>();
      await Promise.allSettled(
        uniqueResourceIds.map(async (rid) => {
          const meta = await fetchAppMeta(rid, headers);
          metaMap.set(rid, meta);
        })
      );

      data.shadows = shadows.map((s) => {
        const meta = metaMap.get(s.resourceId);
        return {
          ...s,
          _appMeta: meta ?? null,
          attributes: {
            ...s.attributes,
            applicationName: meta?.name || s.attributes?.applicationName,
          },
        };
      });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("Error in GET /api/identity/shadows/[identityId]:", error);
    return NextResponse.json(
      { message: `Proxy error: ${message}` },
      { status: 500 }
    );
  }
}
