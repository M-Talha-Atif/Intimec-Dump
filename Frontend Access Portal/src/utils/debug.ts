import type { ComponentDebugConfig, DebugSettings } from "@/types/debug";
import { DEBUG_LEVELS } from "@/constants/debug";
import { toast } from "sonner";
export const getDebugLevelColor = (level: string): string => {
  const debugLevel = DEBUG_LEVELS.find((dl) => dl.value === level);
  return debugLevel?.color || "text-gray-500";
};

export const getDebugLevelVariant = (level: string) => {
  switch (level) {
    case "OFF":
      return "secondary";
    case "ERROR":
      return "destructive";
    case "WARN":
      return "default";
    case "TRACE":
      return "outline";
    default:
      return "default";
  }
};

export const getActiveComponentsCount = (
  components: ComponentDebugConfig[]
): number => {
  return components.filter((comp) => comp.level !== "OFF").length;
};

export const getHighVerbosityWarning = (
  components: ComponentDebugConfig[]
): boolean => {
  const debugCount = components.filter((comp) => comp.level === "DEBUG").length;
  const traceCount = components.filter((comp) => comp.level === "TRACE").length;
  return debugCount >= 2 || traceCount >= 1;
};

export const hasTraceLogging = (
  components: ComponentDebugConfig[]
): boolean => {
  if (!components) return false;
  return components?.some((comp) => comp.level === "TRACE") ?? false;
};

export const exportDebugSettings = (settings: Partial<DebugSettings>): void => {
  const blob = new Blob([JSON.stringify(settings, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "debug-settings.json";
  a.click();
  URL.revokeObjectURL(url);
};

export const applyPresetToComponents = (
  preset: string,
  components: ComponentDebugConfig[]
): ComponentDebugConfig[] => {
  switch (preset) {
    case "critical-only":
      return components.map((comp) => ({ ...comp, level: "ERROR" }));

    case "connector-errors":
      return components.map((comp) => ({
        ...comp,
        level: comp.name === "Connectors" ? "ERROR" : "OFF",
      }));

    case "verbose-workflow":
      return components.map((comp) => ({
        ...comp,
        level: comp.name === "Workflows" ? "DEBUG" : "WARN",
      }));

    case "authentication-only":
      return components.map((comp) => ({
        ...comp,
        level: comp.name === "Authentication" ? "INFO" : "OFF",
      }));

    case "connector-provisioning":
      return components.map((comp) => ({
        ...comp,
        level:
          comp.name === "Connectors"
            ? "DEBUG"
            : comp.name === "Provisioning"
            ? "INFO"
            : "OFF",
      }));

    case "access-reviews-errors":
      return components.map((comp) => ({
        ...comp,
        level: comp.name === "Access Requests" ? "WARN" : "OFF",
      }));

    case "api-events-verbose":
      return components.map((comp) => ({
        ...comp,
        level: comp.name === "Webhooks/API" ? "DEBUG" : "OFF",
      }));

    case "workflow-failures":
      return components.map((comp) => ({
        ...comp,
        level: comp.name === "Workflows" ? "ERROR" : "OFF",
      }));

    case "all-info-plus":
      return components.map((comp) => ({ ...comp, level: "INFO" }));

    case "all-trace-logs":
      return components.map((comp) => ({ ...comp, level: "TRACE" }));

    case "workflows-trace":
      return components.map((comp) => ({
        ...comp,
        level: comp.name === "Workflows" ? "TRACE" : "INFO",
      }));

    default:
      return components;
  }
};

export const copyToClipboard = async (text: string) => {
  try {
    console.log("Copying to clipboard:", text);

    // Check if the modern Clipboard API is available (HTTPS/localhost only)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      toast.success("JSON copied to clipboard");
      return;
    }

    // Fallback for non-HTTPS environments
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      toast.success("JSON copied to clipboard");
    } else {
      throw new Error("Copy command was unsuccessful");
    }
  } catch (err) {
    console.error("Copy to clipboard failed:", err);
    toast.error(
      `Failed to copy to clipboard: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
};
