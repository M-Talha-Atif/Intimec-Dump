import { _getAuthToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

// Route through API gateway so it works in both local dev and Docker deployment
const API_URL = process.env.API_URL || "http://127.0.0.1:8089/api/v1";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log("[API Route] Received file upload request:", file?.name, file?.size);

    if (!file) {
      console.error("[API Route] No file provided");
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for server-side fetch
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("[API Route] File converted to buffer, size:", buffer.length);

    // Create a proper multipart form data with FormData
    const backendFormData = new FormData();
    // Use File constructor which works better with Node.js fetch
    const fileBlob = new File([buffer], file.name, { type: file.type || 'application/octet-stream' });
    backendFormData.append("file", fileBlob);

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const authToken = await _getAuthToken();
    console.log("[API Route] Auth token retrieved:", authToken ? "Yes" : "No");

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${authToken}`,
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }

    const backendUrl = `${API_URL}/connector-files/upload`;
    console.log("[API Route] Sending request to:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers,
      body: backendFormData,
    });

    console.log("[API Route] Backend response status:", response.status);

    const responseText = await response.text();
    console.log("[API Route] Backend response body:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("[API Route] Failed to parse JSON response:", e);
      return NextResponse.json(
        { message: responseText || "Invalid response from backend" },
        { status: response.status || 500 }
      );
    }

    if (!response.ok) {
      console.error("[API Route] Backend returned error:", data);
      return NextResponse.json(
        { message: data?.message ?? "Failed to upload file" },
        { status: response.status }
      );
    }

    console.log("[API Route] Upload successful:", data);

    return NextResponse.json({
      message: data.message || "File uploaded successfully",
      path: data.path,
      filename: data.filename,
    }, { status: 200 });

  } catch (error) {
    console.error("[API Route] Exception caught:", error);
    console.error("[API Route] Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
