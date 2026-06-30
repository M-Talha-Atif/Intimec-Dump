import React, { createContext, useContext, ReactNode } from "react";
import { type User } from "@/data/mock-users";
import { useIdentityDetailPanel } from "../hooks/useIdentityDetailPanel";

type IdentityPanelContextType = ReturnType<typeof useIdentityDetailPanel>;

const IdentityPanelContext = createContext<
  IdentityPanelContextType | undefined
>(undefined);

interface IdentityPanelProviderProps {
  user: User;
  children: ReactNode;
}

export function IdentityPanelProvider({
  user,
  children,
}: IdentityPanelProviderProps) {
  const panelState = useIdentityDetailPanel(user);

  return (
    <IdentityPanelContext.Provider value={panelState}>
      {children}
    </IdentityPanelContext.Provider>
  );
}

export function useIdentityPanelContext() {
  const context = useContext(IdentityPanelContext);
  if (!context) {
    throw new Error(
      "useIdentityPanelContext must be used within IdentityPanelProvider"
    );
  }
  return context;
}
