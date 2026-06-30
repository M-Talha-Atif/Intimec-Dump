
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, UserCheck } from 'lucide-react';

interface NonEmployeeKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiLabel: string;
  kpiValue: string | number;
}

const drilldownData: Record<string, Array<{ name: string; type: string; sponsor: string; status: string; risk: string }>> = {
  "Expiring Soon": [
    { name: "Maria Rodriguez", type: "Consultant", sponsor: "Bob Brown", status: "Expiring", risk: "Medium" },
    { name: "Tom Wilson", type: "Contractor", sponsor: "Jane Smith", status: "Expiring", risk: "Low" },
    { name: "Sarah Kim", type: "Vendor", sponsor: "Carol Wilson", status: "Expiring", risk: "High" },
  ],
  "Orphaned": [
    { name: "Lisa Wang", type: "Vendor", sponsor: "Former Employee", status: "Orphaned", risk: "High" },
    { name: "James Park", type: "Contractor", sponsor: "N/A", status: "Orphaned", risk: "Critical" },
  ],
  "No Sponsor": [
    { name: "John Peterson", type: "Contractor", sponsor: "N/A", status: "Active", risk: "Critical" },
    { name: "Mike Davis", type: "Intern", sponsor: "N/A", status: "Active", risk: "High" },
  ],
  "No End Date": [
    { name: "John Peterson", type: "Contractor", sponsor: "N/A", status: "Active", risk: "Critical" },
    { name: "Alex Chen", type: "Vendor", sponsor: "Bob Brown", status: "Active", risk: "High" },
  ],
  "Excessive Access": [
    { name: "David Chen", type: "Vendor", sponsor: "Carol Wilson", status: "Active", risk: "Critical" },
    { name: "Alex Thompson", type: "Contractor", sponsor: "Jane Smith", status: "Active", risk: "High" },
  ],
  "Shared Accounts": [
    { name: "Mike Davis", type: "Intern", sponsor: "Jane Smith", status: "Active", risk: "High" },
  ],
  "Active Non-Employees": [
    { name: "Alex Thompson", type: "Contractor", sponsor: "Jane Smith", status: "Active", risk: "Medium" },
    { name: "Maria Rodriguez", type: "Consultant", sponsor: "Bob Brown", status: "Active", risk: "Low" },
    { name: "David Chen", type: "Vendor", sponsor: "John Doe", status: "Active", risk: "High" },
  ],
  "Expiring This Month": [
    { name: "Maria Rodriguez", type: "Consultant", sponsor: "Bob Brown", status: "Expiring", risk: "Medium" },
    { name: "Tom Wilson", type: "Contractor", sponsor: "Jane Smith", status: "Expiring", risk: "Low" },
  ],
  "Pending Sponsor Review": [
    { name: "Sarah Kim", type: "Consultant", sponsor: "Bob Brown", status: "Pending", risk: "Medium" },
    { name: "David Chen", type: "Vendor", sponsor: "Carol Wilson", status: "Pending", risk: "High" },
  ],
  "High Risk Profiles": [
    { name: "John Peterson", type: "Contractor", sponsor: "N/A", status: "Critical", risk: "Critical" },
    { name: "David Chen", type: "Vendor", sponsor: "Carol Wilson", status: "Active", risk: "High" },
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

export function NonEmployeeKpiDrilldownModal({ open, onOpenChange, kpiLabel, kpiValue }: NonEmployeeKpiDrilldownModalProps) {
  const items = drilldownData[kpiLabel] || drilldownData["Active Non-Employees"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {/* <UserCheck className="h-5 w-5 text-purple-500" /> */}
            {kpiLabel} — {kpiValue}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Review identities contributing to the "{kpiLabel}" metric, including their access assignments, ownership details, and governance status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mb-4 mt-4">
          <Badge variant="outline">{items.length} identities</Badge>
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
                <div className="text-xs text-muted-foreground mt-1">Sponsor: {item.sponsor} · Status: {item.status}</div>
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
