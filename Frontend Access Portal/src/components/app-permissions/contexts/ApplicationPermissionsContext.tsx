"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface PermissionStats {
  totalRoles: number;
  activeAdmins: number;
  scopedDomains: number;
  pendingRequests: number;
}

export interface ApplicationPermissionsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  permissionStats: PermissionStats;
  setPermissionStats: (stats: PermissionStats) => void;
  isLoading: boolean;
  error: string | null;
}

const ApplicationPermissionsContext = createContext<
  ApplicationPermissionsContextType | undefined
>(undefined);

export interface ApplicationPermissionsProviderProps {
  children: ReactNode;
}

export const ApplicationPermissionsProvider: React.FC<
  ApplicationPermissionsProviderProps
> = ({ children }) => {
  const [activeTab, setActiveTab] = useState("granular-matrix");
  const [permissionStats, setPermissionStats] = useState<PermissionStats>({
    totalRoles: 0,
    activeAdmins: 0,
    scopedDomains: 8,
    pendingRequests: 3,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoleStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/roles/stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch role statistics: ${response.status}`);
        }

        const data = await response.json();

        setPermissionStats({
          totalRoles: data.totalRoles || 0,
          activeAdmins: data.activeAdmins || 0,
          scopedDomains: 8, // Keep static for now
          pendingRequests: 3, // Keep static for now
        });
      } catch (err) {
        console.error("Error fetching role stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch role statistics");
        // Keep default values on error
        setPermissionStats({
          totalRoles: 0,
          activeAdmins: 0,
          scopedDomains: 8,
          pendingRequests: 3,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleStats();
  }, []);

  return (
    <ApplicationPermissionsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        permissionStats,
        setPermissionStats,
        isLoading,
        error,
      }}
    >
      {children}
    </ApplicationPermissionsContext.Provider>
  );
};

export const useApplicationPermissions =
  (): ApplicationPermissionsContextType => {
    const context = useContext(ApplicationPermissionsContext);
    if (context === undefined) {
      throw new Error(
        "useApplicationPermissions must be used within an ApplicationPermissionsProvider"
      );
    }
    return context;
  };
