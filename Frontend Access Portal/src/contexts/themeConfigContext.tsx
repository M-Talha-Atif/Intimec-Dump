// contexts/ThemeProvider.tsx
"use client";
import { UIConfig } from "@/types/UIConfig";
import useThemeConfig from "@/hooks/useThemeConfig";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { applyLightTheme, applyDarkTheme } from "@/utils/applyThemeConfig";
import { setThemeAction } from "@/app/actions/set-theme";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextType = {
  themeConfig: UIConfig | undefined;
  loadingTheme: boolean;
  loadingError: Error | null;
  updateTheme: (newTheme: UIConfig) => Promise<void>;
  mode: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export default function ThemeProvider({
  children,
  initialTheme = "system",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const { data, isLoading, error, updateTheme: swrUpdateTheme } = useThemeConfig();
  const [mode, setMode] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Resolve theme (system -> light/dark)
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      const finalTheme =
        mode === "system" ? (mediaQuery.matches ? "dark" : "light") : mode;
      setResolvedTheme(finalTheme);
    };

    handler();
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode]);

  // Apply theme config from SWR data when it changes (initial load + background revalidation)
  useEffect(() => {
    if (!data || !mounted) return;

    if (resolvedTheme === "dark") {
      applyDarkTheme(data);
    } else {
      applyLightTheme(data);
    }

    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [data, resolvedTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setMode(newTheme);
    setThemeAction(newTheme);
  };

  const toggleTheme = () => {
    const newMode = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newMode);
  };

  /**
   * Saves the new config via SWR mutation, then immediately applies it to
   * the DOM so the user sees the new theme without waiting for revalidation.
   *
   * This is the critical fix: swrUpdateTheme does the API call + cache
   * mutation, but the SWR data change triggers applyTheme asynchronously.
   * We apply the theme eagerly here so CSS variables update instantly.
   */
  const updateTheme = useCallback(
    async (newConfig: UIConfig): Promise<void> => {
      // 1. Persist via SWR mutation (API call + optimistic cache update)
      await swrUpdateTheme(newConfig);

      // 2. Eagerly apply to DOM immediately after successful save.
      //    This ensures CSS variables update right away, before SWR
      //    revalidation completes and triggers the useEffect above.
      if (resolvedTheme === "dark") {
        applyDarkTheme(newConfig);
      } else {
        applyLightTheme(newConfig);
      }
    },
    [swrUpdateTheme, resolvedTheme]
  );

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeConfig: data,
        loadingTheme: isLoading,
        loadingError: error ?? null,
        updateTheme,
        mode,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
};