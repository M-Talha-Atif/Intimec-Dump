import { BeforeMount, Editor } from "@monaco-editor/react";
import React, { useRef, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import type MonacoType from "monaco-editor/esm/vs/editor/editor.api";
import { getFetcher } from "@/hooks/applications/fetcher";
import useSWR from "swr";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
// Load font with subsets and weights you want
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono", // Optional: CSS variable name
});
import { useDebounceCallback } from "@/hooks/useDebounce";

import "./monaco.css";
import { CheckIcon, LoaderCircle } from "lucide-react";

import { type ScriptEditorContent, scriptEditorSchema } from "./schema";
import { cn } from "@/lib/utils";

async function loadTheme(themeName: string) {
  const res = await fetch(themeName);
  const theme = await res.json();
  return theme;
}

export default function ScriptEditor({
  onScriptChange,
  onLangChange,
  scriptValue,
  lang,
  disableLangSelection,
  typescriptTypes,
  className,
}: {
  onScriptChange: (value: ScriptEditorContent["data"]) => void;
  onLangChange?: (value: ScriptEditorContent["lang"]) => void;
  scriptValue: ScriptEditorContent["data"] | undefined;
  lang: ScriptEditorContent["lang"] | string;
  disableLangSelection?: boolean;
  typescriptTypes?: string;
  className?: string;
}) {
  const monacoRef = useRef<typeof MonacoType | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { data, isLoading } = useSWR<{
    themes: { name: string; path: string }[];
  }>("/themes/index.json", getFetcher("Failed to fetch themes"));

  const defaultThemePath =
    localStorage.getItem("preferred-theme") || "/themes/github-light.json";

  const handleBeforeMount: BeforeMount = async (monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      lib: ["es2024"], // no "dom"
      target: monaco.languages.typescript.ScriptTarget.ES2020, // Target ECMAScript 2020
      module: monaco.languages.typescript.ModuleKind.ESNext,
      allowSyntheticDefaultImports: true, // Allow synthetic default imports
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs, // Node.js module resolution
      allowNonTsExtensions: true, // Allow JavaScript files to be included in the program
    });

    if (typescriptTypes) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        typescriptTypes,
        "inmemory://model/tstypes.d.ts"
      );
    }

    const theme = await loadTheme(defaultThemePath);
    monaco.editor.defineTheme("preferred-theme", theme);
    monaco.editor.setTheme("preferred-theme");
    monacoRef.current = monaco;
  };

  const debouncedOnChange = useDebounceCallback((val: string | undefined) => {
    onScriptChange(val ?? "");
    setIsPending(false);
  }, 500); // 500ms debounce

  console.log("selected lang:", lang);

  return (
    <div className={cn("w-full h-full flex flex-col gap-2", className)}>
      <div className="flex flex-row justify-between">
        <Select
          defaultValue={defaultThemePath}
          onValueChange={async (value) => {
            if (!monacoRef.current) return;
            const data = await loadTheme(value);
            monacoRef.current.editor.defineTheme("preferred-theme", data);
            monacoRef.current.editor.setTheme("preferred-theme");
            localStorage.setItem("preferred-theme", value);
          }}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={isLoading ? "loading themes" : "Select a theme"}
            />
          </SelectTrigger>
          <SelectContent>
            {data?.themes.map((theme) => (
              <SelectItem key={theme.name} value={theme.path}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          {isPending ? (
            <LoaderCircle className="animate-spin text-muted-foreground w-4 h-4" />
          ) : (
            <CheckIcon className="text-green-500 w-4 h-4" />
          )}
          {!disableLangSelection && (
            <Select
              onValueChange={(val: ScriptEditorContent["lang"]) => {
                onLangChange?.(val);
              }}
              value={lang ?? ""}
            >
              <SelectTrigger className="min-w-fit w-50">
                <SelectValue placeholder="Select script language" />
              </SelectTrigger>
              <SelectContent>
                {scriptEditorSchema.shape.lang.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <Editor
        className="border-1 h-full"
        language={lang === "groovy" ? "java" : lang ?? ""}
        value={scriptValue ?? ""}
        beforeMount={handleBeforeMount}
        onChange={(val) => {
          setIsPending(true);
          debouncedOnChange(val);
        }}
        options={{
          fontFamily: jetbrainsMono.style.fontFamily,
          minimap: { enabled: false },
          automaticLayout: true,
          tabSize: 2,
          fontSize: 14,
          mouseWheelZoom: true,
        }}
      />
    </div>
  );
}
