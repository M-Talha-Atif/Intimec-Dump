import { cache } from "react";
import { _getAuthToken } from "./auth";
import { Task } from "@/types/task";
const API_URL = process.env.API_URL;
export const getTask = cache(async function (
  appId: string,
  taskId: string
): Promise<Task | null> {
  try {
    const response = await fetch(
      `${API_URL}/applications/${appId}/tasks/${taskId}`,
      {
        next: { revalidate: 60 }, // ISR: revalidates every 60 seconds
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await _getAuthToken()}`,
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch application");
    }
    return data as Task;
  } catch (error) {
    console.error("Error fetching Task:", error);
    return null;
  }
});
