"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { IdentityType } from "./data/identity-mapping";
import { PreviewResult } from "./data/livePreviewData";
import { calculatePreviewStats } from "./utils/livePreviewUtils";
import {
  PreviewProgress,
  PreviewSummary,
  PreviewResultsTable,
  PreviewEmptyState,
  PreviewIssuesAlert,
} from "./components/live-preview";
import { useIdentityMappingContext } from "./context/IdentityMappingContext";
import { useMappingEngine } from "./hooks/useMappingEngine";

interface LivePreviewProps {
  identityType: IdentityType;
}

// Map a transformation mode to a human-readable status + notes
function applyTransformation(
  rawValue: string,
  mode: string | null | undefined
): { transformedValue: string; status: "success" | "warning" | "error"; notes: string } {
  const m = (mode ?? "direct").toLowerCase();
  switch (m) {
    case "uppercase":
      return { transformedValue: rawValue.toUpperCase(), status: "success", notes: "Uppercase transformation applied" };
    case "lowercase":
      return { transformedValue: rawValue.toLowerCase(), status: "success", notes: "Lowercase transformation applied" };
    case "direct":
    case "default":
    case "inbound":
    case "both":
    case "none":
    case "":
      return { transformedValue: rawValue, status: "success", notes: "Direct mapping — no transformation" };
    case "script":
      return { transformedValue: rawValue, status: "warning", notes: "Script transformation — preview uses raw value" };
    default:
      return { transformedValue: rawValue, status: "success", notes: `Mode: ${mode}` };
  }
}

// Shape returned by GET /api/shadows
interface ShadowRecord {
  id: string;
  resourceId: string;
  resourceUid: string;
  objectClass: string;
  attributes: Record<string, unknown>;
}

// Shape returned by GET /api/identity/mapping/policies/[identityType]/attribute/mappings
interface AttributeMappingRuleDTO {
  id: string;
  sourceResourceId: string;
  sourceAttributeName: string;
  mode: string | null;
}
interface AttributeMappingGroupDTO {
  targetAttributeName: string;
  identityType: string;
  mappings: AttributeMappingRuleDTO[];
}

export const LivePreview = ({ identityType }: LivePreviewProps) => {
  const { selectedIdentityType } = useIdentityMappingContext();
  const { sources } = useMappingEngine(selectedIdentityType?.schemaId ?? "");

  const [selectedSourceId, setSelectedSourceId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<PreviewResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runPreview = async () => {
    if (!selectedSourceId) {
      toast.error("Select a source application first.");
      return;
    }

    setIsRunning(true);
    setProgress(10);
    setResults([]);

    try {
      // 1. Fetch up to 10 real shadows for the selected application
      setProgress(30);
      const shadowsRes = await fetch(
        `/api/shadows?resourceId=${selectedSourceId}&objectClass=__ACCOUNT__&size=10`
      );
      if (!shadowsRes.ok) throw new Error("Failed to fetch shadow records");
      const shadowsData = await shadowsRes.json();
      const shadows: ShadowRecord[] = shadowsData.shadows ?? [];

      if (shadows.length === 0) {
        toast.warning("No imported accounts found for this application. Run an import task first.");
        setIsRunning(false);
        setHasRun(true);
        setProgress(100);
        return;
      }

      // 2. Fetch attribute mapping rules for this identity type
      setProgress(60);
      const mappingsRes = await fetch(
        `/api/identity/mapping/policies/${identityType}/attribute/mappings`
      );
      if (!mappingsRes.ok) throw new Error("Failed to fetch attribute mappings");
      const mappingGroups: AttributeMappingGroupDTO[] = await mappingsRes.json();

      setProgress(85);

      // 3. Apply rules client-side for each shadow
      const previewRows: PreviewResult[] = [];
      let rowId = 0;

      const sourceName =
        sources.find((s) => s.id === selectedSourceId)?.name ?? selectedSourceId;

      for (const shadow of shadows.slice(0, 5)) {
        const attrs = shadow.attributes ?? {};

        for (const group of mappingGroups) {
          // Only rules whose sourceResourceId matches the selected application
          const applicableRules = group.mappings.filter(
            (r) => r.sourceResourceId === selectedSourceId
          );

          for (const rule of applicableRules) {
            const rawRaw = attrs[rule.sourceAttributeName];
            // Flatten single-element arrays (ConnID convention)
            const rawValue =
              Array.isArray(rawRaw) && rawRaw.length > 0
                ? String(rawRaw[0])
                : rawRaw != null
                ? String(rawRaw)
                : null;

            if (rawValue === null || rawValue === "") {
              previewRows.push({
                id: String(rowId++),
                source: sourceName,
                sourceAttribute: rule.sourceAttributeName,
                rawValue: "",
                transformedValue: "",
                status: "warning",
                notes: `Attribute "${rule.sourceAttributeName}" is empty on ${shadow.resourceUid}`,
              });
              continue;
            }

            const { transformedValue, status, notes } = applyTransformation(rawValue, rule.mode);
            previewRows.push({
              id: String(rowId++),
              source: sourceName,
              sourceAttribute: `${rule.sourceAttributeName} → ${group.targetAttributeName}`,
              rawValue,
              transformedValue,
              status,
              notes: `Account: ${shadow.resourceUid} | ${notes}`,
            });
          }
        }
      }

      setProgress(100);
      setResults(previewRows);
      setHasRun(true);

      const { successCount, warningCount, errorCount } = calculatePreviewStats(previewRows);
      toast.success(
        `Preview complete: ${previewRows.length} transformations — ${successCount} success, ${warningCount} warnings, ${errorCount} errors`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Preview failed: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setHasRun(false);
    setProgress(0);
    toast("Preview results cleared.");
  };

  const { total, successCount, warningCount, errorCount } =
    calculatePreviewStats(results);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Live Preview for {identityType} Mappings</CardTitle>
            <CardDescription>
              Fetches real imported accounts and applies your mapping rules to
              show actual transformed values
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {/* Source application selector */}
            <Select value={selectedSourceId} onValueChange={setSelectedSourceId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Select source app…" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasRun && (
              <Button onClick={clearResults} variant="outline">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button onClick={runPreview} disabled={isRunning || !selectedSourceId}>
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              {isRunning ? "Running…" : "Run Preview"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isRunning && <PreviewProgress progress={progress} />}

          {hasRun && !isRunning && (
            <>
              <PreviewSummary
                total={total}
                successCount={successCount}
                warningCount={warningCount}
                errorCount={errorCount}
              />
              <PreviewResultsTable results={results} />
              <PreviewIssuesAlert
                warningCount={warningCount}
                errorCount={errorCount}
              />
            </>
          )}

          {!hasRun && !isRunning && (
            <PreviewEmptyState identityType={identityType} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
