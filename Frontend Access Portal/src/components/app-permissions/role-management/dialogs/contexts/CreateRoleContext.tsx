import React, { createContext, useContext, ReactNode } from "react";
import { CreateRoleData } from "@/types/roleManagement";
import {
  useCreateRoleForm,
  CreateRoleFormState,
  CreateRoleFormActions,
} from "../hooks/useCreateRoleForm";

export interface CreateRoleContextType
  extends CreateRoleFormState,
    CreateRoleFormActions {
  onCreateRole: (data: CreateRoleData) => Promise<boolean>;
  onClose: () => void;
}

const CreateRoleContext = createContext<CreateRoleContextType | undefined>(
  undefined
);

export interface CreateRoleProviderProps {
  children: ReactNode;
  onCreateRole: (data: CreateRoleData) => Promise<boolean>;
  onClose: () => void;
}

export const CreateRoleProvider: React.FC<CreateRoleProviderProps> = ({
  children,
  onCreateRole,
  onClose,
}) => {
  const formState = useCreateRoleForm();

  const contextValue: CreateRoleContextType = {
    ...formState,
    onCreateRole,
    onClose,
  };

  return (
    <CreateRoleContext.Provider value={contextValue}>
      {children}
    </CreateRoleContext.Provider>
  );
};

export const useCreateRoleContext = (): CreateRoleContextType => {
  const context = useContext(CreateRoleContext);
  if (context === undefined) {
    throw new Error(
      "useCreateRoleContext must be used within a CreateRoleProvider"
    );
  }
  return context;
};
