import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:8090/api/v1';

export async function GET(request: NextRequest, { params }: { params: { configKey: string } }) {
    try {
        const token = await _getAuthToken();
        if (!token) {
            return NextResponse.json({ error: 'No authentication token available' }, { status: 401 });
        }

        const { configKey } = await params;

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }

        const res = await fetch(`${API_URL}/configurations/sso/${configKey}`, {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`SSO API Error (${res.status}):`, errorText);
            return NextResponse.json({ error: `Failed to fetch SSO config: ${res.status} ${res.statusText}` }, { status: res.status });
        }

        const responseText = await res.text();
        try {
            const result = JSON.parse(responseText);
            return NextResponse.json(result);
        } catch (e) {
            console.error('Failed to parse JSON response:', responseText);
            return NextResponse.json({ error: 'Invalid JSON response from server' }, { status: 502 });
        }
    } catch (error) {
        console.error('Get SSO config error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { configKey: string } }) {
    try {
        const token = await _getAuthToken();
        if (!token) {
            return NextResponse.json({ error: 'No authentication token available' }, { status: 401 });
        }

        const { configKey } = await params;
        const { data, encryptEntireConfig, description } = await request.json();

        // If encryption is enabled, add it to the data as well
        const configData = { ...data };


        const requestBody: any = { data: configData, configType: 'config' };

        if (encryptEntireConfig !== undefined) {
            requestBody.encryptEntireConfig = encryptEntireConfig;
        }

        if (description) {
            requestBody.description = description;
        }

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }

        const res = await fetch(`${API_URL}/configurations/sso/${configKey}`, {
            method: 'PUT',
            headers,
            credentials: 'include',
            body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`SSO API Error (${res.status}):`, errorText);
            return NextResponse.json({ error: `Failed to update SSO config: ${res.status} ${res.statusText}` }, { status: res.status });
        }

        const responseText = await res.text();
        try {
            const result = JSON.parse(responseText);
            return NextResponse.json(result);
        } catch (e) {
            console.error('Failed to parse JSON response:', responseText);
            return NextResponse.json({ error: 'Invalid JSON response from server' }, { status: 502 });
        }
    } catch (error) {
        console.error('Update SSO config error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { configKey: string } }) {
    try {
        const token = await _getAuthToken();
        if (!token) {
            return NextResponse.json({ error: 'No authentication token available' }, { status: 401 });
        }

        const { configKey } = await params;

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }

        const res = await fetch(`${API_URL}/configurations/sso/${configKey}`, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`SSO API Error (${res.status}):`, errorText);
            return NextResponse.json({ error: `Failed to delete SSO config: ${res.status} ${res.statusText}` }, { status: res.status });
        }

        // Handle 204 No Content response - no body to parse
        if (res.status === 204) {
            return NextResponse.json({ success: true });
        }

        const responseText = await res.text();
        if (!responseText) {
            return NextResponse.json({ success: true });
        }

        try {
            const result = JSON.parse(responseText);
            return NextResponse.json(result);
        } catch (e) {
            console.error('Failed to parse JSON response:', responseText);
            return NextResponse.json({ success: true }); // If we can't parse but got 2xx, consider it success
        }
    } catch (error) {
        console.error('Delete SSO config error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { configKey: string } }) {
    try {
        const token = await _getAuthToken();
        if (!token) {
            return NextResponse.json({ error: 'No authentication token available' }, { status: 401 });
        }

        const { configKey } = await params;
        const body = await request.json();

        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }

        const res = await fetch(`${API_URL}/configurations/sso/${configKey}`, {
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`SSO API Error (${res.status}):`, errorText);
            return NextResponse.json(
                { error: `Failed to patch SSO config: ${res.status} ${res.statusText}` },
                { status: res.status }
            );
        }

        const responseText = await res.text();
        try {
            const data = JSON.parse(responseText);
            return NextResponse.json(data);
        } catch (e) {
            console.error('Failed to parse JSON response:', responseText);
            return NextResponse.json({ error: 'Invalid JSON response from server' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in SSO config PATCH:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
