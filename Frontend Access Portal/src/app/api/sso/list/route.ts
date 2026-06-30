import { NextResponse } from 'next/server';
import { _getAuthToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:8090/api/v1';

export async function GET() {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json({ error: 'No authentication token available' }, { status: 401 });
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

    const res = await fetch(`${API_URL}/configurations/sso`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`SSO API Error (${res.status}):`, errorText);
      return NextResponse.json({ error: `Failed to list SSO configs: ${res.status} ${res.statusText}` }, { status: res.status });
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
    console.error('List SSO configs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
