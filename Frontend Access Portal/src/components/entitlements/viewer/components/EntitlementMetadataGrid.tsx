import { Badge } from "@/components/ui/badge";
import { FileText, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRiskColor, getLifecycleColor } from "../utils";
import type { Entitlement } from "../../data/mock-entitlements";

interface EntitlementMetadataGridProps {
  entitlement: Entitlement;
}

export const EntitlementMetadataGrid = ({
  entitlement,
}: EntitlementMetadataGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      <div className="flex items-center space-x-3">
        <FileText className="h-4 w-4 text-slate-500" />
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Application
          </div>
          <div className="font-medium">{entitlement.application}</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Target className="h-4 w-4 text-slate-500" />
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            Type
          </div>
          <div className="font-medium">{entitlement.type || "Standard"}</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Badge
          variant="outline"
          className={cn(
            "px-2 py-1",
            getRiskColor(entitlement.riskLevel || entitlement.risk || "low")
          )}
        >
          {(entitlement.riskLevel || entitlement.risk || "low").toUpperCase()}{" "}
          RISK
        </Badge>
      </div>

      <div className="flex items-center space-x-3">
        <Badge
          variant="outline"
          className={cn(getLifecycleColor(entitlement.lifecycle || "Inactive"))}
        >
          {entitlement.lifecycle}
        </Badge>
      </div>
    </div>
  );
};
