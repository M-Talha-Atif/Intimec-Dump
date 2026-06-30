import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditTrailHeaderProps {
  onExport: () => void;
}

export const AuditTrailHeader = ({ onExport }: AuditTrailHeaderProps) => {
  return (
    <Button
      onClick={onExport}
      variant="outline"
      className="flex items-center space-x-2"
    >
      <Download className="h-4 w-4" />
      <span>Export</span>
    </Button>
  );
};
