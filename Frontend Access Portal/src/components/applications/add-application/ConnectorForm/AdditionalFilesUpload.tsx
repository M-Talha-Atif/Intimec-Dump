"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  FolderOpen,
  Copy,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  lastModified?: number;
}

export default function AdditionalFilesUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/applications/add-application/files"
      );
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch {
      // Silently fail on list — non-critical
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/applications/add-application/files/upload",
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to upload file"
        );
      }

      const data = await response.json();
      toast.success(`Uploaded: ${data.filename} → ${data.path}`);
      await fetchFiles();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upload failed"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success("Path copied to clipboard");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FolderOpen className="w-4 h-4" />
          Additional Connector Files
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={fetchFiles}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Upload additional files needed by the connector (e.g., entitlement CSVs
        for multi-object-class import). Use the server path in your
        configuration files.
      </p>

      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="*"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
        {isUploading && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        )}
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {files.map((file) => (
            <div
              key={file.filename}
              className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs bg-background border rounded"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="font-medium truncate">{file.filename}</span>
                <span className="text-muted-foreground shrink-0">
                  ({formatSize(file.size)})
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <code className="px-1.5 py-0.5 bg-muted rounded text-[11px] max-w-[240px] truncate">
                  {file.path}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyPath(file.path)}
                  title="Copy server path"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
