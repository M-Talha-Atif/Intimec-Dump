import { useState } from "react";
import { type User } from "@/data/mock-users";
import { DelegationConfig } from "@/types/delegation";

export function useIdentityDetailPanel(user: User) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [reassignManagerOpen, setReassignManagerOpen] = useState(false);
  const [terminateAccessOpen, setTerminateAccessOpen] = useState(false);
  const [delegationOpen, setDelegationOpen] = useState(false);

  const handleResetPassword = async (password: string, reason?: string) => {
    console.log("Resetting password for:", user.name, { reason });
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleReassignManager = async (newManagerId: string) => {
    console.log("Reassigning manager for:", user.name, { newManagerId });
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleTerminateAccess = async (
    reason: string,
    transferData: boolean
  ) => {
    console.log("Terminating access for:", user.name, { reason, transferData });
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleDelegation = async (config: DelegationConfig) => {
    console.log("Creating delegation for:", user.name, config);
    // Mock API call - in real app, would create delegation record
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleQuickNavigation = (tab: string) => {
    setActiveTab(tab);
  };

  return {
    // State
    activeTab,
    isAuditModalOpen,
    resetPasswordOpen,
    reassignManagerOpen,
    terminateAccessOpen,
    delegationOpen,

    // Actions
    setActiveTab,
    setIsAuditModalOpen,
    setResetPasswordOpen,
    setReassignManagerOpen,
    setTerminateAccessOpen,
    setDelegationOpen,

    // Handlers
    handleResetPassword,
    handleReassignManager,
    handleTerminateAccess,
    handleDelegation,
    handleQuickNavigation,
  };
}
