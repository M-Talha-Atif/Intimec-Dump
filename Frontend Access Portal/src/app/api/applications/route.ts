import { Application, RiskLevel } from "@/types/application";
import { NextRequest, NextResponse } from "next/server";
import { apiFetch, type ApiError } from "@/lib/server/apiFetch";
import { wrapRoute } from "@/lib/server/wrapRoute";
import { PaginatedSpringData } from "@/types/pagination";
import { FinalFormDataOutput } from "@/types/add-application";

const API_BASE_URL = process.env.API_URL || "http://localhost:8090/api/v1";

export const GET = wrapRoute(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "0", 10);
  const size = parseInt(searchParams.get("size") || "10", 10);

  if (Number.isNaN(page) || page < 0) {
    const error = new Error("Invalid 'page' parameter") as ApiError;
    error.status = 400;
    throw error;
  }

  if (Number.isNaN(size) || size <= 0) {
    const error = new Error("Invalid 'size' parameter") as ApiError;
    error.status = 400;
    throw error;
  }

  // Also pass through filter_search if provided
  const filterSearch = searchParams.get("filter_search");
  let url = `${API_BASE_URL}/applications?page=${page}&size=${size}`;
  if (filterSearch) {
    url += `&search=${encodeURIComponent(filterSearch)}`;
  }

  const data = await apiFetch<
    PaginatedSpringData<
      FinalFormDataOutput & {
        id: string;
        createdAt: string;
        updatedAt: string;
        totalAccounts: number;
        orphanCount: number;
      }
    >
  >(url);

  const fullApplications: Application[] = data.content.map((app) => {
    const riskLevel = (["Low", "Medium", "High"].includes(app.details?.riskLevel)
      ? app.details.riskLevel
      : "Low") as RiskLevel;

    return {
      id: app.id,
      name: app.details?.name || "Unnamed Application",
      description: app.details?.description || "",
      type: app.connector?.type || "Unknown",
      usersCount: app.totalAccounts ?? 0,
      entitlementsCount: 0,
      lastSync: app.updatedAt,
      lastSyncAccounts: app.updatedAt,
      lastSyncEntitlements: app.updatedAt,
      createdAt: app.createdAt,
      category: app.details?.category?.length ? app.details.category.join(", ") : "Uncategorized",
      users: app.totalAccounts ?? 0,
      orphan: (app.orphanCount ?? 0) > 0,
      orphanCount: app.orphanCount ?? 0,
      risky: riskLevel === "High",
      riskyCount: app.orphanCount ?? 0,
      riskLevel,
      flows: 0,
      connectionStatus: "Offline",
      aiStatus: "AI Pending",
      status: "INACTIVE",
      authoritative: app.details?.isAuthoritative ?? false,
    };
  });

  return NextResponse.json<PaginatedSpringData<Application>>({
    ...data,
    content: fullApplications,
  });
});