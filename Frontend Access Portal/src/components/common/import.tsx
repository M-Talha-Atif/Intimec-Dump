import { useRef } from "react";
import { Button } from "@/components/ui/button";

interface ImportJsonButtonProps extends React.ComponentProps<typeof Button> {
  onImport: (data: unknown) => void;
}

export default function ImportJsonButton({
  onImport,
  children,
  ...props
}: ImportJsonButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const jsonData = JSON.parse(reader.result as string);
        onImport(jsonData);
      } catch (error) {
        console.error("Failed to parse JSON:", error);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-uploading same file
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          fileInputRef.current?.click();
        }}
        {...props}
      >
        {children || "Import JSON"}
      </Button>
    </>
  );
}
