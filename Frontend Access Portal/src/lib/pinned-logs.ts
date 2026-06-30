"use client";

import { PinnedLogItem } from "@/contexts/debugging-context";
import { _getAuthToken } from "./auth";

// Interface for the new API request/response structure
export interface PinnedLogRequest {
  documentId: string;
  name: string;
  description: string;
}

export interface PinnedLogResponse {
  documentId: string;
  name: string;
  description: string;
  pinned: boolean;
  pinnedAt: number;
  resolved: boolean;
  resolvedAt: number;
}
export interface ResolvedPinnedLogResponse extends PinnedLogResponse {
  documentId: string;
  resolved: boolean;
  resolvedAt: number;
  resolverId: string;
}

// Get all pinned logs
export const getPinnedLogs = async (): Promise<PinnedLogItem[]> => {
  const token = await _getAuthToken();

  const response = await fetch(`/api/logs/pin`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch pinned logs: ${response.status}`
    );
  }
  return response.json();
};

// Create a new pinned log
export const createPinnedLog = async (
  request: PinnedLogRequest
): Promise<PinnedLogResponse> => {
  const token = await _getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`/api/logs/pin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Handle specific case for already pinned logs
    if (response.status === 409) {
      throw new Error("This log is already pinned");
    }

    throw new Error(
      errorData.message || `Failed to create pinned log: ${response.status}`
    );
  }

  return response.json();
};

// Delete a pinned log
export const deletePinnedLog = async (id: string): Promise<void> => {
  const token = await _getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`/api/logs/pin/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to delete pinned log: ${response.status}`
    );
  }
};

interface deleteResolvedLogResponse {
  documentId: string;
  unresolvedAt: number;
  resolved: boolean;
}

// Delete a resoled log
export const deleteResolvedLog = async (
  id: string
): Promise<deleteResolvedLogResponse> => {
  const token = await _getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`/api/logs/${id}/resolve`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to delete resolved log: ${response.status}`
    );
  }
  return response.json();
};

// Get all Resolved logs
export const getResolvedLogs = async (): Promise<PinnedLogItem[]> => {
  const token = await _getAuthToken();

  const response = await fetch(`/api/logs/pin/resolved`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch Resolved logs: ${response.status}`
    );
  }
  // console.log("Resolved logs fetched:", response.json());
  return response.json();
};

// resolve a pinned log
export const resolvePinnedLog = async (
  id: string
): Promise<ResolvedPinnedLogResponse> => {
  const token = await _getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`/api/logs/${id}/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to resolve pinned log: ${response.status}`
    );
  }

  return response.json();
};
