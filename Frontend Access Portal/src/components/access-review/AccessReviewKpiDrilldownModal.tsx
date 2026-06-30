import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download } from "lucide-react";
import { getRiskBadgeClass } from "@/utils/getRiskColor";
import { cn } from "@/lib/utils";

interface DrilldownItem {
  id: string;
  campaign: string;
  item: string;
  risk: "low" | "medium" | "high" | "critical";
  status: string;
  reviewer: string;
  dueDate: string;
}

interface AccessReviewKpiDrilldownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  items: DrilldownItem[];
}

export const AccessReviewKpiDrilldownModal = ({
  open,
  onOpenChange,
  title,
  description,
  items,
}: AccessReviewKpiDrilldownModalProps) => {
  const handleExport = () => {
    const headers = ["Campaign", "Item", "Risk", "Status", "Reviewer", "Due Date"];
    const rows = items.map((i) => [i.campaign, i.item, i.risk, i.status, i.reviewer, i.dueDate]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl">{title}</DialogTitle>
                  <DialogDescription>
                    {description || `Detailed breakdown of ${title.toLowerCase()} with ${items.length} items.`}
                  </DialogDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0 mr-4 mb-4">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 pt-4 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 px-3 font-medium text-muted-foreground">Campaign</th>
                      <th className="py-2 px-3 font-medium text-muted-foreground">Item</th>
                      <th className="py-2 px-3 font-medium text-muted-foreground">Risk</th>
                      <th className="py-2 px-3 font-medium text-muted-foreground">Status</th>
                      <th className="py-2 px-3 font-medium text-muted-foreground">Reviewer</th>
                      <th className="py-2 px-3 font-medium text-muted-foreground">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50 cursor-pointer">
                        <td className="py-2 px-3 font-medium">{item.campaign}</td>
                        <td className="py-2 px-3">{item.item}</td>
                        <td className="py-2 px-3">
                          <Badge className={cn(getRiskBadgeClass(item.risk), "border text-xs")}>
                            {item.risk}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">{item.status}</td>
                        <td className="py-2 px-3">{item.reviewer}</td>
                        <td className="py-2 px-3">{item.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No items found</div>
                )}
                <div className="text-xs text-muted-foreground">
                  Showing {items.length} items
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
