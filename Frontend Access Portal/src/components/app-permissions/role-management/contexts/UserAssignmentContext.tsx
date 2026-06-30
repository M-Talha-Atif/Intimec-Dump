import React, { createContext, useContext, ReactNode } from "react";
import {
  useUserAssignment,
  UseUserAssignmentReturn,
} from "../hooks/useUserAssignment";

export type UserAssignmentContextType = UseUserAssignmentReturn;

const UserAssignmentContext = createContext<
  UserAssignmentContextType | undefined
>(undefined);

export interface UserAssignmentProviderProps {
  children: ReactNode;
}

export const UserAssignmentProvider: React.FC<UserAssignmentProviderProps> = ({
  children,
}) => {
  const userAssignment = useUserAssignment();

  return (
    <UserAssignmentContext.Provider value={userAssignment}>
      {children}
    </UserAssignmentContext.Provider>
  );
};

export const useUserAssignmentContext = (): UserAssignmentContextType => {
  const context = useContext(UserAssignmentContext);
  if (context === undefined) {
    throw new Error(
      "useUserAssignmentContext must be used within a UserAssignmentProvider"
    );
  }
  return context;
};
