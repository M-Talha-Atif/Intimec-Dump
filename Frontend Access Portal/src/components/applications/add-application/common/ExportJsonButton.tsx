import { Button } from "@/components/ui/button";
import React, { useRef } from "react";

interface ExportJsonButtonProps extends React.ComponentProps<typeof Button> {
  data: unknown;
  fileName?: string;
}

export default function ExportJsonButton({
  data,
  children,
  fileName = "data.json",
  ...props
}: ExportJsonButtonProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const handleExport = () => {
    try {
      const json = JSON.stringify(data, null, 2); // pretty print
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      if (linkRef.current) {
        linkRef.current.href = url;
        linkRef.current.click();
      }

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export JSON:", err);
    }
  };
  return (
    <>
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          handleExport();
        }}
        {...props}
      >
        {children || "Export JSON"}
      </Button>
      <a ref={linkRef} download={fileName} className="hidden" />
    </>
  );
}
