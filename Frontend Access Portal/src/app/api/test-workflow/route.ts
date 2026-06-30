/**
 * Test API route to check connectivity with the workflow service
 * GET /api/test-workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/api-proxy';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing workflow service connectivity...');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';
    
    // Test 1: Ping workflow health endpoint (no auth required)
    const healthUrl = `${backendUrl}/api/health`;
    console.log(`Attempting to reach: ${healthUrl}`);
    
    const healthResponse = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const healthData = await healthResponse.json();
    
    // Test 2: Try workflow-specific health endpoint
    const workflowHealthUrl = `${backendUrl}/api/workflows/health`;
    console.log(`Attempting to reach: ${workflowHealthUrl}`);
    
    let workflowHealthData = null;
    let workflowHealthError = null;
    
    try {
      const workflowHealthResponse = await fetch(workflowHealthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (workflowHealthResponse.ok) {
        workflowHealthData = await workflowHealthResponse.json();
      } else {
        workflowHealthError = {
          status: workflowHealthResponse.status,
          statusText: workflowHealthResponse.statusText,
          body: await workflowHealthResponse.text(),
        };
      }
    } catch (error: any) {
      workflowHealthError = error.message;
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow service connectivity test completed',
      timestamp: new Date().toISOString(),
      tests: {
        health: {
          url: healthUrl,
          status: healthResponse.status,
          data: healthData,
        },
        workflowHealth: {
          url: workflowHealthUrl,
          data: workflowHealthData,
          error: workflowHealthError,
          note: workflowHealthError ? 'This endpoint may require authentication' : null,
        },
      },
      config: {
        backendUrl,
        apiUrl: process.env.API_URL,
      },
    });
  } catch (error: any) {
    console.error('Error testing workflow service:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
