import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function FileOrStringInput({
  value,
  onChange,
}: {
  value: string | File | undefined;
  onChange: (val: string | File | undefined) => void;
}) {
  const [isStringInput, setIsStringInput] = useState(typeof value === "string");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus("idle");
    setSelectedFileName(file.name);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("[FileUpload] Uploading file:", file.name, "Size:", file.size);

      const response = await fetch("/api/applications/add-application/files/upload", {
        method: "POST",
        body: formData,
      });

      console.log("[FileUpload] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[FileUpload] Error response:", errorText);
        let errorMessage = "Failed to upload file";
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("[FileUpload] Success response:", data);
      
      // Set the server path returned from the upload
      onChange(data.path);
      setUploadStatus("success");
      toast.success(`File uploaded: ${file.name}`);
    } catch (error) {
      console.error("[FileUpload] Exception caught:", error);
      setUploadStatus("error");
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
      onChange(undefined);
      setSelectedFileName("");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = () => {
    if (isUploading) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (uploadStatus === "success") {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (uploadStatus === "error") {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          Internal:
          <Checkbox
            checked={isStringInput}
            onCheckedChange={(checked) => {
              const checkedAsBoolean = checked === true;
              if (checkedAsBoolean) onChange("");
              else onChange(undefined);
              setIsStringInput(checked === true);
              setUploadStatus("idle");
              setSelectedFileName("");
            }}
          />
        </div>
        {isStringInput ? (
          <Input
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter path value"
          />
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <Input
              type="file"
              accept="*"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            {getStatusIcon()}
          </div>
        )}
      </div>
      {!isStringInput && selectedFileName && (
        <div className="text-sm text-muted-foreground">
          {uploadStatus === "success" && typeof value === "string" && (
            <span className="text-green-600">
              ✓ Uploaded: {selectedFileName} → {value}
            </span>
          )}
          {uploadStatus === "error" && (
            <span className="text-red-600">
              ✗ Upload failed: {selectedFileName}
            </span>
          )}
          {isUploading && (
            <span className="text-blue-600">
              Uploading: {selectedFileName}...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
