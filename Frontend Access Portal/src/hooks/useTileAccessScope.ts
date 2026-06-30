import { useState, useCallback } from 'react';
import { AccessItem } from '@/data/mock-access-portal';

interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface TileAccessScopeResult {
  items: AccessItem[];
  allowRequestForOthers: boolean;
  pagination: PaginationMeta;
}

export const useTileAccessScope = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTileAccessItems = useCallback(async (
    tileId: string,
    page: number = 0,
    size: number = 10
  ): Promise<TileAccessScopeResult> => {
    setLoading(true);
    setError(null);

    try {

      const response = await fetch(
        `/api/access-portal/tiles/${tileId}/access-scope?page=${page}&size=${size}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tile access scope: ${response.status}`);
      }

      const rawData = await response.json();
      const data = rawData.data;

      if (!data.items || !Array.isArray(data.items)) {
        return {
          items: [],
          allowRequestForOthers: data.allowRequestForOthers || false,
          pagination: { page: 0, size, totalElements: 0, totalPages: 0, last: true },
        };
      }

      const items: AccessItem[] = data.items.map((item: any) => ({
        id: item.itemCode,
        name: item.itemName,
        type: item.itemType?.toLowerCase() === 'entitlement'
          ? 'entitlement'
          : item.itemType?.toLowerCase() === 'application'
            ? 'application'
            : 'role',
        description: item.itemDescription || '',
        owner: item.itemOwner || 'System',
        department: item.department || 'IT',
        category: data.tileCategory,
        icon: item.itemIcon || 'Shield',
        riskLevel: (item.riskLevel?.toLowerCase() || 'low') as 'low' | 'medium' | 'high' | 'critical',
        requestCount: item.totalRequests ?? 0,
        tags: [],
        approvalWorkflow: [],
        allowRequestForOthers: data.allowRequestForOthers,
        hierarchyLevel: 'role',
        hierarchyPath: [],
        childCount: 0,
        applicationName: '',
        expiringUsers: 0,
        parentId: undefined,
        ownerEmail: '',
        ownerDepartment: '',
        businessJustification: '',
        tileId: data.tileId,
        customIcon: '',
        lastUsedDate: '',
        avgUsagePerMonth: 0,
        provisioningTime: 0,
        approvalRate: item.approvalRate ?? 0,
        totalRequests: item.totalRequests ?? 0,
      }));

      return {
        items,
        allowRequestForOthers: data.allowRequestForOthers || false,
        pagination: {
          page: data.page ?? 0,
          size: data.size ?? size,
          totalElements: data.totalElements ?? items.length,
          totalPages: data.totalPages ?? 1,
          last: data.last ?? true,
        },
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return {
        items: [],
        allowRequestForOthers: false,
        pagination: { page: 0, size, totalElements: 0, totalPages: 0, last: true },
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchTileAccessItems, loading, error };
};