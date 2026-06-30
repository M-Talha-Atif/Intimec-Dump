import { useState, useEffect } from "react";
import { InternalRole, RoleType, RiskLevel } from "@/types/roleManagement";
import {
  toggleScopeInArray,
  toggleTagInArray,
  fetchAllUsers,
} from "../utils/createRoleUtils";
import { ApiUser } from "../../types";

export interface EditRoleFormData {
  name: string;
  type: RoleType;
  description: string;
  businessJustification: string;
  requiresApproval: boolean;
  isActive: boolean;
  riskLevel: RiskLevel;
}

export interface UseEditRoleFormReturn {
  formData: EditRoleFormData;
  selectedScopes: string[];
  selectedTags: string[];
  ownerIds: string[];
  allUsers: ApiUser[]; // All users sorted by backend (owners first)
  isLoadingUsers: boolean;
  usersError: string | null;
  updateFormField: (
    field: keyof EditRoleFormData,
    value: string | boolean
  ) => void;
  toggleScope: (scope: string) => void;
  toggleTag: (tag: string) => void;
  setOwnerIds: (ids: string[]) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  hasViolations: boolean;
  isHighRisk: boolean;
  isFormValid: boolean;
  hasChanges: boolean;
}

export const useEditRoleForm = (
  role: InternalRole,
  onUpdateRole: (roleId: string, updates: Partial<InternalRole>) => Promise<boolean>
): UseEditRoleFormReturn => {
  const [formData, setFormData] = useState<EditRoleFormData>({
    name: role.name,
    type: role.type || "VIEWER",
    description: role.description,
    businessJustification: role.businessJustification || "",
    requiresApproval: role.requiresApproval || false,
    isActive: role.isActive ?? true,
    riskLevel: role.riskLevel || "Medium",
  });

  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    role.scopes || []
  );

  const [selectedTags, setSelectedTags] = useState<string[]>(role.tags || []);
  
  // Initialize ownerIds from role data if available
  const initialOwners = role.ownerIds || (role.ownersData?.map(u => u.id)) || [];
  const [ownerIds, setOwnerIds] = useState<string[]>(initialOwners);
  const [initialOwnerIds, setInitialOwnerIds] = useState<string[]>(initialOwners);
  
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]); // Will be populated from owners endpoint
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true); // Loading from owners endpoint
  const [usersError, setUsersError] = useState<string | null>(null);

  // Fetch role owners and all users from the owners endpoint (already sorted by backend)
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    const fetchRoleOwnersAndUsers = async () => {
      if (!role.id) {
        setIsLoadingUsers(false);
        return;
      }
      
      setIsLoadingUsers(true);
      setUsersError(null);
      
      try {
        const response = await fetch(`/api/roles/${role.id}/owners`, {
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store", // Prevent caching issues
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to fetch role owners: ${response.status}`
          );
        }
        
        const data = await response.json();
        
        // Validate response structure
        if (!data.users || !Array.isArray(data.users)) {
          throw new Error("Invalid response format from owners API");
        }
        
        // Backend sends users already sorted: owners first, then non-owners
        // Store ALL users (preserving backend order)
        const allUsersFromBackend = data.users;
        
        // Extract owner IDs
        const owners = data.users
          .filter((user: ApiUser & { isOwner: boolean }) => user.isOwner)
          .map((user: ApiUser) => user.id);
        
        console.log(`[EditRole] Loaded ${owners.length} owners and ${allUsersFromBackend.length} total users for role ${role.id}`);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setAllUsers(allUsersFromBackend); // Use sorted data from backend
          setOwnerIds(owners);
          setInitialOwnerIds(owners);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch role owners";
        setUsersError(errorMessage);
        console.error("[EditRole] Error loading role owners:", error);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Keep initial owners if fetch fails
          const fallbackOwners = role.ownerIds || (role.ownersData?.map(u => u.id)) || [];
          setOwnerIds(fallbackOwners);
          setInitialOwnerIds(fallbackOwners);
          setAllUsers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    fetchRoleOwnersAndUsers();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [role.id]);

  // Reset form when role changes (owners are handled by the fetch effect)
  useEffect(() => {
    setFormData({
      name: role.name,
      type: role.type || "viewer",
      description: role.description,
      businessJustification: role.businessJustification || "",
      requiresApproval: role.requiresApproval || false,
      isActive: role.isActive ?? true,
      riskLevel: role.riskLevel || "Medium",
    });
    setSelectedScopes(role.scopes || []);
    setSelectedTags(role.tags || []);
  }, [role.id, role.name, role.type, role.description, role.businessJustification, role.requiresApproval, role.riskLevel]);

  const updateFormField = (
    field: keyof EditRoleFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) => toggleScopeInArray(prev, scope));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => toggleTagInArray(prev, tag));
  };

  const handleSubmit = async () => {
    if (isFormValid) {
      const success = await onUpdateRole(role.id, {
        ...formData,
        scopes: selectedScopes,
        tags: selectedTags,
        ownerIds,
      });
      
      // If not successful, keep form data (don't reset)
      // Error will be displayed in the form by parent component
    }
  };

  const handleReset = () => {
    setFormData({
      name: role.name,
      type: role.type || "VIEWER",
      description: role.description,
      businessJustification: role.businessJustification || "",
      requiresApproval: role.requiresApproval || false,
      isActive: role.isActive ?? true,
      riskLevel: role.riskLevel || "Medium",
    });
    setSelectedScopes(role.scopes || []);
    setSelectedTags(role.tags || []);
    setOwnerIds(initialOwnerIds);
  };

  // Computed values
  const hasViolations = role.violations && role.violations.length > 0;
  const isHighRisk = role.riskLevel === "High";
  const MAX_ROLE_NAME_LENGTH = 128;
  const isFormValid = !!(
    formData.name && 
    formData.name.length <= MAX_ROLE_NAME_LENGTH && 
    formData.description
  );

  // Check if form has changes
  const hasChanges =
    formData.name !== role.name ||
    formData.description !== role.description ||
    formData.businessJustification !== (role.businessJustification || "") ||
    formData.requiresApproval !== (role.requiresApproval || false) ||
    formData.isActive !== (role.isActive ?? true) ||
    formData.riskLevel !== (role.riskLevel || "Medium") ||
    formData.type !== (role.type || "VIEWER") ||
    JSON.stringify(selectedScopes.sort()) !==
      JSON.stringify((role.scopes || []).sort()) ||
    JSON.stringify(selectedTags.sort()) !==
      JSON.stringify((role.tags || []).sort()) ||
    JSON.stringify(ownerIds.sort()) !== JSON.stringify(initialOwnerIds.sort());

  return {
    formData,
    selectedScopes,
    selectedTags,
    ownerIds,
    allUsers,
    isLoadingUsers,
    usersError,
    updateFormField,
    toggleScope,
    toggleTag,
    setOwnerIds,
    handleSubmit,
    resetForm: handleReset,
    hasViolations,
    isHighRisk,
    isFormValid,
    hasChanges,
  };
};
