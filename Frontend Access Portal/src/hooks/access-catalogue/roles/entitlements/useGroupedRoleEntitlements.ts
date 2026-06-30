import { useState, useEffect, useCallback } from 'react';
import { EntitlementResponseDto } from '@/types/entitlements';

export interface ApplicationEntitlementGroup {
  resourceId: string;
  resourceName: string;
  entitlementCount: number;
  highRiskCount: number;
  entitlements: {
    content: EntitlementResponseDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

export interface GroupedRoleEntitlementsResponse {
  totalApplications: number;
  totalEntitlements: number;
  applications: {
    content: ApplicationEntitlementGroup[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

interface UseGroupedRoleEntitlementsReturn {
  data: GroupedRoleEntitlementsResponse | null;
  loading: boolean;
  error: string | null;
  appPage: number;
  appSize: number;
  entPage: number;
  entSize: number;
  goToAppPage: (page: number) => void;
  changeAppSize: (size: number) => void;
  goToEntPage: (page: number) => void;
  changeEntSize: (size: number) => void;
  refresh: () => void;
}

export const useGroupedRoleEntitlements = (
  roleId: string | null,
  initialAppPage = 0,
  initialAppSize = 5,
  initialEntPage = 0,
  initialEntSize = 10
): UseGroupedRoleEntitlementsReturn => {
  const [data, setData] = useState<GroupedRoleEntitlementsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appPage, setAppPage] = useState(initialAppPage);
  const [appSize, setAppSize] = useState(initialAppSize);
  const [entPage, setEntPage] = useState(initialEntPage);
  const [entSize, setEntSize] = useState(initialEntSize);

  const fetchData = useCallback(async () => {
    if (!roleId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/access-roles/${roleId}/entitlements/grouped?appPage=${appPage}&appSize=${appSize}&entPage=${entPage}&entSize=${entSize}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch grouped entitlements');
      }

      const json = await response.json();
      setData(json.data || json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch grouped role entitlements');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [roleId, appPage, appSize, entPage, entSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToAppPage = useCallback((page: number) => {
    setAppPage(page);
    setEntPage(0); // Reset entitlement page when changing app page
  }, []);

  const changeAppSize = useCallback((size: number) => {
    setAppSize(size);
    setAppPage(0);
    setEntPage(0);
  }, []);

  const goToEntPage = useCallback((page: number) => {
    setEntPage(page);
  }, []);

  const changeEntSize = useCallback((size: number) => {
    setEntSize(size);
    setEntPage(0);
  }, []);

  return {
    data,
    loading,
    error,
    appPage,
    appSize,
    entPage,
    entSize,
    goToAppPage,
    changeAppSize,
    goToEntPage,
    changeEntSize,
    refresh: fetchData,
  };
};