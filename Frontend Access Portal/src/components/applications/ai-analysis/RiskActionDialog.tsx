import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AIRiskCard } from "@/types/ai-analysis";
import { CheckCircle } from "lucide-react";

type PreviewMitigationData = {
  changes: string[];
  affectedUsers: string[];
  riskReduction: string;
  workflowType: string;
  estimatedTime: string;
};

export default function RiskActionDialog({
  riskCard,
  onClose,
}: {
  riskCard: AIRiskCard;
  onClose: () => void;
}) {
  const getMitigationPreview = (
    riskCard: AIRiskCard
  ): PreviewMitigationData => {
    return {
      changes: [
        `Disable ${riskCard.affectedIdentities.length} orphan accounts`,
        `Remove ${riskCard.affectedObjects.length} unused entitlements`,
        "Update governance policies",
      ],
      affectedUsers: riskCard.affectedIdentities,
      riskReduction: riskCard.riskReduction,
      workflowType: riskCard.workflowAttached
        ? "Automated Workflow"
        : "Manual Review",
      estimatedTime: "2-4 hours",
    };
  };

  return (
    <Dialog open={!!riskCard} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview Mitigation - {riskCard.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Changes to be Applied</h4>
            <ul className="text-sm space-y-1">
              {getMitigationPreview(riskCard).changes.map((change, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm mb-1">Affected Users</h5>
              <p className="text-sm text-gray-600">
                {riskCard.affectedIdentities.length} users
              </p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-1">Risk Reduction</h5>
              <p className="text-sm text-green-600 font-medium">
                {riskCard.riskReduction}
              </p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-1">Workflow Type</h5>
              <p className="text-sm text-gray-600">
                {getMitigationPreview(riskCard).workflowType}
              </p>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-1">Estimated Time</h5>
              <p className="text-sm text-gray-600">
                {getMitigationPreview(riskCard).estimatedTime}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button className="flex-1">Execute Now</Button>
            <Button variant="outline" className="flex-1">
              Schedule for Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
