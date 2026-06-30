
import React, { createContext, useState, useContext, ReactNode } from 'react';

type NhiDetailContextType = {
  selectedNhi: any | null;
  setSelectedNhi: (nhi: any | null) => void;
};

const NhiDetailContext = createContext<NhiDetailContextType | undefined>(undefined);

export const NhiDetailProvider = ({ children }: { children: ReactNode }) => {
  const [selectedNhi, setSelectedNhi] = useState<any | null>(null);

  return (
    <NhiDetailContext.Provider value={{ selectedNhi, setSelectedNhi }}>
      {children}
    </NhiDetailContext.Provider>
  );
};

export const useNhiDetail = () => {
  const context = useContext(NhiDetailContext);
  if (context === undefined) {
    return { selectedNhi: null, setSelectedNhi: (_nhi: any | null) => {} };
  }
  return context;
};
