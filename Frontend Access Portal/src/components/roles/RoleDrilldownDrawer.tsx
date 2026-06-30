import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/roles";
import { Download, ChevronDown, ChevronRight, Shield, Users, Layers, AlertTriangle, Bot } from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { cn } from "@/lib/utils";

interface RoleDrilldownDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  segmentLabel?: string;
  segmentColor?: string;
  roles: Role[];
}

const riskColorMap: Record<string, string> = {
  High: "text-destructive",
  Medium: "text-amber-600",
  Low: "text-emerald-600",
};

const classificationVariant = (c: string) => {
  if (c === "Admin Role") return "destructive" as const;
  if (c === "Privileged") return "default" as const;
  if (c === "Sensitive") return "secondary" as const;
  return "outline" as const;
};

const RoleDrilldownDrawer: React.FC<RoleDrilldownDrawerProps> = ({
  open, onOpenChange, title, description, segmentLabel, segmentColor, roles,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleExport = () => {
    const headers = ["Name", "Type", "Classification", "Owner", "Business Unit", "Users", "Entitlements", "Risk", "Last Reviewed"];
    const rows = roles.map(r => [
      r.name, r.type, r.classification ?? "", r.owner, r.businessUnit ?? "", r.userCount, r.entitlements.length, r.risk?.score ?? "—", r.lastReviewed,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_").toLowerCase()}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 h-full gap-0" style={{ minWidth: "50vw" }}>
        <div className="flex-shrink-0 px-6 py-4 border-b">
          <SheetHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {segmentColor && (
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: segmentColor }} />
                )}
                <SheetTitle className="text-lg">{segmentLabel ? `${title} — ${segmentLabel}` : title}</SheetTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
            <SheetDescription>{description}</SheetDescription>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="text-xs">{roles.length} role{roles.length !== 1 ? "s" : ""}</Badge>
              {roles.filter(r => r.risk?.score === "High").length > 0 && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3" /> {roles.filter(r => r.risk?.score === "High").length} high risk
                </Badge>
              )}
            </div>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-2">
            {roles.map(role => {
              const isExpanded = expandedId === role.id;
              const riskyCount = role.entitlements.filter(e => e.isRisky).length;

              return (
                <div key={role.id} className="rounded-lg border bg-card">
                  {/* Main row */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : role.id)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{role.name}</p>
                        <Badge variant="outline" className="text-[10px]">{role.type}</Badge>
                        <Badge variant={classificationVariant(role.classification)} className="text-[10px]">{role.classification}</Badge>
                        <Badge variant={role.status === "Enabled" ? "secondary" : "destructive"} className="text-[10px]">{role.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {role.userCount} users</span>
                        <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {role.entitlements.length} entitlements</span>
                        <span>Owner: {role.owner}</span>
                        {role.businessUnit && <span>{role.businessUnit}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {role.risk?.score && (
                        <div className="flex items-center gap-1">
                          <Shield className={cn("h-3.5 w-3.5", riskColorMap[role.risk.score])} />
                          <span className={cn("text-xs font-medium", riskColorMap[role.risk.score])}>{role.risk.score}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
                      {/* Stats row */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{role.userCount}</p>
                          <p className="text-[10px] text-muted-foreground">Total Users</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{role.inactiveUserCount ?? 0}</p>
                          <p className="text-[10px] text-muted-foreground">Inactive</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{role.entitlements.length}</p>
                          <p className="text-[10px] text-muted-foreground">Entitlements</p>
                        </div>
                        <div className="rounded-md bg-background p-2 text-center">
                          <p className="text-lg font-bold text-foreground">{riskyCount}</p>
                          <p className="text-[10px] text-muted-foreground">High Risk</p>
                        </div>
                      </div>

                      {/* Description & AI summary */}
                      {role.description && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                          <p className="text-xs text-foreground">{role.description}</p>
                        </div>
                      )}
                      {role.aiSummary && (
                        <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 p-2">
                          <Bot className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-800 dark:text-blue-300">{role.aiSummary}</p>
                        </div>
                      )}

                      {/* Entitlements list */}
                      {role.entitlements.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Entitlements</p>
                          <div className="space-y-1">
                            {role.entitlements.map(ent => (
                              <div key={ent.id} className="flex items-center justify-between rounded border bg-background px-2.5 py-1.5">
                                <div className="flex items-center gap-2">
                                  {ent.isRisky && <span className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />}
                                  <span className="text-xs font-medium">{ent.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{ent.application}</span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn("text-[10px]",
                                    ent.privilegeLevel === "Admin" && "border-destructive text-destructive",
                                    ent.privilegeLevel === "Write" && "border-amber-500 text-amber-600",
                                    ent.privilegeLevel === "Read" && "border-blue-500 text-blue-600",
                                  )}
                                >
                                  {ent.privilegeLevel ?? "—"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
                        <span>Last reviewed: {role.lastReviewed}</span>
                        {role.lastReviewedBy && <span>by {role.lastReviewedBy}</span>}
                        {role.backupOwner && <span>Backup: {role.backupOwner}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {roles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No roles in this segment.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default RoleDrilldownDrawer;
