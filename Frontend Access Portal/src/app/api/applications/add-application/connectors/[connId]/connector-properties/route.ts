import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export async function GET(
  request: Request,
  { params }: { params: { connId: string } }
) {
  try {
    const { connId } = await params;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${await _getAuthToken()}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(
      `${API_BASE_URL}/connectors/${connId}/properties`,{
        headers
      }
    );
    const data = await response.json();

    // Just ensure valid response
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Failed to fetch connector properties" },
        { status: response.status }
      );
    }

    // Transform the backend response to match frontend expectations
    const transformedConnector = {
      id: connId,
      displayName: data.display_name,
      connectorKey: connId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      configurationProperties: data.properties.map((prop: any) => ({
        name: prop.name,
        displayName: prop.display_name,
        helpMessage: prop.help_message,
        type: prop.type,
        required: prop.required || false,
        confidential: prop.confidential || false
      }))
    };

    return NextResponse.json({
      data: {
        connector: transformedConnector
      },
      message: "Connector properties fetched successfully"
    });
  } catch (error) {
    console.error('Error fetching connector properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connector properties' },
      { status: 500 }
    );
  }
}
