import { _getAuthToken } from "./auth";

import {
  ComponentDebugConfigBody,
  ComponentDebugConfigResponse,
} from "@/types/debug";

// get component debug levels
export const getLogLevels = async (): Promise<ComponentDebugConfigResponse> => {
  const token = await _getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await fetch("/api/logs/level", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to fetch components log levels: ${response.status}`
    );
  }
  return response.json();
};

// set component debug levels
export const setLogLevels = async (
  components: ComponentDebugConfigBody[]
): Promise<string> => {
  const token = await _getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await fetch("/api/logs/level", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(components),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Failed to update components log levels: ${response.status}`
    );
  }
  return response.json();
};
