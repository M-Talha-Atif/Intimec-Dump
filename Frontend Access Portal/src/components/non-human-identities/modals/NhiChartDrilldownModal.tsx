
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, BarChart3 } from 'lucide-react';

interface NhiChartDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartTitle: string;
  segmentName: string;
  segmentValue: number;
}

const segmentItems: Record<string, Array<{ name: string; type: string; owner: string; risk: string }>> = {
  "Service Accounts": [
    { name: "prod-db-service", type: "Service Account", owner: "Platform Team", risk: "Medium" },
    { name: "ci-cd-runner-sa", type: "Service Account", owner: "DevOps Team", risk: "Low" },
    { name: "monitoring-sa", type: "Service Account", owner: "Infrastructure", risk: "Low" },
    { name: "backup-sa", type: "Service Account", owner: "Infrastructure", risk: "Medium" },
  ],
  "API Keys": [
    { name: "github-api-token", type: "API Key", owner: "DevOps Team", risk: "Medium" },
    { name: "stripe-api-key", type: "API Key", owner: "Finance", risk: "High" },
    { name: "sendgrid-key", type: "API Key", owner: "Marketing", risk: "Low" },
  ],
  "Certificates": [
    { name: "k8s-cluster-cert", type: "Certificate", owner: "Infrastructure", risk: "Low" },
    { name: "tls-wildcard", type: "Certificate", owner: "Security Team", risk: "Medium" },
  ],
  "Azure AD": [
    { name: "azure-sp-prod", type: "Service Principal", owner: "Platform Team", risk: "High" },
    { name: "azure-managed-id", type: "Managed Identity", owner: "DevOps Team", risk: "Low" },
    { name: "azure-app-reg", type: "App Registration", owner: "Engineering", risk: "Medium" },
  ],
  "AWS IAM": [
    { name: "lambda-exec-role", type: "IAM Role", owner: "DevOps Team", risk: "Medium" },
    { name: "s3-backup-user", type: "IAM User", owner: "Infrastructure", risk: "Low" },
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

export function NhiChartDrilldownModal({ open, onOpenChange, chartTitle, segmentName, segmentValue }: NhiChartDrilldownModalProps) {
  const items = segmentItems[segmentName] || [
    { name: "example-nhi-1", type: "Service Account", owner: "Platform Team", risk: "Medium" },
    { name: "example-nhi-2", type: "API Key", owner: "DevOps Team", risk: "Low" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            {chartTitle} — {segmentName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mb-4">
          <Badge variant="outline">{segmentValue} total</Badge>
          <Badge variant="secondary">{items.length} shown</Badge>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.name}</span>
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Owner: {item.owner}</div>
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
