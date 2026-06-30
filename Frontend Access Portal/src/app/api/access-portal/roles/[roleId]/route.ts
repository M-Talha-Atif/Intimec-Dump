import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.API_URL || "http://localhost:8081";

function buildHeaders(authToken: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  return headers;
}

/**
 * GET /api/access-portal/roles/[roleId]
 * Fetch a single role by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
) {
  try {
    const roleId = await params.roleId;
    
    if (!roleId || roleId === 'undefined') {
      console.error('[RoleFetch] Invalid roleId:', roleId);
      return NextResponse.json(
        { error: 'Invalid roleId' },
        { status: 400 }
      );
    }

    const authToken = await _getAuthToken();
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${BACKEND_URL}/roles/${roleId}`,
      {
        method: 'GET',
        headers: buildHeaders(authToken),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RoleFetch] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch role', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ data: data.data || data });
  } catch (error) {
    console.error('[RoleFetch] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}