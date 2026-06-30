import { useState, useEffect } from 'react';

export interface RoleDetails {
  id: string;
  tenantId: string;
  roleType: string;
  roleName: string;
  description: string;
  businessJustification: string;
  requireOwnerApproval: boolean;
  isActive: boolean;
  tags: string[];
  userCount: number;
  permissionsCount: number;
  hasManualAssignments: boolean;
  hasDynamicRules: boolean;
  riskLevel: string;
  createdAt: number;
  updatedAt: number;
  createdByName: string;
  createdById: string;
  updatedByName: string;
  updatedById: string;
  ownersData: any[];
}

function getErrorMessage(error: any): string {
  if (error?.error) return error.error;
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred. Please try again.';
}

export const useRoleDetails = (roleId: string | null) => {
  const [roleDetails, setRoleDetails] = useState<RoleDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleId) {
      setRoleDetails(null);
      return;
    }

    const fetchRoleDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('[useRoleDetails] Fetching role:', roleId);

        const response = await fetch(`/api/access-portal/roles/${roleId}`);

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = getErrorMessage(errorData);
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('[useRoleDetails] Fetched role details:', result);

        if (result.data) {
          setRoleDetails(result.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('[useRoleDetails] Fetch error:', err);
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        setRoleDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleDetails();
  }, [roleId]);

  return {
    roleDetails,
    loading,
    error,
  };
};