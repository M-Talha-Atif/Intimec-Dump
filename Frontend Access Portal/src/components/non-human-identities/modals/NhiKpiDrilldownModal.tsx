
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Bot, Key, Shield, Clock, AlertTriangle } from 'lucide-react';

interface NhiKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiLabel: string;
  kpiValue: string;
}

const drilldownData: Record<string, Array<{ name: string; type: string; owner: string; status: string; risk: string }>> = {
  "Total NHIs": [
    { name: "prod-db-service", type: "Service Account", owner: "Platform Team", status: "Active", risk: "Medium" },
    { name: "github-api-token", type: "API Key", owner: "DevOps Team", status: "Active", risk: "Low" },
    { name: "k8s-cluster-cert", type: "Certificate", owner: "Infrastructure", status: "Active", risk: "Low" },
    { name: "azure-app-secret", type: "Secret", owner: "Security Team", status: "Active", risk: "Medium" },
    { name: "ci-cd-runner-sa", type: "Service Account", owner: "DevOps Team", status: "Active", risk: "Low" },
  ],
  "Dormant NHIs": [
    { name: "old-monitoring-sa", type: "Service Account", owner: "Former Employee", status: "Dormant", risk: "High" },
    { name: "staging-api-key", type: "API Key", owner: "QA Team", status: "Dormant", risk: "Medium" },
    { name: "temp-cert-dev", type: "Certificate", owner: "Unknown", status: "Dormant", risk: "Critical" },
    { name: "legacy-webhook", type: "API Key", owner: "Unassigned", status: "Dormant", risk: "High" },
  ],
  "Long-lived Credentials": [
    { name: "admin-token-prod", type: "OAuth Token", owner: "DevOps Team", status: "Active", risk: "Critical" },
    { name: "legacy-api-key", type: "API Key", owner: "Unassigned", status: "Active", risk: "High" },
    { name: "backup-service-cert", type: "Certificate", owner: "Infrastructure", status: "Active", risk: "High" },
  ],
  "Exposed Secrets": [
    { name: "hardcoded-db-pass", type: "Secret", owner: "Engineering", status: "Exposed", risk: "Critical" },
    { name: "leaked-api-key", type: "API Key", owner: "DevOps Team", status: "Exposed", risk: "Critical" },
  ],
  "Orphaned NHIs": [
    { name: "departed-user-sa", type: "Service Account", owner: "N/A", status: "Orphaned", risk: "High" },
    { name: "old-project-cert", type: "Certificate", owner: "N/A", status: "Orphaned", risk: "Medium" },
    { name: "unused-oauth-token", type: "OAuth Token", owner: "N/A", status: "Orphaned", risk: "High" },
  ],
  "Risk Score": [
    { name: "prod-db-service", type: "Service Account", owner: "Platform Team", status: "Active", risk: "Critical" },
    { name: "admin-token-prod", type: "OAuth Token", owner: "DevOps Team", status: "Active", risk: "High" },
    { name: "legacy-api-key", type: "API Key", owner: "Unassigned", status: "Dormant", risk: "High" },
  ],
};

const riskColor = (risk: string) => {
  switch (risk) {
    case 'Critical': return 'bg-red-100 text-red-800';
    case 'High': return 'bg-orange-100 text-orange-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-green-100 text-green-800';
  }
};

export function NhiKpiDrilldownModal({ open, onOpenChange, kpiLabel, kpiValue }: NhiKpiDrilldownModalProps) {
  const items = drilldownData[kpiLabel] || drilldownData["Total NHIs"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <Bot className="h-5 w-5 text-orange-500" /> */}
            {kpiLabel} — {kpiValue}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Explore the underlying Non-Human Identities contributing to the "{kpiLabel}" metric, including credential types, ownership, lifecycle status, and associated risk levels.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mb-4 mt-4">
          <Badge variant="outline">{items.length} identities shown</Badge>
          <Badge variant="secondary">Filtered view</Badge>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.name}</span>
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Owner: {item.owner} · Status: {item.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={riskColor(item.risk)}>{item.risk}</Badge>
                <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
