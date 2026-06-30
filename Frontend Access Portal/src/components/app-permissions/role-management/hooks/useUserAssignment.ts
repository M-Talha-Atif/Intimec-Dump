import { useState, useMemo } from "react";
import useSWR from "swr";
import { User, mockUsers } from "../data/mockUsers";
import {
  filterUsers,
  getDepartments,
  fetchUsersForRole,
  convertApiUsersToUsers,
  assignUsersToRole,
  revokeUsersFromRole,
  AssignRoleRequest,
  AssignRoleResponse,
  RevokeRoleResponse,
} from "../utils/userAssignmentUtils";
import { ApiUser, UsersApiResponse } from "../types";

export interface UseUserAssignmentState {
  selectedUsers: string[];
  searchTerm: string;
  departmentFilter: string;
  statusFilter: string;
  activeTab: "static" | "dynamic";
  currentPage: number;
  pageSize: number;
}

export interface UseUserAssignmentActions {
  setSelectedUsers: (users: string[]) => void;
  setSearchTerm: (term: string) => void;
  setDepartmentFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setActiveTab: (tab: "static" | "dynamic") => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  handleUserToggle: (userId: string, checked: boolean) => void;
  handleSelectAll: () => void;
  resetFilters: () => void;
  fetchUsersForRole: (roleId: string) => void;
  assignRole: (request: AssignRoleRequest) => Promise<AssignRoleResponse>;
  revokeRole: (request: AssignRoleRequest) => Promise<RevokeRoleResponse>;
  getSelectedAndExistingUserIds: () => {
    selectedUserIds: string[];
    existingUserIds: string[];
  };
}

export interface UseUserAssignmentReturn
  extends UseUserAssignmentState,
    UseUserAssignmentActions {
  filteredUsers: User[];
  departments: string[];
  // API data
  apiUsers: ApiUser[];
  usersData: UsersApiResponse | undefined;
  isLoadingUsers: boolean;
  usersError: Error | undefined;
  mutateUsers: () => void;
}

export const useUserAssignment = (): UseUserAssignmentReturn => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"static" | "dynamic">("static");
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Determine if we're in revoke mode (manual-only assignments)
  const isRevokeMode = currentRoleId?.startsWith("revoke-") ?? false;
  const actualRoleId = isRevokeMode && currentRoleId ? currentRoleId.replace("revoke-", "") : currentRoleId;

  // Debug logging
  console.log('[useUserAssignment] currentRoleId:', currentRoleId);
  console.log('[useUserAssignment] isRevokeMode:', isRevokeMode);
  console.log('[useUserAssignment] actualRoleId:', actualRoleId);

  // SWR for fetching users from API with pagination and filters
  const swrKey = currentRoleId 
    ? `/api/roles/${actualRoleId}/${isRevokeMode ? 'manual-users' : 'users'}?page=${currentPage - 1}&size=${pageSize}&status=${statusFilter}&search=${searchTerm}`
    : null;

  console.log('[useUserAssignment] swrKey:', swrKey);

  const {
    data: usersData,
    error: usersError,
    isLoading: isLoadingUsers,
    mutate: mutateUsers,
  } = useSWR(
    swrKey,
    currentRoleId 
      ? () => fetchUsersForRole(actualRoleId as string, currentPage - 1, pageSize, statusFilter, searchTerm, isRevokeMode)
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      keepPreviousData: true,
    }
  );

  const apiUsers = useMemo(() => usersData?.users || [], [usersData?.users]);

  // Convert API users to User format for compatibility with existing components
  const convertedApiUsers = useMemo(
    () => convertApiUsersToUsers(apiUsers),
    [apiUsers]
  );

  // When using API with pagination, use the API users directly (already filtered by server)
  // Otherwise fallback to mock users with client-side filtering
  const filteredUsers = useMemo(() => {
    if (currentRoleId && !isLoadingUsers) {
      // Use server-filtered and paginated results directly
      return convertedApiUsers;
    }
    // Fallback to client-side filtering for mock users
    return filterUsers(mockUsers, searchTerm, departmentFilter, statusFilter);
  }, [currentRoleId, isLoadingUsers, convertedApiUsers, searchTerm, departmentFilter, statusFilter]);

  const departments = useMemo(() => getDepartments(filteredUsers), [filteredUsers]);

  const fetchUsersForRoleHandler = (roleId: string) => {
    console.log('[fetchUsersForRoleHandler] Setting roleId:', roleId);
    setCurrentRoleId(roleId);
    // Force SWR to refetch when roleId changes
    mutateUsers();
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const resetFilters = () => {
    setSelectedUsers([]);
    setSearchTerm("");
    setDepartmentFilter("all");
    setStatusFilter("ALL");
    setCurrentPage(1);
    setPageSize(10);
  };

  const assignRole = async (
    request: AssignRoleRequest
  ): Promise<AssignRoleResponse> => {
    try {
      const response = await assignUsersToRole(request);
      // Refresh the users list after successful assignment
      if (currentRoleId) {
        await mutateUsers();
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const revokeRole = async (
    request: AssignRoleRequest
  ): Promise<RevokeRoleResponse> => {
    try {
      const response = await revokeUsersFromRole(request);
      // Refresh the users list after successful revocation
      if (currentRoleId) {
        await mutateUsers();
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getSelectedAndExistingUserIds = () => {
    const existingUserIds = apiUsers
      .filter((user) => user.hasRole)
      .map((user) => user.id);

    return {
      selectedUserIds: selectedUsers,
      existingUserIds,
    };
  };

  return {
    // State
    selectedUsers,
    searchTerm,
    departmentFilter,
    statusFilter,
    activeTab,
    currentPage,
    pageSize,
    filteredUsers,
    departments,

    // API data
    apiUsers,
    usersData,
    isLoadingUsers,
    usersError,
    mutateUsers,

    // Actions
    setSelectedUsers,
    setSearchTerm,
    setDepartmentFilter,
    setStatusFilter,
    setActiveTab,
    setCurrentPage,
    setPageSize,
    handleUserToggle,
    handleSelectAll,
    resetFilters,
    fetchUsersForRole: fetchUsersForRoleHandler,
    assignRole,
    revokeRole,
    getSelectedAndExistingUserIds,
  };
};
