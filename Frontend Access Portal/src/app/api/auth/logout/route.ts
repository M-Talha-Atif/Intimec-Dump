import {NextResponse} from 'next/server';
import {_logout} from '@/lib/auth';

export async function POST() {
    await _logout()
    return NextResponse.json({success: true});
}
