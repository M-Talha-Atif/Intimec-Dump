import { cache } from "react";
import { RecivedApplication } from "@/types/add-application";
import { apiFetch } from "./server/apiFetch";
const API_URL = process.env.API_URL;
export const getApplication = cache(async function (
  appId: string,
): Promise<RecivedApplication | null> {
  try {
    const response = await apiFetch<RecivedApplication>(
      `${API_URL}/applications/${appId}`,
      {
        cache: "no-store",
      },
    );
    return response;
  } catch (error) {
    console.error("Error fetching application:", error);
    return null;
  }
});
