import React from "react";
import { type User } from "@/data/mock-users";
import AccessVisibilityAuditDialog from "../../AccessVisibilityAuditDialog";
import ResetPasswordModal from "@/components/human-identities/modals/ResetPasswordModal";
import ReassignManagerModal from "@/components/human-identities/modals/ReassignManagerModal";
import TerminateAccessModal from "@/components/human-identities/modals/TerminateAccessModal";
import DelegationModal from "@/components/human-identities/modals/DelegationModal";

interface ModalsContainerProps {
  user: User;
}

export function ModalsContainer({ user }: ModalsContainerProps) {
  return (
    <>
      <AccessVisibilityAuditDialog user={user} />
      <ResetPasswordModal userName={user.name} />
      <ReassignManagerModal
        userName={user.name}
        currentManager={user.manager || "N/A"}
      />
      <TerminateAccessModal userName={user.name} />
      <DelegationModal userName={user.name} />
    </>
  );
}
