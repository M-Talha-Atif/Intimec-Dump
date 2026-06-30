import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { SodFinding } from "@/hooks/useSodCheck";

interface SodWarningDialogProps {
  isOpen: boolean;
  findings: SodFinding[];
  onProceed: () => void;
  onCancel: () => void;
}

export const SodWarningDialog = ({ isOpen, findings, onProceed, onCancel }: SodWarningDialogProps) => {
  const getSeverityVariant = (severity: SodFinding["severity"]) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Separation of Duties Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action would create {findings.length} SoD violation{findings.length > 1 ? "s" : ""}. 
            Please review before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {findings.map((finding) => (
            <div key={finding.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{finding.policyName}</div>
                <Badge variant={getSeverityVariant(finding.severity)}>
                  {finding.severity}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{finding.description}</div>
              
              {finding.conflictingRoles && finding.conflictingRoles.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Conflicting roles: {finding.conflictingRoles.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onProceed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
