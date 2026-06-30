import * as React from "react";
import { Panel } from "@xyflow/react";
import { Zap } from "lucide-react";
import { Entitlement } from "../../data/mock-entitlements";

interface GraphAIInsightsProps {
  entitlement: Entitlement;
}

const GraphAIInsights: React.FC<GraphAIInsightsProps> = ({ entitlement }) => {
  const isHighRisk =
    entitlement.riskLevel === "High" || entitlement.risk === "High";

  if (!isHighRisk) return null;

  return (
    <Panel
      position="bottom-left"
      className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-lg p-4 m-4 max-w-sm"
    >
      <div className="flex items-start space-x-2">
        <Zap className="h-4 w-4 text-red-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-red-800">AI Risk Alert</h4>
          <p className="text-xs text-red-700 mt-1">
            This high-risk entitlement requires careful monitoring and regular
            review.
          </p>
        </div>
      </div>
    </Panel>
  );
};

export default GraphAIInsights;
