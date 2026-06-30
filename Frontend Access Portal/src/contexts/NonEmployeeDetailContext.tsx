
import React, { createContext, useState, useContext, ReactNode } from 'react';

type NonEmployeeDetailContextType = {
  selectedNonEmployee: any | null;
  setSelectedNonEmployee: (nonEmployee: any | null) => void;
};

const NonEmployeeDetailContext = createContext<NonEmployeeDetailContextType | undefined>(undefined);

export const NonEmployeeDetailProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNonEmployee, setSelectedNonEmployee] = useState<any | null>(null);

  return (
    <NonEmployeeDetailContext.Provider value={{ selectedNonEmployee, setSelectedNonEmployee }}>
      {children}
    </NonEmployeeDetailContext.Provider>
  );
};

export const useNonEmployeeDetail = () => {
  const context = useContext(NonEmployeeDetailContext);
  if (context === undefined) {
    return { selectedNonEmployee: null, setSelectedNonEmployee: (_ne: any | null) => {} };
  }
  return context;
};
