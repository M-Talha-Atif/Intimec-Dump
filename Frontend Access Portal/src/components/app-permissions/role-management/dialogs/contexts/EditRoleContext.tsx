import React, { createContext, useContext } from "react";
import { InternalRole } from "@/types/roleManagement";
import {
  useEditRoleForm,
  UseEditRoleFormReturn,
} from "../hooks/useEditRoleForm";

interface EditRoleContextType extends UseEditRoleFormReturn {
  role: InternalRole;
  onClose: () => void;
}

const EditRoleContext = createContext<EditRoleContextType | null>(null);

interface EditRoleProviderProps {
  children: React.ReactNode;
  role: InternalRole;
  onUpdateRole: (roleId: string, updates: Partial<InternalRole>) => Promise<boolean>;
  onClose: () => void;
}

export const EditRoleProvider: React.FC<EditRoleProviderProps> = ({
  children,
  role,
  onUpdateRole,
  onClose,
}) => {
  const editRoleForm = useEditRoleForm(role, onUpdateRole);

  const contextValue: EditRoleContextType = {
    ...editRoleForm,
    role,
    onClose,
  };

  return (
    <EditRoleContext.Provider value={contextValue}>
      {children}
    </EditRoleContext.Provider>
  );
};

export const useEditRoleContext = (): EditRoleContextType => {
  const context = useContext(EditRoleContext);
  if (!context) {
    throw new Error(
      "useEditRoleContext must be used within an EditRoleProvider"
    );
  }
  return context;
};
