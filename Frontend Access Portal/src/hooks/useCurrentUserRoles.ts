import { useState, useEffect } from 'react';

interface UserRole {
  id: string;
//   roleType: string;
  roleName: string;
  roleDescription: string;
  roleActive: boolean;
  riskLevel: string;
}

// Admin role types that grant admin access
// const ADMIN_ROLE_TYPES = [
//   'ADMINISTRATOR',
//   'SYSTEM',
//   'SUPER_ADMIN',
// ];

// Admin role name patterns
const ADMIN_ROLE_NAME_PATTERNS = [
  'admin',
  'administrator',
  'system admin',
  'super admin',
];

export const useCurrentUserRoles = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/access-portal/user-roles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user roles');
        }

        const data = await response.json();
        const userRoles: UserRole[] = data.data || [];

        console.log(userRoles)

        setRoles(userRoles);

        //  Check if user has any admin role
        const hasAdminRole = userRoles.some((role) => {
          if (!role.roleActive) return false;


          // Check by role name patterns
          const roleNameLower = role.roleName.toLowerCase();
          return ADMIN_ROLE_NAME_PATTERNS.some(pattern => 
            roleNameLower.includes(pattern)
          );
        });

        setIsAdmin(hasAdminRole);

        console.log('[useCurrentUserRoles] Admin check:', {
          totalRoles: userRoles.length,
          activeRoles: userRoles.filter(r => r.roleActive).length,
          hasAdminRole,
          adminRoles: userRoles
            .filter(r => r.roleActive && (
              ADMIN_ROLE_NAME_PATTERNS.some(p => r.roleName.toLowerCase().includes(p))
            ))
            .map(r => ({ name: r.roleName })),
        });
      } catch (err) {
        console.error('[useCurrentUserRoles] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    isAdmin,
  };
};