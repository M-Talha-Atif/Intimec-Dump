"use client";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Clock,
  Database,
  ArrowRight,
  AlertTriangle,
  Shield,
  GitCompare,
  Layers,
} from "lucide-react";
import { AuditEntry, MappingDetail, CorrelationCondition } from "../../data/audit-trail";
import { getActionBadge, formatTimestamp } from "../../utils/audit-trail-utils";

interface AuditDetailSheetProps {
  entry: AuditEntry | null;
  onClose: () => void;
}

function isCorrelation(entry: AuditEntry): boolean {
  return (entry.entryType || "").toLowerCase().includes("correlation");
}

function RiskBadge({ risk }: { risk?: string }) {
  if (!risk) return null;
  const r = risk.toLowerCase();
  const cls =
    r === "high" ? "bg-red-100 text-red-800 border-red-200"
    : r === "medium" ? "bg-orange-100 text-orange-800 border-orange-200"
    : "bg-green-100 text-green-800 border-green-200";
  return <Badge variant="outline" className={`text-xs ${cls}`}>{risk.charAt(0).toUpperCase() + risk.slice(1)} Risk</Badge>;
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const s = status.toLowerCase();
  const cls = s === "failure" || s === "failed"
    ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";
  return <Badge className={`text-xs ${cls}`}>{status}</Badge>;
}

function AttributeMappingTable({
  rows,
  title,
  dimmed,
}: {
  rows: MappingDetail[];
  title: string;
  dimmed?: boolean;
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className={dimmed ? "opacity-60" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs">
              <th className="text-left px-3 py-2 font-medium">Identity Attribute</th>
              <th className="text-left px-3 py-2 font-medium">Source Expression</th>
              <th className="text-left px-3 py-2 font-medium">Transformation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2 font-mono text-xs">{row.identity}</td>
                <td className="px-3 py-2 font-mono text-xs text-blue-700">{row.source}</td>
                <td className="px-3 py-2">
                  {row.transformation ? (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                      {row.transformation.toUpperCase()}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Direct</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CorrelationTable({
  rows,
  title,
  dimmed,
}: {
  rows: CorrelationCondition[];
  title: string;
  dimmed?: boolean;
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className={dimmed ? "opacity-60" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground text-xs">
              <th className="text-left px-3 py-2 font-medium">Identity Field</th>
              <th className="text-center px-3 py-2 font-medium">Operator</th>
              <th className="text-left px-3 py-2 font-medium">Account Field</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2 font-mono text-xs text-teal-700">{row.field}</td>
                <td className="px-3 py-2 text-center">
                  <Badge variant="outline" className="text-xs">{row.operator}</Badge>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-blue-700">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const AuditDetailSheet: React.FC<AuditDetailSheetProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const raw = entry.rawEntry;
  const isCorr = isCorrelation(entry);
  const hasDiff = (entry.stateBefore?.length ?? 0) > 0 && (entry.stateAfter?.length ?? 0) > 0;
  const hasAfter = (entry.stateAfter?.length ?? 0) > 0;

  return (
    <Sheet open={!!entry} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            {getActionBadge(entry.action)}
            <Badge variant="outline" className="text-xs">
              {entry.entryType || "Identity Mapping"}
            </Badge>
            <RiskBadge risk={raw?.risk} />
            <StatusBadge status={raw?.status} />
          </div>
          <SheetTitle className="text-lg mt-2">{entry.mapping}</SheetTitle>
          <SheetDescription>{entry.changes}</SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatTimestamp(entry.timestamp)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <div>
                <span className="font-medium text-foreground">{entry.user}</span>
                {entry.userRole && (
                  <span className="text-xs ml-1 text-muted-foreground">· {entry.userRole}</span>
                )}
              </div>
            </div>
            {entry.sourceSystem && entry.sourceSystem !== "System" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-4 w-4 shrink-0" />
                <span>{entry.sourceSystem}</span>
              </div>
            )}
            {raw?.objectId && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-4 w-4 shrink-0" />
                <span className="font-mono text-xs truncate">{raw.objectId}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Impact */}
          {entry.impact > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
              <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {entry.impact} mapping{entry.impact !== 1 ? "s" : ""} affected
                </p>
                <p className="text-xs text-orange-600">
                  All identities with accounts from this source may be re-correlated on next sync.
                </p>
              </div>
            </div>
          )}

          {/* Security classification */}
          {raw?.risk && raw.risk.toLowerCase() !== "none" && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Shield className="h-5 w-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">IGA Risk Classification: {raw.risk}</p>
                <p className="text-xs text-blue-600">
                  Mapping changes can affect identity correlation accuracy and access provisioning.
                </p>
              </div>
            </div>
          )}

          {/* Before / After comparison */}
          {hasDiff ? (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <GitCompare className="h-4 w-4" /> Before / After
              </div>
              <div className="grid grid-cols-1 gap-4">
                {isCorr ? (
                  <>
                    <CorrelationTable
                      rows={entry.stateBefore as CorrelationCondition[]}
                      title="Before"
                      dimmed
                    />
                    <div className="flex justify-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CorrelationTable
                      rows={entry.stateAfter as CorrelationCondition[]}
                      title="After"
                    />
                  </>
                ) : (
                  <>
                    <AttributeMappingTable
                      rows={entry.stateBefore as MappingDetail[]}
                      title="Before"
                      dimmed
                    />
                    <div className="flex justify-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <AttributeMappingTable
                      rows={entry.stateAfter as MappingDetail[]}
                      title="After"
                    />
                  </>
                )}
              </div>
            </>
          ) : hasAfter ? (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <GitCompare className="h-4 w-4" /> Saved Configuration
              </div>
              {isCorr ? (
                <CorrelationTable
                  rows={entry.stateAfter as CorrelationCondition[]}
                  title="Correlation Conditions"
                />
              ) : (
                <AttributeMappingTable
                  rows={entry.stateAfter as MappingDetail[]}
                  title="Attribute Mappings"
                />
              )}
            </>
          ) : null}

          {/* Error details if any */}
          {raw?.errorDetails && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">Error Details</p>
                <pre className="text-xs bg-red-50 border border-red-200 rounded p-3 whitespace-pre-wrap break-all">
                  {raw.errorDetails}
                </pre>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
