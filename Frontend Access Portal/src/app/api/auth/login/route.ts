import { NextRequest, NextResponse } from 'next/server';
import { _login } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || undefined;
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';
    console.log('[Login Route] User-Agent from browser:', userAgent);
    console.log('[Login Route] Client IP:', clientIp);
    const result = await _login(body, userAgent, clientIp);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Authentication failed' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
