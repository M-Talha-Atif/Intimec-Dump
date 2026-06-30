"use client";
import { createContext, useContext } from "react";

interface ResponsibilitiesContextType {
  globalSearch: string;
}

export const ResponsibilitiesContext = createContext<ResponsibilitiesContextType>({
  globalSearch: "",
});

export const useResponsibilitiesContext = () =>
  useContext(ResponsibilitiesContext);
