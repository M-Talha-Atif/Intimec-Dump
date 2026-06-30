"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, Zap } from "lucide-react";
import { DynamicAssignmentRule } from "@/types/dynamicRules";
import { UserAssignmentProvider } from "./contexts/UserAssignmentContext";
import { StaticAssignmentTab, DynamicAssignmentTab } from "./components";
import { StaticRevokeTab } from "./components/StaticRevokeTab";
import { DialogDescription } from "@radix-ui/react-dialog";

interface UserAssignmentModalProps {
  roleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignUsers: (roleId: string, userIds: string[]) => void;
  onCreateRule?: (roleId: string, rule: DynamicAssignmentRule) => void;
  onSuccess?: () => void;
}

const UserAssignmentModalContent: React.FC<{
  roleId: string;
  isRevokeMode: boolean;
  onAssignUsers: (roleId: string, userIds: string[]) => void;
  onCreateRule?: (roleId: string, rule: DynamicAssignmentRule) => void;
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ roleId, isRevokeMode, onCreateRule, onClose, onSuccess }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          {/* <Users className="h-5 w-5" /> */}
          {isRevokeMode ? "Revoke Role from Users" : "Assign Users to Role"}
        </DialogTitle>
        <DialogDescription>
          {isRevokeMode
            ? "Revoke a role from selected users"
            : "Assign number of users to a role"}
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="static" className="w-full">
        <TabsList
          className={`grid w-full ${isRevokeMode ? "grid-cols-1" : "grid-cols-2"
            } mb-4`}
        >
          <TabsTrigger value="static" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            {isRevokeMode ? "Static Revocation" : "Static"}
          </TabsTrigger>
          {!isRevokeMode && (
            <TabsTrigger
              value="dynamic"
              className="flex items-center gap-2"
              disabled={isRevokeMode}
            >
              <Zap className="h-4 w-4" />
              Dynamic
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="static" className="mt-0">
          {isRevokeMode ? (
            <StaticRevokeTab roleId={roleId} onCancel={onClose} onSuccess={onSuccess} />
          ) : (
            <StaticAssignmentTab roleId={roleId} onCancel={onClose} onSuccess={onSuccess} />
          )}
        </TabsContent>

        <TabsContent value="dynamic" className="mt-0">
          {onCreateRule && !isRevokeMode && (
            <DynamicAssignmentTab
              roleId={roleId}
              onCreateRule={onCreateRule}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export const UserAssignmentModal: React.FC<UserAssignmentModalProps> = ({
  roleId,
  open,
  onOpenChange,
  onAssignUsers,
  onCreateRule,
  onSuccess,
}) => {
  // Check if it's revoke mode by checking if roleId starts with "revoke-"
  const isRevokeMode = roleId.startsWith("revoke-");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:max-w-5xl flex flex-col p-0 h-full"
      >
        <UserAssignmentProvider>
          <UserAssignmentModalContent
            roleId={roleId}
            isRevokeMode={isRevokeMode}
            onAssignUsers={onAssignUsers}
            onCreateRule={onCreateRule}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        </UserAssignmentProvider>
      </DialogContent>
    </Dialog>
  );
};
