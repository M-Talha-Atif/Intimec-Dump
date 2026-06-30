import { Bot } from "lucide-react";
import type { Entitlement } from "../../data/mock-entitlements";

interface AISummaryCardProps {
  entitlement: Entitlement;
}

export const AISummaryCard = ({ entitlement }: AISummaryCardProps) => {
  return (
    <div className="border  rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-900 mb-1">
            AI-generated Summary
          </h3>
          <p className="text-sm text-blue-800">
            This entitlement provides read access to {entitlement.application}{" "}
            with moderate business impact.
          </p>
        </div>
      </div>
    </div>
  );
};
