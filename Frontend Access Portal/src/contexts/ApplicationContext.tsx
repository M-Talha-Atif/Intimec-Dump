"use client";
import { useState, createContext, useContext } from "react";
import { Application } from "@/types/application";

type ModalState =
  | { type: "auditLog"; application: Application }
  | { type: "export-application"; application: Application }
  | { type: "import-application"; application?: Application }
  | null;

interface ApplicationContextType {
  modalState: ModalState;

  // Modal controls
  showApplicationAuditLog: (application: Application) => void;
  showApplicationExport: (application: Application) => void;
  showApplicationImport: () => void;
  closeApplicationDialog: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(
  undefined,
);

interface ApplicationContextProviderProps {
  children: React.ReactNode;
}

export default function ApplicationContextProvider({
  children,
}: ApplicationContextProviderProps) {
  const [modalState, setModalState] = useState<ModalState>(null);

  function showApplicationAuditLog(application: Application) {
    setModalState({ type: "auditLog", application });
  }

  function closeApplicationDialog() {
    setModalState(null);
  }

  function showApplicationExport(application: Application) {
    setModalState({ type: "export-application", application });
  }

  function showApplicationImport() {
    setModalState({ type: "import-application" });
  }

  return (
    <ApplicationContext.Provider
      value={{
        modalState,
        closeApplicationDialog,
        showApplicationAuditLog,
        showApplicationExport,
        showApplicationImport,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error(
      "useApplicationContext must be used within an ApplicationContextProvider",
    );
  }
  return context;
}
