import React from "react";
import { type User } from "@/data/mock-users";
import { IdentityPanelProvider } from "./context/IdentityPanelContext";
import {
  PanelHeader,
  ActionButtons,
  PanelTabsContent,
  ModalsContainer,
} from "./components";

type IdentityDetailPanelProps = {
  user: User;
  onClose: () => void;
};

export function IdentityDetailPanel({
  user,
  onClose,
}: IdentityDetailPanelProps) {
  return (
    <IdentityPanelProvider user={user}>
      <div className="h-full bg-background border-l">
        <div className="flex flex-col h-full">
          <PanelHeader user={user} onClose={onClose} />
          <ActionButtons user={user} />
          <PanelTabsContent user={user} />
        </div>
        <ModalsContainer user={user} />
      </div>
    </IdentityPanelProvider>
  );
}
