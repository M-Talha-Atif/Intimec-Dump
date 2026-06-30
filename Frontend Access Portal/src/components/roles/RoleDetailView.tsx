import * as React from 'react';
import { Role } from '@/types/roles';
import RoleEditor from './editor/RoleEditor';
import RoleViewer from './viewer/RoleViewer';
import { apiRoleToUiRole } from '@/lib/role-adapter';
import type { ApiResponse, AccessRoleDetailResponse } from '@/types/access-roles';
import { toast } from 'sonner';

interface RoleDetailViewProps {
  role: Role | null;
  allRoles: Role[];
  onSelectRole: (role: Role) => void;
  /** Called after a successful save with the fresh role data from backend */
  onRoleUpdated: (freshRole: Role) => void;
}

/**
 * Fetches a single role's full detail from the backend and converts it to UI Role.
 */
async function fetchFreshRole(roleId: string): Promise<Role> {
  const res = await fetch(`/api/access-catalogue/roles/${roleId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `Failed to fetch role (${res.status})`);
  }
  const json = await res.json();
  const apiResponse = json as ApiResponse<AccessRoleDetailResponse>;
  return apiRoleToUiRole(apiResponse.data);
}

const RoleDetailView = ({ role, allRoles, onSelectRole, onRoleUpdated }: RoleDetailViewProps) => {
  const [isEditing, setIsEditing] = React.useState(false);

  // Reset edit mode when selected role changes
  React.useEffect(() => {
    setIsEditing(false);
  }, [role?.id]);

  if (!role) {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-slate-50 text-slate-500">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-400">?</span>
          </div>
          <h3 className="text-sm font-medium">Select a role</h3>
          <p className="text-sm">Choose a role from the list to see its details.</p>
        </div>
      </div>
    );
  }

  /**
   * Called by RoleEditor after metadata + entitlement sync completes.
   *
   * 1. Re-fetches the role detail from backend (source of truth)
   * 2. Converts to UI Role via adapter
   * 3. Pushes fresh data up to Page (updates selectedRole + refreshes sidebar)
   * 4. Exits edit mode
   */
  const handleSaveRole = async (_editedRole: Role) => {
    try {
      const freshRole = await fetchFreshRole(role.id);
      onRoleUpdated(freshRole);
    } catch (err) {
      // Save already succeeded — just update with what we have and log warning
      console.warn("[RoleDetailView] Failed to re-fetch role after save:", err);
      toast.warning("Role saved but failed to refresh. Please reload.");
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {isEditing ? (
        <RoleEditor
          role={role}
          allRoles={allRoles}
          onSave={handleSaveRole}
          onCancel={handleCancelEdit}
          onSelectRole={onSelectRole}
        />
      ) : (
        <RoleViewer
          role={role}
          allRoles={allRoles}
          onEdit={handleStartEdit}
          onSelectRole={onSelectRole}
        />
      )}
    </div>
  );
};

export default RoleDetailView;