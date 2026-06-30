
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, BarChart3 } from 'lucide-react';

interface NonEmployeeChartDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartTitle: string;
  segmentName: string;
  segmentValue: number;
}

const segmentItems: Record<string, Array<{ name: string; type: string; sponsor: string; risk: string }>> = {
  "Contractor": [
    { name: "Alex Thompson", type: "Contractor", sponsor: "Jane Smith", risk: "Medium" },
    { name: "John Peterson", type: "Contractor", sponsor: "N/A", risk: "Critical" },
    { name: "Tom Wilson", type: "Contractor", sponsor: "Jane Smith", risk: "Low" },
  ],
  "Consultant": [
    { name: "Maria Rodriguez", type: "Consultant", sponsor: "Bob Brown", risk: "Low" },
    { name: "Sarah Kim", type: "Consultant", sponsor: "Bob Brown", risk: "Medium" },
  ],
  "Vendor": [
    { name: "David Chen", type: "Vendor", sponsor: "John Doe", risk: "High" },
    { name: "Lisa Wang", type: "Vendor", sponsor: "Former Employee", risk: "High" },
  ],
  "Critical": [
    { name: "John Peterson", type: "Contractor", sponsor: "N/A", risk: "Critical" },
    { name: "James Park", type: "Contractor", sponsor: "N/A", risk: "Critical" },
  ],
  "High": [
    { name: "David Chen", type: "Vendor", sponsor: "Carol Wilson", risk: "High" },
    { name: "Lisa Wang", type: "Vendor", sponsor: "Former Employee", risk: "High" },
    { name: "Alex Thompson", type: "Contractor", sponsor: "Jane Smith", risk: "High" },
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

export function NonEmployeeChartDrilldownModal({ open, onOpenChange, chartTitle, segmentName, segmentValue }: NonEmployeeChartDrilldownModalProps) {
  const items = segmentItems[segmentName] || [
    { name: "Example Identity", type: "Contractor", sponsor: "Manager", risk: "Medium" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
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
                <div className="text-xs text-muted-foreground mt-1">Sponsor: {item.sponsor}</div>
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
