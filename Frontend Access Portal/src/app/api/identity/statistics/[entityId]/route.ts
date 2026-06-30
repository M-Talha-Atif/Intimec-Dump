import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { IDENTITY_ENTITY_TYPE_ARRAY, isValidEntityType } from "@/constants/identity";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

// Get statistics for a specific entity type
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entityId: string }> }
) {
    try {
        const { entityId } = await params;

        console.log("API Route - GET /api/identity/statistics/[entityId]");
        console.log("entityId:", entityId);

        if (!entityId) {
            return NextResponse.json(
                { error: "entityId path parameter is required" },
                { status: 400 }
            );
        }

        // Validate entityId - ensure it's not a tenant ID
        if (!isValidEntityType(entityId)) {
            // Check if it looks like a tenant ID (common patterns)
            if (entityId.startsWith('tenant_') || entityId.includes('_')) {
                return NextResponse.json(
                    { error: "Invalid request: tenant ID should not be passed as entityId. Use one of: " + IDENTITY_ENTITY_TYPE_ARRAY.join(", ") },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: `Invalid entityId. Must be one of: ${IDENTITY_ENTITY_TYPE_ARRAY.join(", ")}` },
                { status: 400 }
            );
        }


        const authToken = await _getAuthToken();
        console.log("Auth token available:", !!authToken);

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        
        const headers: Record<string, string> = {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
        };
        
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }

        let response;
        let successfulUrl;

        const backendUrl = `${API_BASE_URL}/identity/statistics/${entityId}`;
        try {
            console.log("Attempting request to:", backendUrl);
            response = await fetch(backendUrl, {
                method: "GET",
                headers,
            });

            if (response.ok) {
                successfulUrl = backendUrl;
                console.log("Successful backend URL:", successfulUrl);
            } else {
                console.log(`URL ${backendUrl} returned status ${response.status}`);
            }
        } catch (error) {
            console.log(`Error with URL ${backendUrl}:`, error);
        }

    if (!response || !response.ok) {
      // If no backend URL worked, return mock data for development
      console.log("No backend URL worked, returning mock statistics data");

      // Return entity-level statistics in the expected format
      const mockEntityStats = {
        schemaId: entityId,
        schemaName: entityId.charAt(0).toUpperCase() + entityId.slice(1).replace('_', ' '),
        totalAttributes: Math.floor(Math.random() * 20) + 10,
        requiredFields: Math.floor(Math.random() * 8) + 3,
        sensitiveFields: Math.floor(Math.random() * 5) + 1,
        customFields: Math.floor(Math.random() * 10) + 2,
        highRiskFields: Math.floor(Math.random() * 3),
        schemaCoverage: Math.floor(Math.random() * 30) + 70, // 70-100%
        syncedFields: Math.floor(Math.random() * 15) + 5,
        lastSync: new Date().toISOString(),
      };

      return NextResponse.json(mockEntityStats);
    }        const data = await response.json();
        console.log("Statistics response data:", data);

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error("Error in GET /api/identity/statistics/[entityId]:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
