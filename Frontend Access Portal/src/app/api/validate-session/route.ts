import { NextRequest, NextResponse } from 'next/server';
import { _validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const result = await _validateSession();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Session validation API error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
