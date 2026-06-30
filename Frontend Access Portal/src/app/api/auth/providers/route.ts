import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from '@/lib/auth';

const API_URL = process.env.API_URL || 'http://localhost:8090/api/v1';

export async function GET(request: NextRequest) {

    try {
        const res = await fetch(`${API_URL}/auth/providers`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Failed to fetch providers, (${res.status}):`, errorText);
            return NextResponse.json({ error: `Failed to fetch SSO providers: ${res.status} ${res.statusText}` }, { status: res.status });
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
        console.error('Fetch SSO providers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

}
