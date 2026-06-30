import React, { useState } from "react";
import { type User } from "@/data/mock-users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  UserX,
  RefreshCw,
  UserCog,
  ShieldAlert,
  History,
  Eye,
  Waypoints,
  Download,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  OverviewTab,
  AccountsTab,
  AccessTab,
  RiskTab,
  ActivityTab,
  PolicyTab,
  AccessExplorerTab,
  AIAnalysisTab,
} from "./detail-tabs/tabs";
import AccessVisibilityAuditDialog from "./AccessVisibilityAuditDialog";
import StatusTransitionDropdown from "./StatusTransitionDropdown";
import { exportData } from "@/lib/exportUtils";

import ResetPasswordModal from "@/components/human-identities/modals/ResetPasswordModal";
import ReassignManagerModal from "@/components/human-identities/modals/ReassignManagerModal";
import TerminateAccessModal from "@/components/human-identities/modals/TerminateAccessModal";
import DelegationModal from "@/components/human-identities/modals/DelegationModal";
import { DelegationConfig, getActiveDelegation } from "@/types/delegation";

type IdentityDetailPanelProps = {
  user: User;
  onClose: () => void;
};

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Inactive: "bg-slate-100 text-slate-800 border-slate-200",
  Suspended: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Pending: "bg-blue-100 text-blue-800 border-blue-200",
  Terminated: "bg-red-100 text-red-800 border-red-200",
  Expired: "bg-orange-100 text-orange-800 border-orange-200",
  Archived: "bg-gray-100 text-gray-500 border-gray-200",
};

const IdentityDetailPanel = ({ user }: IdentityDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [reassignManagerOpen, setReassignManagerOpen] = useState(false);
  const [terminateAccessOpen, setTerminateAccessOpen] = useState(false);
  const [delegationOpen, setDelegationOpen] = useState(false);

  const activeDelegation = getActiveDelegation(user.id);

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

  const hasBadges =
    user?.isPrivileged ||
    user?.isOrphan ||
    user?.riskLevel === "High";


  return (
    <div className="h-full">
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.name}
                </h2>
                <StatusTransitionDropdown
                  currentStatus={user.status}
                  onTransition={async (newStatus) => {
                    console.log("Status transition:", user.status, "→", newStatus);
                    // TODO: Call API to update identity status
                  }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {user.department} • {user.type}
              </p>
              {user.manager && (
                <p className="text-sm text-slate-500">
                  Manager: {user.manager}
                </p>
              )}

              {/* Active Delegation Indicator */}
              {activeDelegation && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Acting On Behalf: {activeDelegation.delegateName}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Delegation active until{" "}
                    {activeDelegation.endDate || "indefinite"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {hasBadges && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {user.isPrivileged && (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-300"
                >
                  <Key className="mr-1.5 h-3 w-3" />
                  Privileged
                </Badge>
              )}

              {user.isOrphan && (
                <Badge variant="outline" className="text-red-600 border-red-300">
                  <UserX className="mr-1.5 h-3 w-3" />
                  Orphan
                </Badge>
              )}
              {user.riskLevel === "High" && (
                <Badge
                  variant="outline"
                  className="px-2 py-0.5 font-normal bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400"
                >
                  High Risk
                </Badge>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => setResetPasswordOpen(true)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setReassignManagerOpen(true)}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Reassign Manager
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDelegationOpen(true)}
            >
              <Clock className="w-4 h-4 mr-2" />
              Delegation
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setTerminateAccessOpen(true)}
            >
              <UserX className="w-4 h-4 mr-2" />
              Terminate Access
            </Button>
          </div>
          <div className="pt-4 border-slate-200 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("activity")}
            >
              <History className="w-4 h-4 mr-2" />
              View Change Log
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAuditModalOpen(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Audit Visibility
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("explorer")}
            >
              <Waypoints className="w-4 h-4 mr-2" />
              Access Explorer
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportData(user, "json")}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData(user, "xml")}>
                  Export as XML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="policy">Policy</TabsTrigger>
              <TabsTrigger
                value="ai-analysis"
                className="flex items-center space-x-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>AI Analysis</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <OverviewTab user={user} />
            </TabsContent>
            <TabsContent value="accounts">
              <AccountsTab user={user} />
            </TabsContent>
            <TabsContent value="access">
              <AccessTab user={user} />
            </TabsContent>
            <TabsContent value="explorer">
              <AccessExplorerTab user={user} />
            </TabsContent>
            <TabsContent value="risk">
              <RiskTab user={user} />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityTab user={user} />
            </TabsContent>
            <TabsContent value="policy">
              <PolicyTab user={user} />
            </TabsContent>
            <TabsContent value="ai-analysis">
              <AIAnalysisTab user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <AccessVisibilityAuditDialog
        user={user}
        isOpen={isAuditModalOpen}
        onOpenChange={setIsAuditModalOpen}
      />
      <ResetPasswordModal
        isOpen={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        userName={user.name}
        onConfirm={handleResetPassword}
      />
      <ReassignManagerModal
        isOpen={reassignManagerOpen}
        onClose={() => setReassignManagerOpen(false)}
        userName={user.name}
        currentManager={user.manager || "N/A"}
        onConfirm={handleReassignManager}
      />
      <TerminateAccessModal
        isOpen={terminateAccessOpen}
        onClose={() => setTerminateAccessOpen(false)}
        userName={user.name}
        onConfirm={handleTerminateAccess}
      />
      <DelegationModal
        isOpen={delegationOpen}
        onClose={() => setDelegationOpen(false)}
        userName={user.name}
        onConfirm={handleDelegation}
      />
    </div>
  );
};

export default IdentityDetailPanel;
