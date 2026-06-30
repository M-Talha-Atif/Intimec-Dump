import React, { createContext, useContext, ReactNode } from "react";
import {
  useRoleManagement,
  RoleManagementState,
  RoleManagementActions,
} from "../hooks/useRoleManagement";

export interface RoleManagementContextType
  extends RoleManagementState,
    RoleManagementActions {}

const RoleManagementContext = createContext<
  RoleManagementContextType | undefined
>(undefined);

export interface RoleManagementProviderProps {
  children: ReactNode;
}

export const RoleManagementProvider: React.FC<RoleManagementProviderProps> = ({
  children,
}) => {
  const roleManagement = useRoleManagement();

  return (
    <RoleManagementContext.Provider value={roleManagement}>
      {children}
    </RoleManagementContext.Provider>
  );
};

export const useRoleManagementContext = (): RoleManagementContextType => {
  const context = useContext(RoleManagementContext);
  if (context === undefined) {
    throw new Error(
      "useRoleManagementContext must be used within a RoleManagementProvider"
    );
  }
  return context;
};
