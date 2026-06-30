import * as React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Eye,
  Bot,
  LayoutDashboard,
  ShieldCheck,
  Link,
  AlertTriangle,
  Users,
  History,
  Target,
  FileText,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EntitlementOverviewViewer from "./viewer/EntitlementOverviewViewer";
import EntitlementAttributesViewer from "./viewer/EntitlementAttributesViewer";
import EntitlementRelationshipsViewer from "./viewer/EntitlementRelationshipsViewer";
import EntitlementScriptingViewer from "./viewer/EntitlementScriptingViewer";
import EntitlementRiskViewer from "./viewer/EntitlementRiskViewer";
import EntitlementHistoryViewer from "./viewer/EntitlementHistoryViewer";
import EntitlementMembersViewer from "./viewer/EntitlementMembersViewer";
import IconTabs from "@/components/shared/IconTabs";

interface EntitlementViewerProps {
  entitlement: EntitlementResponseDto;
  allEntitlements: EntitlementResponseDto[];
  onEdit: () => void;
  onSelectEntitlement: (entitlement: EntitlementResponseDto) => void;
}

const EntitlementViewer: React.FC<EntitlementViewerProps> = ({
  entitlement,
  allEntitlements,
  onEdit,
  onSelectEntitlement,
}) => {

  const getRiskColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case "HIGH": return "bg-destructive/10 text-destructive border-destructive/20";
      case "MEDIUM": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400";
      case "LOW": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400";
      default: return "bg-muted text-muted-foreground";
    }
  };
  // REAL: riskLevel from API. MOCK fallback: "Low" when null
  const riskLabel = entitlement.riskLevel ?? "Low";

  // kindg -> attributes.type -> objectClass
  const typeLabel =
    entitlement.kind ??
    entitlement.attributes?.type ??
    entitlement.objectClass ??
    "Standard";

  // REAL: resourceName from API.
  const applicationLabel = entitlement.resourceName ?? "-";

  return (
    <div className="space-y-0">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              {/* REAL: displayName */}
              <h1 className="text-2xl font-bold text-slate-900">
                {entitlement.displayName}
              </h1>
              <Badge
                variant="outline"
                className="border-blue-300 bg-blue-50 text-blue-700"
              >
                <Eye className="h-3 w-3 mr-1" />
                Viewing
              </Badge>
            </div>

            {/* REAL: description */}
            <p className="text-slate-600 mb-4 max-w-3xl">
              {entitlement.description}
            </p>

            {/* AI summary - MOCK: static text, replace with AI endpoint when available */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    AI-generated Summary
                  </h3>
                  {/* MOCK: AI summary - replace with real AI summary field when API supports it */}
                  <p className="text-sm text-blue-800">
                    This entitlement provides access to {applicationLabel} with{" "}
                    {riskLabel.toLowerCase()} business impact.
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {/* REAL: resourceName */}
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Resource
                  </div>
                  <div className="font-medium">{"hello" + applicationLabel}</div>
                </div>
              </div>

              {/* REAL: attributes.type or objectClass */}
              <div className="flex items-center space-x-3">
                <Target className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Type
                  </div>
                  <div className="font-medium">{typeLabel}</div>
                </div>
              </div>

              {/* REAL: riskLevel (null -> "Low") */}
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Risk
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("px-2 py-0.5 mt-0.5 font-normal", getRiskColor(riskLabel))}
                  >
                    {riskLabel.charAt(0).toUpperCase() + riskLabel.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* REAL: lifecycle */}
              <div className="flex items-center space-x-3">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Status
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      entitlement.lifecycle === "Active"
                        ? "mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 font-normal"
                        : "mt-0.5 px-2 py-0.5 bg-muted text-muted-foreground border-border font-normal"
                    }
                  >
                    {entitlement.lifecycle ?? "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* REAL: classification (null -> empty array handled) */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-slate-700">Tags:</span>
              {(entitlement.classification ?? []).length > 0 ? (
                entitlement.classification!.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-400">Unclassified</span>
              )}
            </div>
          </div>

          <Button onClick={onEdit} className="flex items-center space-x-2">
            <Pencil className="h-4 w-4" />
            <span>Edit Entitlement</span>
          </Button>
        </div>
      </div>

      {/* Tabs - all tabs kept, mock data preserved inside each viewer */}
      <Tabs defaultValue="overview">
        <div>
          <IconTabs
            columns={7}
            tabs={[
              { value: "overview", label: "Overview", icon: LayoutDashboard },
              { value: "attributes", label: "Attributes", icon: ShieldCheck },
              { value: "relationships", label: "Relationships", icon: Link },
              { value: "members", label: "Members", icon: Users },
              { value: "scripting", label: "Scripting", icon: Code },
              { value: "risk", label: "Risk Analysis", icon: AlertTriangle },
              { value: "history", label: "History", icon: History },
            ]}
          />
        </div>
        <div>
          <TabsContent value="overview" className="mt-4">
            <EntitlementOverviewViewer entitlement={entitlement} />
          </TabsContent>
          <TabsContent value="attributes" className="mt-4">
            <EntitlementAttributesViewer entitlement={entitlement} />
          </TabsContent>
          <TabsContent value="relationships" className="mt-4">
            <EntitlementRelationshipsViewer
              entitlement={entitlement}
              allEntitlements={allEntitlements}
              onSelectEntitlement={onSelectEntitlement}
            />
          </TabsContent>
          <TabsContent value="members" className="mt-4">
            <EntitlementMembersViewer entitlement={entitlement} />
          </TabsContent>
          <TabsContent value="scripting" className="mt-4">
            <EntitlementScriptingViewer entitlement={entitlement} />
          </TabsContent>
          <TabsContent value="risk" className="mt-4">
            <EntitlementRiskViewer entitlement={entitlement} />
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <EntitlementHistoryViewer entitlement={entitlement} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default EntitlementViewer;