import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('Test route called');
  return NextResponse.json({ message: 'Test route working' });
}
