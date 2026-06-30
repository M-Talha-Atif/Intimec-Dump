import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import {
  InternalRole,
  RoleFilters,
  RoleSortConfig,
  RoleStats,
  BulkRoleOperation,
  CreateRoleData,
} from "@/types/roleManagement";

import {
  transformToCreateRoleRequest,
  transformToUpdateRoleRequest,
} from "../dialogs/utils/createRoleUtils";
import {
  calculateActiveFilterCount,
  createEmptyFilters,
  generateExportFilename,
  downloadBlobAsFile,
  formatBulkOperationMessage,
  formatUserAssignmentMessage,
  formatRoleCloneMessage,
  formatRoleCreationMessage,
  fetchRolesFromAPI,
  createRoleAPI,
  deleteRoleAPI,
  bulkDeleteRolesAPI,
  copyRoleAPI,
  updateRoleAPI,
  createDynamicRuleAPI,
  transformApiRoleToInternalRole,
} from "../utils/roleUtils";
import { CreateDynamicRuleRequest, CreateDynamicRuleResponse } from "../types";

export interface RoleManagementState {
  // Data state
  roles: InternalRole[];
  loading: boolean;
  error: string | null;
  selectedRoles: string[];
  stats: RoleStats | null;
  pagination: {
    page: number;
    limit: number;
    inactive: number;
  };

  // Loading states for operations
  createRoleError: string | null;
  editRoleError: string | null;
  deletingRoleId: string | null; // ID of role being deleted

  // Filter and search state
  filters: RoleFilters;
  sortConfig: RoleSortConfig;

  // Dialog states
  showFilters: boolean;
  showCreateWizard: boolean;
  editingRole: InternalRole | null;
  assigningUsersToRole: string | null;
  showBulkImportDialog: boolean;
  showTemplates: boolean;
  showBulkDeleteConfirm: boolean;
  bulkDeleteRoleNames: string;

  // View mode
  viewMode: "card" | "table";

  // Computed values
  activeFilterCount: number;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface RoleManagementActions {
  // Data loading
  loadRoles: () => Promise<void>;

  // Role operations
  handleCreateRole: (roleData: CreateRoleData) => Promise<boolean>;
  handleEditRole: (
    roleId: string,
    updates: Partial<InternalRole>
  ) => Promise<boolean>;
  handleDeleteRole: (roleId: string, workflowId?: string) => Promise<void>;
  handleCopyRole: (roleId: string) => Promise<void>;
  handleArchiveRole: (roleId: string, reason?: string) => Promise<void>;
  handleCloneRole: (roleId: string, newName: string) => Promise<void>;
  handleAssignUsers: (roleId: string, userIds: string[]) => Promise<void>;
  handleCreateRule: (
    roleId: string,
    rule: CreateDynamicRuleRequest
  ) => Promise<CreateDynamicRuleResponse>;

  // Bulk operations
  handleBulkOperation: (
    operation: BulkRoleOperation["operation"]
  ) => Promise<void>;
  executeBulkDelete: () => Promise<void>;
  handleExportSelected: () => Promise<void>;

  // Search and filter handlers
  handleSearchChange: (search: string) => void;
  handleFilterChange: (newFilters: Partial<RoleFilters>) => void;
  clearFilters: () => void;

  // State setters
  setSelectedRoles: (roles: string[]) => void;
  setSortConfig: (config: RoleSortConfig) => void;
  setPagination: (pagination: {
    page: number;
    limit: number;
    inactive: number;
  }) => void;
  setShowFilters: (show: boolean) => void;
  setShowCreateWizard: (show: boolean) => void;
  setEditingRole: (role: InternalRole | null) => void;
  setAssigningUsersToRole: (roleId: string | null) => void;
  setShowBulkImportDialog: (show: boolean) => void;
  setShowTemplates: (show: boolean) => void;
  setShowBulkDeleteConfirm: (show: boolean) => void;
  setViewMode: (mode: "card" | "table") => void;

  // Pagination setters
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Error clearing
  clearCreateRoleError: () => void;
  clearEditRoleError: () => void;
}

export const useRoleManagement = (): RoleManagementState &
  RoleManagementActions => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter and search state
  const [filters, setFilters] = useState<RoleFilters>(createEmptyFilters());

  // Build query parameters from filters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append("page", String(currentPage - 1));
    params.append("size", String(pageSize));
    
    if (filters.search) {
      params.append("search", filters.search);
    }
    if (filters.types.length > 0) {
      params.append("roleType", filters.types.join(","));
    }
    // Only filter by status if exactly one status is selected
    if (filters.statuses.length === 1) {
      const isActive = filters.statuses.includes("active");
      params.append("isActive", String(isActive));
    }
    // If both or none are selected, don't filter by status (show all)
    if (filters.riskLevels.length > 0) {
      params.append("riskLevel", filters.riskLevels.join(","));
    }
    if (filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append("tags", tag));
    }
    
    return params.toString();
  }, [currentPage, pageSize, filters]);

  // SWR for data fetching with pagination and filters
  const {
    data: apiResponse,
    error,
    isLoading: loading,
    mutate: mutateRoles,
  } = useSWR<{ 
    data: InternalRole[]; 
    totalPages: number; 
    totalElements: number; 
    currentPage: number; 
    pageSize: number;
    stats?: {
      inactive: number;
      active: number;
      highRisk: number;
    };
  }>(
    `/api/roles?${buildQueryParams()}`,
    async (url) => {
      console.log('Fetching roles with URL:', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch roles");
      const result = await response.json();
      console.log('API Response:', result);
      return {
        data: result.data.map(transformApiRoleToInternalRole),
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        stats: result.stats,
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onError: (error) => {
        toast.error(error.message || "Failed to load roles");
      },
    }
  );

  const roles = apiResponse?.data || [];
  
  // Get stats from API response (reflects filtered results across all pages)
  const stats: RoleStats | null = apiResponse?.stats ? {
    inactive: apiResponse.stats.inactive,
    active: apiResponse.stats.active,
    archived: 0,
    highRisk: apiResponse.stats.highRisk,
    withViolations: 0,
    recentlyModified: 0,
  } : null;

  // Update pagination metadata when data changes
  useEffect(() => {
    if (apiResponse) {
      setTotalPages(apiResponse.totalPages);
      setTotalElements(apiResponse.totalElements);
    }
  }, [apiResponse]);

  // Other state management
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [createRoleError, setCreateRoleError] = useState<string | null>(null);
  const [editRoleError, setEditRoleError] = useState<string | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    inactive: 0,
  });

  const [sortConfig, setSortConfig] = useState<RoleSortConfig>({
    field: "lastModified",
    direction: "desc",
  });

  // Dialog states
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [editingRole, setEditingRole] = useState<InternalRole | null>(null);
  const [assigningUsersToRole, setAssigningUsersToRole] = useState<
    string | null
  >(null);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleteRoleNames, setBulkDeleteRoleNames] = useState("");

  // View mode state
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Update pagination total when roles change
  const loadRoles = useCallback(async () => {
    await mutateRoles();
    setPagination((prev) => ({ ...prev, total: roles.length }));
  }, [mutateRoles, roles.length]);

  // Handle role operations
  const handleCreateRole = async (roleData: CreateRoleData): Promise<boolean> => {
    setCreateRoleError(null);

    try {
      // Transform the form data to the API request format
      const createRoleRequest = transformToCreateRoleRequest(roleData);

      // Call the API to create the role
      const result = await createRoleAPI(createRoleRequest);

      // Check if operation was denied (403 returns null)
      if (result === null) {
        return false;
      }

      // Refresh the roles list and stats from server
      await mutateRoles();

      // Close the wizard and show success message from backend
      setShowCreateWizard(false);
      toast.success(result.message);
      
      return true; // Success
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create role";
      setCreateRoleError(errorMessage);
      // Don't show toast for validation errors - they're displayed in the form
      // Only show toast for unexpected errors
      if (!errorMessage.includes("already exists")) {
        toast.error(errorMessage);
      }
      return false; // Failure
    }
  };

  const handleEditRole = async (
    roleId: string,
    updates: Partial<InternalRole>
  ): Promise<boolean> => {
    setEditRoleError(null);

    try {
      // Find the current role to get the existing type if not being updated
      const currentRole = roles.find((role) => role.id === roleId);

      // Transform the updates to the API request format
      const updateRoleRequest = transformToUpdateRoleRequest(
        updates,
        currentRole
      );

      // Call the API to update the role
      const result = await updateRoleAPI(roleId, updateRoleRequest);

      // Check if operation was denied (403 returns null)
      if (result === null) {
        return false;
      }

      // Refresh the roles list and stats from server to get updated data
      await mutateRoles();

      // Close the edit dialog and show success message
      setEditingRole(null);
      toast.success("Role updated successfully");
      
      return true; // Success
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update role";

      // Revalidate data on error to ensure consistency
      await mutateRoles();

      setEditRoleError(errorMessage);
      // Don't show toast for validation errors - they're displayed in the form
      // Only show toast for unexpected errors
      if (!errorMessage.includes("already exists")) {
        toast.error(errorMessage);
      }
      
      return false; // Failure
    }
  };

  const handleDeleteRole = async (roleId: string, workflowId?: string) => {
    // Set deleting state
    setDeletingRoleId(roleId);

    try {
      // Call the API to delete the role
      const result = await deleteRoleAPI(roleId, workflowId);

      // Check if operation was denied (403 returns null)
      if (result === null) {
        return;
      }

      // Refresh the roles list and stats from server to get updated data
      await mutateRoles();

      // Show different message based on whether role was deleted or submitted for approval
      if (result.deleted) {
        toast.success("Role deleted successfully");
      } else {
        toast.success(
          "Role deletion submitted for approval. Owner(s) will receive an approval request.",
          { duration: 5000 }
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete role";

      // Revalidate data on error to ensure consistency
      await mutateRoles();

      toast.error(errorMessage);
    } finally {
      // Clear deleting state
      setDeletingRoleId(null);
    }
  };

  const handleArchiveRole = async (roleId: string, reason?: string) => {
    try {
      // TODO: Implement API call for archiving role
      console.log("Archiving role:", roleId, reason);
      await loadRoles();
      toast.success("Role archived successfully");
    } catch {
      toast.error("Failed to archive role");
    }
  };

  const handleCloneRole = async (roleId: string, newName: string) => {
    try {
      // TODO: Implement API call for cloning role
      console.log("Cloning role:", roleId, newName);
      await loadRoles();
      toast.success(formatRoleCloneMessage(newName));
    } catch {
      toast.error("Failed to clone role");
    }
  };

  const handleCopyRole = async (roleId: string) => {
    try {
      // Call the API to copy the role
      const copiedApiRole = await copyRoleAPI(roleId);

      // Check if operation was denied (403 returns null)
      if (copiedApiRole === null) {
        return;
      }

      // Transform API role to internal role
      const copiedRole = transformApiRoleToInternalRole(copiedApiRole);

      // Optimistically update the cache by adding the copied role
      await mutateRoles(
        (currentData) => currentData ? {
          ...currentData,
          data: [...currentData.data, copiedRole],
          totalElements: currentData.totalElements + 1
        } : undefined,
        true // Revalidate to ensure consistency
      );

      toast.success(`Role "${copiedRole.name}" copied successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to copy role";

      // Revalidate data on error to ensure consistency
      await mutateRoles();

      toast.error(errorMessage);
    }
  };

  const handleAssignUsers = async (roleId: string, userIds: string[]) => {
    try {
      // TODO: Implement API call for assigning users
      console.log("Assigning users to role:", roleId, userIds);
      
      // Refresh roles to update badges instantly
      await mutateRoles();
      
      setAssigningUsersToRole(null);
      toast.success(formatUserAssignmentMessage(userIds.length));
    } catch {
      toast.error("Failed to assign users");
    }
  };

  const handleCreateRule = async (
    roleId: string,
    rule: CreateDynamicRuleRequest
  ): Promise<CreateDynamicRuleResponse | null> => {
    try {
      // Call API to create dynamic rule
      console.log("Creating rule for role:", roleId, rule);

      const response = await createDynamicRuleAPI(rule);
      
      // Check if operation was denied (403 returns null)
      if (response === null) {
        return null;
      }
      
      // Refresh roles to update badges instantly
      await mutateRoles();
      
      setAssigningUsersToRole(null);
      toast.success("Rule added successfully");
      return response;
    } catch (error) {
      toast.error("Failed to create assignment rule");
      throw error;
    }
  };

  // Bulk operations
  const handleBulkOperation = async (
    operation: BulkRoleOperation["operation"]
  ) => {
    if (selectedRoles.length === 0) {
      toast.error("Please select roles first");
      return;
    }

    if (operation === "delete") {
      // Get the role names for the confirmation dialog
      const selectedRoleData = roles.filter((role) =>
        selectedRoles.includes(role.id)
      );
      const roleNames = selectedRoleData.map((role) => role.name).join(", ");
      
      // Set role names and show confirmation dialog
      setBulkDeleteRoleNames(roleNames);
      setShowBulkDeleteConfirm(true);
    } else {
      // Other operations (archive, activate, etc.) - not yet implemented
      console.log("Bulk operation:", operation, selectedRoles);
      toast.success(
        formatBulkOperationMessage(operation, selectedRoles.length)
      );
      setSelectedRoles([]);
    }
  };

  // Actual bulk delete execution (called from confirmation dialog)
  const executeBulkDelete = async () => {
    try {
      // Call bulk delete API
      const result = await bulkDeleteRolesAPI(selectedRoles);
      
      // Check if operation was denied (403 returns null)
      if (result === null) {
        setShowBulkDeleteConfirm(false);
        return;
      }
      
      // Show results
      if (result.failedCount === 0) {
        toast.success(
          `Successfully deleted ${result.successCount} role${result.successCount !== 1 ? "s" : ""}`
        );
      } else if (result.successCount === 0) {
        toast.error(
          `Failed to delete all ${result.failedCount} role${result.failedCount !== 1 ? "s" : ""}`
        );
      } else {
        toast.warning(
          `Deleted ${result.successCount} role${result.successCount !== 1 ? "s" : ""}, ` +
          `but ${result.failedCount} failed`
        );
      }
      
      // Reload roles and clear selection
      await loadRoles();
      setSelectedRoles([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error(
        `Failed to delete roles: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleExportSelected = async () => {
    if (selectedRoles.length === 0) return;

    try {
      // TODO: Implement API call for exporting roles
      const selectedRoleData = roles.filter((role) =>
        selectedRoles.includes(role.id)
      );
      const exportData = JSON.stringify(selectedRoleData, null, 2);

      const blob = new Blob([exportData], {
        type: "application/json",
      });
      downloadBlobAsFile(blob, generateExportFilename());

      toast.success("Roles exported successfully");
    } catch {
      toast.error("Failed to export roles");
    }
  };

  // Search and filter handlers
  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleFilterChange = (newFilters: Partial<RoleFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to page 1 when filtering
  };

  const clearFilters = () => {
    setFilters(createEmptyFilters());
  };

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(filters),
    [filters]
  );

  // Handler to change page size and reset to page 1
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  return {
    // State
    roles,
    loading,
    error: error?.message || null,
    selectedRoles,
    stats,
    pagination,
    createRoleError,
    editRoleError,
    deletingRoleId,
    filters,
    sortConfig,
    showFilters,
    showCreateWizard,
    editingRole,
    assigningUsersToRole,
    showBulkImportDialog,
    showTemplates,
    showBulkDeleteConfirm,
    bulkDeleteRoleNames,
    viewMode,
    activeFilterCount,
    currentPage,
    pageSize,
    totalPages,
    totalElements,

    // Actions
    loadRoles,
    handleCreateRole,
    handleEditRole,
    handleDeleteRole,
    handleCopyRole,
    handleArchiveRole,
    handleCloneRole,
    handleAssignUsers,
    handleCreateRule,
    handleBulkOperation,
    executeBulkDelete,
    handleExportSelected,
    handleSearchChange,
    handleFilterChange,
    clearFilters,
    setSelectedRoles,
    setSortConfig,
    setPagination,
    setShowFilters,
    setShowCreateWizard,
    setEditingRole,
    setAssigningUsersToRole,
    setShowBulkImportDialog,
    setShowTemplates,
    setShowBulkDeleteConfirm,
    setViewMode,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    clearCreateRoleError: () => setCreateRoleError(null),
    clearEditRoleError: () => setEditRoleError(null),
  };
};
