"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, Eye, Grid3x3, RefreshCw, Shield } from "lucide-react";
import { useParams } from "next/navigation";
import useAccessMatrix from "@/hooks/applications/useAccessMatrix";
import SearchBarWithParams from "@/components/common/SearchBarWithParams";
import FiltersWithParams from "@/components/common/FiltersWithParams";
import clsx from "clsx";
import MatrixCanvas from "@/components/applications/acess-matrix/MatrixCanvas";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Page() {
  const { appid } = useParams();
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const {
    links,
    rowLabels,
    colLabels,
    isLoading,
    error,
    refresh,
    numRows,
    numCols,
  } = useAccessMatrix(appid as string);

  if (!links || !rowLabels || !colLabels || !numRows || !numCols) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <Grid3x3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {isLoading
            ? "Loading Access Matrix..."
            : error
              ? "Error Loading Data"
              : "No Access Data Available"}
        </h3>
        <p className="text-muted-foreground text-sm">
          {isLoading
            ? "Scanning accounts and entitlements..."
            : "Not enough data to build an access matrix for this application."}
        </p>
      </div>
    );
  }
  return (
    <div className="h-full w-full p-4 flex flex-col relative">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Access Matrix</h3>
            <Badge variant="outline" className="text-xs">
              {numRows} identities × {numCols} entitlements
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={refresh}
            >
              <RefreshCw
                className={clsx("w-4 h-4 mr-1.5", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SearchBarWithParams
            searchPlaceholder="Search identities..."
            className="w-56 shrink-0"
          />
          <FiltersWithParams filters={[]} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 mb-2 border border-border rounded-lg bg-muted/30 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-200 border border-green-400" /> Approved
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-yellow-200 border border-yellow-400" /> Temporary
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-orange-200 border border-orange-400" /> High Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-400" /> Violation
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-muted border border-border" /> No Access
        </span>
      </div>

      {/* Matrix */}
      <div className="flex-1 border border-border rounded-lg overflow-hidden">
        <MatrixCanvas
          links={links}
          rowLabels={rowLabels}
          colLabels={colLabels}
          numRows={numRows}
          numCols={numCols}
          onCellClick={(row: number, col: number) => {
            setSelectedCell({ row, col });
          }}
        />
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground bg-card p-3 rounded-lg border border-border mt-2">
        {numRows} identities × {numCols} entitlements
      </div>

      {/* Cell Detail Modal */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Access Details</DialogTitle>
          </DialogHeader>
          {selectedCell && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-foreground">User</h5>
                  <p className="text-foreground">{rowLabels[selectedCell.row]}</p>
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Entitlement</h5>
                  <p className="text-foreground">{colLabels[selectedCell.col]}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Audit History
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Launch Review
                </Button>
                <Button variant="destructive" className="flex-1" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Revoke Access
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
