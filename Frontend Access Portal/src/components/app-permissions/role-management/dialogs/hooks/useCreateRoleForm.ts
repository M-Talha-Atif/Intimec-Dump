import { useState, useEffect } from "react";
import { CreateRoleData } from "@/types/roleManagement";
import {
  toggleScopeInArray,
  toggleTagInArray,
  validateCreateRoleForm,
  resetCreateRoleForm,
  prepareFormDataForSubmission,
  fetchAllUsers,
} from "../utils/createRoleUtils";
import { defaultCreateRoleFormData } from "../data/createRoleData";
import { ApiUser } from "../../types";

export interface CreateRoleFormState {
  formData: Partial<CreateRoleData>;
  selectedScopes: string[];
  selectedTags: string[];
  ownerIds: string[];
  allUsers: ApiUser[];
  isLoadingUsers: boolean;
  usersError: string | null;
}

export interface CreateRoleFormActions {
  updateFormData: (updates: Partial<CreateRoleFormState["formData"]>) => void;
  toggleScope: (scope: string) => void;
  toggleTag: (tag: string) => void;
  setOwnerIds: (ownerIds: string[]) => void;
  handleSubmit: (onCreateRole: (data: CreateRoleData) => Promise<boolean>) => Promise<void>;
  resetForm: () => void;
  isFormValid: boolean;
}

export const useCreateRoleForm = (): CreateRoleFormState &
  CreateRoleFormActions => {
  const [formData, setFormData] = useState<Partial<CreateRoleData>>(
    defaultCreateRoleFormData
  );
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ownerIds, setOwnerIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Fetch all users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const response = await fetchAllUsers();
        setAllUsers(response.users);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch users";
        setUsersError(errorMessage);
        console.error("Error loading users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const updateFormData = (updates: Partial<CreateRoleData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) => toggleScopeInArray(prev, scope));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => toggleTagInArray(prev, tag));
  };

  const handleSubmit = async (onCreateRole: (data: CreateRoleData) => Promise<boolean>) => {
    console.log('[useCreateRoleForm] handleSubmit called');
    console.log('[useCreateRoleForm] formData:', formData);
    console.log('[useCreateRoleForm] ownerIds:', ownerIds);
    
    if (validateCreateRoleForm(formData, false, ownerIds)) {
      console.log('[useCreateRoleForm] Validation passed, preparing submission data');
      const submissionData = prepareFormDataForSubmission(
        formData,
        selectedScopes,
        selectedTags,
        ownerIds
      );
      console.log('[useCreateRoleForm] Submission data:', submissionData);
      
      const success = await onCreateRole(submissionData);
      console.log('[useCreateRoleForm] onCreateRole returned:', success);
      
      if (success) {
        // Only reset on success
        resetForm();
      }
      // If not success, keep form data and let error display
    } else {
      console.log('[useCreateRoleForm] Validation failed');
      console.log('[useCreateRoleForm] - formData.name:', formData.name);
      console.log('[useCreateRoleForm] - formData.type:', formData.type);
      console.log('[useCreateRoleForm] - formData.riskLevel:', formData.riskLevel);
      console.log('[useCreateRoleForm] - formData.description:', formData.description);
      console.log('[useCreateRoleForm] - formData.requireOwnerApproval:', formData.requireOwnerApproval);
      console.log('[useCreateRoleForm] - formData.workflowId:', formData.workflowId);
      console.log('[useCreateRoleForm] - ownerIds:', ownerIds);
    }
  };

  const resetForm = () => {
    const resetData = resetCreateRoleForm();
    setFormData(resetData.formData);
    setSelectedScopes(resetData.selectedScopes);
    setSelectedTags(resetData.selectedTags);
    setOwnerIds([]);
  };

  const isFormValid = validateCreateRoleForm(formData, false, ownerIds);

  return {
    // State
    formData,
    selectedScopes,
    selectedTags,
    ownerIds,
    allUsers,
    isLoadingUsers,
    usersError,

    // Actions
    updateFormData,
    toggleScope,
    toggleTag,
    setOwnerIds,
    handleSubmit,
    resetForm,
    isFormValid,
  };
};
