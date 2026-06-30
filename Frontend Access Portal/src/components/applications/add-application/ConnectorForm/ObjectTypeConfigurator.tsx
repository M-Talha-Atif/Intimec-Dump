"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Database, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ObjectTypeEntry {
  className: string;
  filePath: string;
  fileName: string;
  uniqueAttribute: string;
  nameAttribute: string;
  fieldDelimiter: string;
  headerExists: boolean;
}

const COMMON_OBJECT_CLASSES = [
  { value: "__GROUP__", label: "Group (__GROUP__)" },
  { value: "__ROLE__", label: "Role (__ROLE__)" },
  { value: "__ORGANIZATION__", label: "Organization (__ORGANIZATION__)" },
] as const;

const DEFAULT_ENTRY: ObjectTypeEntry = {
  className: "__GROUP__",
  filePath: "",
  fileName: "",
  uniqueAttribute: "uid",
  nameAttribute: "uid",
  fieldDelimiter: ",",
  headerExists: true,
};

function generatePropertiesContent(entries: ObjectTypeEntry[]): string {
  return entries
    .map(
      (entry) =>
        `${entry.className}.filePath=${entry.filePath}\n` +
        `${entry.className}.uniqueAttribute=${entry.uniqueAttribute}\n` +
        `${entry.className}.nameAttribute=${entry.nameAttribute || entry.uniqueAttribute}\n` +
        `${entry.className}.fieldDelimiter=${entry.fieldDelimiter || ","}\n` +
        `${entry.className}.headerExists=${entry.headerExists}`
    )
    .join("\n\n");
}

/**
 * Parse a .properties file back into ObjectTypeEntry[].
 * Properties file format:
 *   __GROUP__.filePath=/uploads/groups.csv
 *   __GROUP__.uniqueAttribute=uid
 *   ...
 */
function parsePropertiesContent(content: string): ObjectTypeEntry[] {
  const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const map = new Map<string, Partial<ObjectTypeEntry>>();

  for (const line of lines) {
    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) continue;
    const key = line.substring(0, eqIdx).trim();
    const val = line.substring(eqIdx + 1).trim();
    const dotIdx = key.indexOf(".");
    if (dotIdx === -1) continue;
    const className = key.substring(0, dotIdx);
    const prop = key.substring(dotIdx + 1);

    if (!map.has(className)) {
      map.set(className, { className, filePath: "", fileName: "", uniqueAttribute: "uid", nameAttribute: "uid", fieldDelimiter: ",", headerExists: true });
    }
    const entry = map.get(className)!;
    if (prop === "filePath") entry.filePath = val;
    else if (prop === "uniqueAttribute") entry.uniqueAttribute = val;
    else if (prop === "nameAttribute") entry.nameAttribute = val;
    else if (prop === "fieldDelimiter") entry.fieldDelimiter = val;
    else if (prop === "headerExists") entry.headerExists = val === "true";
  }

  return Array.from(map.values()).filter((e) => e.className) as ObjectTypeEntry[];
}

export default function ObjectTypeConfigurator({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [objectTypes, setObjectTypes] = useState<ObjectTypeEntry[]>([]);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "synced">(
    "idle"
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guard: prevent the auto-sync from running before we've had a chance to
  // either restore saved entries or confirm there's nothing to restore.
  // Without this, the effect fires 800ms after mount with objectTypes=[],
  // calls onChange(""), and silently erases the persisted objectClassDefinition.
  const isInitializedRef = useRef(!value);

  const addObjectType = () => {
    setObjectTypes((prev) => [...prev, { ...DEFAULT_ENTRY }]);
  };

  const removeObjectType = (index: number) => {
    setObjectTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateObjectType = (
    index: number,
    field: keyof ObjectTypeEntry,
    val: string | boolean
  ) => {
    setObjectTypes((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: val } : entry
      )
    );
  };

  // Generate and upload the properties file
  const generateAndUpload = useCallback(
    async (entries: ObjectTypeEntry[]) => {
      if (entries.length === 0) {
        onChange("");
        setSyncState("synced");
        return;
      }

      // Don't upload incomplete entries
      const isComplete = entries.every(
        (e) => e.className && e.filePath && e.uniqueAttribute
      );
      if (!isComplete) {
        setSyncState("idle");
        return;
      }

      setSyncState("syncing");
      try {
        const content = generatePropertiesContent(entries);
        const blob = new Blob([content], { type: "text/plain" });
        const file = new File([blob], "object-class-definition.properties", {
          type: "text/plain",
        });

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "/api/applications/add-application/files/upload",
          { method: "POST", body: formData }
        );

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        onChange(data.path);
        setSyncState("synced");
      } catch {
        toast.error("Failed to generate object class definition file");
        setSyncState("idle");
      }
    },
    [onChange]
  );

  // Debounced sync when object types change — guarded by isInitializedRef
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateAndUpload(objectTypes);
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [objectTypes, generateAndUpload]);

  // Restore saved object types from the uploaded properties file.
  // If the value (file path) exists, fetch + parse it back into ObjectTypeEntry[].
  // If it doesn't exist or fails, mark as initialized to allow normal operation.
  useEffect(() => {
    if (isInitializedRef.current) return; // already initialized (no saved value or already restored)

    if (!value) {
      isInitializedRef.current = true;
      return;
    }

    const restoreSavedEntries = async () => {
      try {
        const response = await fetch(
          `/api/applications/add-application/files/download?path=${encodeURIComponent(value)}`
        );
        if (!response.ok) {
          // File no longer exists or can't be fetched — keep the saved value but mark initialized
          isInitializedRef.current = true;
          return;
        }

        const content = await response.text();
        const entries = parsePropertiesContent(content);
        if (entries.length > 0) {
          setObjectTypes(entries);
        }
      } catch {
        // Failed to restore — don't wipe the saved value
      } finally {
        isInitializedRef.current = true;
      }
    };
    restoreSavedEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3 col-span-2 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Database className="w-4 h-4" />
          Additional Object Types
          {syncState === "syncing" && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          )}
          {syncState === "synced" && objectTypes.length > 0 && (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addObjectType}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Object Type
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Define additional object types (e.g., groups, roles) that the connector
        should import from separate CSV files. A configuration file will be
        auto-generated from the entries below.
      </p>

      {objectTypes.length === 0 && (
        <div className="text-xs text-muted-foreground italic text-center py-4 border border-dashed rounded-md">
          No additional object types configured. Only the default account object
          class will be imported.
        </div>
      )}

      {objectTypes.map((entry, index) => (
        <ObjectTypeCard
          key={index}
          entry={entry}
          index={index}
          onUpdate={updateObjectType}
          onRemove={removeObjectType}
        />
      ))}

      {value && objectTypes.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          Auto-generated:{" "}
          <code className="px-1.5 py-0.5 bg-muted rounded text-[11px]">
            {value}
          </code>
        </div>
      )}
    </div>
  );
}

function ObjectTypeCard({
  entry,
  index,
  onUpdate,
  onRemove,
}: {
  entry: ObjectTypeEntry;
  index: number;
  onUpdate: (index: number, field: keyof ObjectTypeEntry, val: string | boolean) => void;
  onRemove: (index: number) => void;
}) {
  const [isStringInput, setIsStringInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">(
    entry.filePath ? "success" : "idle"
  );

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus("idle");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/applications/add-application/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload file");
      }

      const data = await response.json();
      onUpdate(index, "filePath", data.path);
      onUpdate(index, "fileName", file.name);
      setUploadStatus("success");
      toast.success(`Uploaded: ${file.name}`);
    } catch (error) {
      setUploadStatus("error");
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const isCustomClass = !COMMON_OBJECT_CLASSES.some(
    (c) => c.value === entry.className
  );

  return (
    <div className="p-3 border rounded-md bg-background space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Object Type #{index + 1}
          {entry.className && (
            <span className="ml-2 text-xs text-muted-foreground font-mono">
              {entry.className}
            </span>
          )}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Object Class Name */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium">
            Object Class Name <span className="text-destructive">*</span>
          </Label>
          <Select
            value={isCustomClass ? "custom" : entry.className}
            onValueChange={(val) => {
              if (val === "custom") {
                onUpdate(index, "className", "");
              } else {
                onUpdate(index, "className", val);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select object class" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_OBJECT_CLASSES.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                  {cls.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom...</SelectItem>
            </SelectContent>
          </Select>
          {isCustomClass && (
            <Input
              type="text"
              placeholder="e.g., __CUSTOM_TYPE__"
              value={entry.className}
              onChange={(e) => onUpdate(index, "className", e.target.value)}
            />
          )}
        </div>

        {/* CSV File Upload */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium">
            CSV File <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs shrink-0">
              Internal:
              <Checkbox
                checked={isStringInput}
                onCheckedChange={(checked) => {
                  setIsStringInput(checked === true);
                  if (checked) {
                    onUpdate(index, "filePath", "");
                    onUpdate(index, "fileName", "");
                  } else {
                    onUpdate(index, "filePath", "");
                    onUpdate(index, "fileName", "");
                  }
                  setUploadStatus("idle");
                }}
              />
            </div>
            {isStringInput ? (
              <Input
                type="text"
                placeholder="/app/connector-data/groups.csv"
                value={entry.filePath}
                onChange={(e) => onUpdate(index, "filePath", e.target.value)}
              />
            ) : (
              <>
                <Input
                  type="file"
                  accept=".csv,.txt"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = "";
                  }}
                />
                {isUploading && <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />}
                {uploadStatus === "success" && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {uploadStatus === "error" && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              </>
            )}
          </div>
          {entry.filePath && uploadStatus === "success" && !isStringInput && (
            <span className="text-[11px] text-green-600 truncate">
              {entry.fileName || entry.filePath} → {entry.filePath}
            </span>
          )}
        </div>

        {/* Unique Attribute */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium">
            Unique Attribute <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g., uid"
            value={entry.uniqueAttribute}
            onChange={(e) =>
              onUpdate(index, "uniqueAttribute", e.target.value)
            }
          />
        </div>

        {/* Name Attribute */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium">Name Attribute</Label>
          <Input
            type="text"
            placeholder="Defaults to unique attribute"
            value={entry.nameAttribute}
            onChange={(e) =>
              onUpdate(index, "nameAttribute", e.target.value)
            }
          />
        </div>

        {/* Field Delimiter */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-medium">Field Delimiter</Label>
          <Input
            type="text"
            maxLength={1}
            placeholder=","
            value={entry.fieldDelimiter}
            onChange={(e) =>
              onUpdate(index, "fieldDelimiter", e.target.value)
            }
          />
        </div>

        {/* Header Exists */}
        <div className="flex items-center gap-2 pt-5">
          <Checkbox
            checked={entry.headerExists}
            onCheckedChange={(checked) =>
              onUpdate(index, "headerExists", checked === true)
            }
          />
          <Label className="text-xs font-medium">CSV has header row</Label>
        </div>
      </div>
    </div>
  );
}
