import { NextRequest, NextResponse } from 'next/server';
import { _getAuthToken } from "@/lib/auth";

const BACKEND_URL =
  process.env.API_URL  || 'http://localhost:8081';

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const authToken = await _getAuthToken();

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { withdrawalReason } = body;

    if (!withdrawalReason || withdrawalReason.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Withdrawal reason is required' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/access-portal/access-requests/${params.requestId}/withdraw`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          withdrawalReason: withdrawalReason.trim(),
        }),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || 'Failed to withdraw request',
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Request withdrawn successfully',
      data: data.data,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
