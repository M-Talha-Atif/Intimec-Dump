import { _getAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";

export type ApiError<T> = Error & { status?: number; data?: T };

export interface TypedResponse<T> extends Response {
  json(): Promise<T>;
}

async function apiFetchRaw<T, E = unknown>(url: string, options?: RequestInit) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  const authToken = await _getAuthToken();
  const isFormData = options?.body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(sessionId ? { "X-Session-Id": sessionId } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers ?? {}),
    },
  });
  if (!response.ok) {
    let message = "Request failed";
    let data: unknown = null;
    try {
      const errorData = await response.json();
      message = errorData?.message ?? errorData?.error ?? message;
      data = errorData;
      console.error(`[apiFetch] Error response (${response.status}) from ${url}:`, JSON.stringify(errorData, null, 2));
    } catch {
      // Try to get text response if JSON parsing fails
      try {
        const textBody = await response.text();
        message = textBody || message;
        console.error(`[apiFetch] Error text response (${response.status}) from ${url}:`, textBody);
      } catch {
        console.error(`[apiFetch] Could not parse error response (${response.status}) from ${url}`);
      }
    }

    const error = new Error(message) as ApiError<E>;
    error.status = response.status;
    error.data = data as E;

    throw error;
  }
  return response as TypedResponse<T>;
}

export async function apiFetch<T, E = unknown>(url: string, options?: RequestInit) {
  const response = await apiFetchRaw<T, E>(url, options);

  return response.json() as Promise<T>;
}

apiFetch.raw = apiFetchRaw;