import hljs from "highlight.js";
import json from "highlight.js/lib/languages/json";
import "@catppuccin/highlightjs/css/catppuccin-mocha.css";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

hljs.registerLanguage("json", json);

export default function CodeHighlight({
  code,
  className,
  ...props
}: {
  code: string;
  className?: string;
}) {
  const highlightedCode = useMemo(
    () => hljs.highlight(code, { language: "json" }).value,
    [code],
  );

  return (
    <code
      className={cn(
        "language-json hljs overflow-auto p-4 w-full whitespace-pre",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
      {...props}
    />
  );
}
