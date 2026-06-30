import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:8090/api/v1';

export async function PATCH(request: NextRequest) {
    try {
        const token = await _getAuthToken();
        if (!token) {
            return NextResponse.json({ error: 'No authentication token available' }, { status: 401 });
        }

        const { configKey, enabled } = await request.json();

        if (!configKey || typeof enabled !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
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
            method: 'PATCH',
            headers,
            credentials: 'include',
            body: JSON.stringify({ data: { enabled } }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`SSO API Error (${res.status}):`, errorText);
            return NextResponse.json({ error: `Failed to toggle SSO config: ${res.status} ${res.statusText}` }, { status: res.status });
        }

        const responseText = await res.text();
        try {
            const result = responseText ? JSON.parse(responseText) : { success: true };
            return NextResponse.json(result);
        } catch (e) {
            console.error('Failed to parse JSON response:', responseText);
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('Toggle SSO config error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
