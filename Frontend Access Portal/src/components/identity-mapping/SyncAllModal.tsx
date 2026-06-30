"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Loader,
} from "lucide-react";
import { IdentityType } from "./IdentityAttributeMappingContent";
import { toast } from "sonner";

interface SyncAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  identityType: IdentityType;
  totalMappings: number;
}

interface SyncProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  currentOperation: string;
}

interface SyncResult {
  id: string;
  identity: string;
  status: "success" | "failed" | "skipped";
  message: string;
  attributesUpdated: number;
}

export const SyncAllModal = ({
  isOpen,
  onClose,
  identityType,
  totalMappings,
}: SyncAllModalProps) => {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [previewImpact, setPreviewImpact] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress>({
    total: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    currentOperation: "",
  });
  const [results, setResults] = useState<SyncResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleStartSync = async () => {
    console.log("Starting sync for:", identityType, "with settings:", {
      includeInactive,
      dryRun,
      previewImpact,
    });
    setIsSyncing(true);
    setShowResults(false);

    // Simulate sync process
    const totalIdentities = includeInactive ? 1250 : 1000;
    setProgress({
      total: totalIdentities,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      currentOperation: "Initializing sync process...",
    });

    const mockResults: SyncResult[] = [];

    for (let i = 1; i <= totalIdentities; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate processing time

      const identity = `user${i}@company.com`;
      const status =
        Math.random() > 0.1
          ? "success"
          : Math.random() > 0.5
          ? "failed"
          : "skipped";
      const attributesUpdated =
        status === "success" ? Math.floor(Math.random() * 5) + 1 : 0;

      mockResults.push({
        id: i.toString(),
        identity,
        status,
        message:
          status === "success"
            ? `Successfully updated ${attributesUpdated} attributes`
            : status === "failed"
            ? "Validation failed: Invalid email format"
            : "Skipped: No changes detected",
        attributesUpdated,
      });

      setProgress((prev) => ({
        ...prev,
        processed: i,
        succeeded: prev.succeeded + (status === "success" ? 1 : 0),
        failed: prev.failed + (status === "failed" ? 1 : 0),
        skipped: prev.skipped + (status === "skipped" ? 1 : 0),
        currentOperation: `Processing ${identity}...`,
      }));
    }

    setResults(mockResults);
    setProgress((prev) => ({ ...prev, currentOperation: "Sync completed" }));
    setIsSyncing(false);
    setShowResults(true);

    toast.success("Sync Completed", {
      description: `Processed ${totalIdentities} ${identityType} identities successfully.`,
    });
  };

  const handleExportResults = () => {
    console.log("Exporting sync results");
    const csvContent = [
      "Identity,Status,Message,Attributes Updated",
      ...results.map(
        (r) => `${r.identity},${r.status},"${r.message}",${r.attributesUpdated}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sync-results-${identityType}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercentage =
    progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Sync All {identityType} Identities</span>
          </DialogTitle>
          <DialogDescription>
            Apply mapping logic and update all {identityType} identities with
            the latest attribute values
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!isSyncing && !showResults && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> You are about to apply mapping logic
                  to all {identityType} identities. This operation will update
                  identity attributes based on your configured mappings.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Sync Configuration</CardTitle>
                  <CardDescription>
                    Configure how the sync operation should be performed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeInactive"
                      checked={includeInactive}
                      onCheckedChange={(checked) =>
                        setIncludeInactive(checked === true)
                      }
                    />
                    <Label htmlFor="includeInactive">
                      Include inactive identities
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dryRun"
                      checked={dryRun}
                      onCheckedChange={(checked) => setDryRun(checked === true)}
                    />
                    <Label htmlFor="dryRun">
                      Validation only (dry-run mode)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="previewImpact"
                      checked={previewImpact}
                      onCheckedChange={(checked) =>
                        setPreviewImpact(checked === true)
                      }
                    />
                    <Label htmlFor="previewImpact">
                      Preview impact before applying changes
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {includeInactive ? "1,250" : "1,000"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Identities
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{totalMappings}</div>
                      <div className="text-sm text-muted-foreground">
                        Active Mappings
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">~850</div>
                      <div className="text-sm text-muted-foreground">
                        Estimated Updates
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">~5-10min</div>
                      <div className="text-sm text-muted-foreground">
                        Estimated Duration
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleStartSync}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {dryRun ? "Start Validation" : "Start Sync"}
                </Button>
              </div>
            </>
          )}

          {isSyncing && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sync Progress</CardTitle>
                  <CardDescription>{progress.currentOperation}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progressPercentage} className="w-full" />
                  <div className="text-center">
                    <span className="text-lg font-medium">
                      {progress.processed} / {progress.total} (
                      {Math.round(progressPercentage)}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600">
                          {progress.succeeded}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Processed
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-bold text-yellow-600">
                          {progress.skipped}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Skipped
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="font-bold text-red-600">
                          {progress.failed}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Failed
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1">
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="font-bold">
                          {progress.total - progress.processed}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Remaining
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Sync Results</CardTitle>
                    <CardDescription>
                      Summary of the sync operation
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">
                        {progress.succeeded}
                      </div>
                      <div className="text-sm text-green-600">Successful</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-yellow-50">
                      <div className="text-2xl font-bold text-yellow-600">
                        {progress.skipped}
                      </div>
                      <div className="text-sm text-yellow-600">Skipped</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-red-50">
                      <div className="text-2xl font-bold text-red-600">
                        {progress.failed}
                      </div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    <div className="space-y-1 p-2">
                      {results.slice(0, 50).map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            {result.status === "success" && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {result.status === "failed" && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            {result.status === "skipped" && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                            <span className="font-mono">{result.identity}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.message}
                          </div>
                        </div>
                      ))}
                      {results.length > 50 && (
                        <div className="text-center text-sm text-muted-foreground p-2">
                          ... and {results.length - 50} more results
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
