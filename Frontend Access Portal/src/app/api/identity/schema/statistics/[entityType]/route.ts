import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ entityType: string }> }
) {
    try {
        // Get authentication token
        const token = await _getAuthToken();
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { entityType } = await params;

        // Validate entityType
        if (!entityType) {
            return NextResponse.json(
                { error: 'Entity type is required' },
                { status: 400 }
            );
        }

        // Make request to backend API
    const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://52.143.130.207:8081';
    const backendUrl = `${baseUrl}/api/v1/identity/schema/${encodeURIComponent(entityType)}/statistics`;

        console.log(`Fetching statistics from backend for entity type: ${entityType}`);
        console.log(`Backend URL: ${backendUrl}`);

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
        
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend API error: ${response.status} ${response.statusText}`, errorText);

            return NextResponse.json(
                { error: `Backend API error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('Backend response data:', data);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Error fetching schema statistics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}