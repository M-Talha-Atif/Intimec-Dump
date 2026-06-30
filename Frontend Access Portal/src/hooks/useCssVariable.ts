import { useEffect, useState } from "react";

export function useCssVariable(variable: string) {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const getValue = () => {
      const computed = getComputedStyle(root)
        .getPropertyValue(variable)
        .trim();
      setValue(computed);
    };

    getValue(); // initial read

    // Observe class changes (for dark mode toggles)
    const observer = new MutationObserver(getValue);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [variable]);

  return value;
}