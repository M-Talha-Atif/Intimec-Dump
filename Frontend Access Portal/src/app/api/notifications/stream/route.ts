import { cookies } from 'next/headers';
const API_URL = process.env.API_URL || 'http://localhost:8089/api/v1';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');

    if (!authToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Use server-side environment variable for backend URL
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8089'}/api/v1/notifications/stream`;
    console.log('SSE Proxy: Connecting to backend SSE endpoint:', backendUrl);
    
    // Create the backend connection
    const controller = new AbortController();
    const response = await fetch(backendUrl, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Authorization': `Bearer ${authToken.value}`,
        'Connection': 'keep-alive',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SSE Proxy: Backend connection failed:', response.status, errorText);
      return new Response(`Backend connection failed: ${response.status}`, { 
        status: response.status 
      });
    }

    console.log('SSE Proxy: Backend connection established successfully');

    // Create headers for the SSE response
    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'Access-Control-Allow-Methods': 'GET',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Handle client disconnect
    request.signal.addEventListener('abort', () => {
      console.log('SSE Proxy: Client disconnected, aborting backend connection');
      controller.abort();
    });

    // Simply pass through the response body
    return new Response(response.body, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('SSE Proxy: Error setting up SSE connection:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
