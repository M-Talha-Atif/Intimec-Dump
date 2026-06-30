"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import {
  AIPromptContextType,
  AIPromptState,
  PromptTemplate,
  PromptTemplateVersion,
} from "@/types/ai-prompt";

const nowIso = () => new Date().toISOString();

const seedTemplate = (
  feature: string,
  outputFormat: string,
  content: string,
  version: string = "v1"
): PromptTemplate => {
  const v: PromptTemplateVersion = {
    id: version,
    outputFormat,
    content,
    createdAt: nowIso(),
    isEnabled: true,
  };
  return {
    feature,
    outputFormat,
    versions: [v],
    enabledVersionId: v.id,
    draftContent: content,
  };
};

const DEFAULT_PROMPT_BASE = `You are an AI assistant for an identity and access management platform. Be precise and concise.`;
const defaultPromptFor = (feature: string) =>
  `${DEFAULT_PROMPT_BASE}\n\nFeature: ${feature}\n\nUser Query: {query}`;

const initialState: AIPromptState = {
  selectedFeature: "AI Assistant (Global)",
  templates: {
    "AI Assistant (Global)": seedTemplate(
      "AI Assistant (Global)",
      "Markdown",
      defaultPromptFor("AI Assistant (Global)"),
      "v1"
    ),
    "Debugging Assistant": seedTemplate(
      "Debugging Assistant",
      "KPI Cards",
      defaultPromptFor("Debugging Assistant"),
      "v1"
    ),
    "Audit Log Analyzer": seedTemplate(
      "Audit Log Analyzer",
      "Tables",
      defaultPromptFor("Audit Log Analyzer"),
      "v1"
    ),
    "Security Policy Advisor": seedTemplate(
      "Security Policy Advisor",
      "Structured",
      defaultPromptFor("Security Policy Advisor"),
      "v1"
    ),
    "Compliance Reporter": seedTemplate(
      "Compliance Reporter",
      "Charts",
      defaultPromptFor("Compliance Reporter"),
      "v1"
    ),
    "Role AI Assistant": seedTemplate(
      "Role AI Assistant",
      "Markdown",
      defaultPromptFor("Role AI Assistant"),
      "v1"
    ),
    "Pattern Analysis": seedTemplate(
      "Pattern Analysis",
      "Markdown",
      defaultPromptFor("Pattern Analysis"),
      "v1"
    ),
  },
};

const AIPromptContext = createContext<AIPromptContextType | undefined>(
  undefined
);

export const AIPromptProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AIPromptState>(initialState);

  const setSelectedFeature = (feature: string) =>
    setState((s) => ({ ...s, selectedFeature: feature }));

  const selectFeature = (
    feature: string,
    options?: { loadEnabled?: boolean }
  ) => {
    setState((s) => {
      const next: AIPromptState = { ...s, selectedFeature: feature };
      if (options?.loadEnabled) {
        const tpl = next.templates[feature];
        const enabled = tpl.versions.find((v) => v.id === tpl.enabledVersionId);
        if (enabled) {
          next.templates = {
            ...next.templates,
            [feature]: { ...tpl, draftContent: enabled.content },
          };
        }
      }
      return next;
    });
  };

  const setDraftContent = (content: string) =>
    setState((s) => ({
      ...s,
      templates: {
        ...s.templates,
        [s.selectedFeature]: {
          ...s.templates[s.selectedFeature],
          draftContent: content,
        },
      },
    }));

  const setOutputFormat = (feature: string, outputFormat: string) =>
    setState((s) => {
      const tpl = s.templates[feature];
      return {
        ...s,
        templates: {
          ...s.templates,
          [feature]: { ...tpl, outputFormat },
        },
      };
    });

  const resetDraftToEnabled = () => {
    setState((s) => {
      const tpl = s.templates[s.selectedFeature];
      const enabled = tpl.versions.find((v) => v.id === tpl.enabledVersionId);
      const draftContent = enabled ? enabled.content : tpl.draftContent;
      return {
        ...s,
        templates: {
          ...s.templates,
          [s.selectedFeature]: { ...tpl, draftContent },
        },
      };
    });
  };

  const saveDraftAsNewVersion = (opts?: {
    notes?: string;
    author?: string;
  }): string => {
    let createdId = "";
    setState((s) => {
      const tpl = s.templates[s.selectedFeature];
      const nextIndex = tpl.versions.length + 1;
      const id = `v${nextIndex}`;
      createdId = id;
      const newVersion: PromptTemplateVersion = {
        id,
        content: tpl.draftContent,
        createdAt: nowIso(),
        isEnabled: false,
        author: opts?.author,
        notes: opts?.notes,
      };
      const versions = [...tpl.versions, newVersion];
      return {
        ...s,
        templates: {
          ...s.templates,
          [s.selectedFeature]: { ...tpl, versions },
        },
      };
    });
    return createdId;
  };

  const enableVersion = (versionId: string) => {
    setState((s) => {
      const tpl = s.templates[s.selectedFeature];
      const versions = tpl.versions.map((v) => ({
        ...v,
        isEnabled: v.id === versionId,
      }));
      return {
        ...s,
        templates: {
          ...s.templates,
          [s.selectedFeature]: {
            ...tpl,
            versions,
            enabledVersionId: versionId,
            draftContent:
              versions.find((v) => v.id === versionId)?.content ??
              tpl.draftContent,
          },
        },
      };
    });
  };

  const value: AIPromptContextType = useMemo(
    () => ({
      state,
      getCurrentTemplate: () => state.templates[state.selectedFeature],
      getCurrentEnabledVersion: () => {
        const tpl = state.templates[state.selectedFeature];
        return tpl.versions.find((v) => v.id === tpl.enabledVersionId);
      },
      setSelectedFeature,
      selectFeature,
      setDraftContent,
      setOutputFormat,
      resetDraftToEnabled,
      saveDraftAsNewVersion,
      saveDraftAndEnable: (opts) => {
        const newId = saveDraftAsNewVersion(opts);
        if (newId) enableVersion(newId);
      },
      enableVersion,
    }),
    [state]
  );

  return (
    <AIPromptContext.Provider value={value}>
      {children}
    </AIPromptContext.Provider>
  );
};

export const useAIPrompt = (): AIPromptContextType => {
  const ctx = useContext(AIPromptContext);
  if (!ctx) throw new Error("useAIPrompt must be used within AIPromptProvider");
  return ctx;
};
