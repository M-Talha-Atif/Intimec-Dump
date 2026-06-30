import { Badge } from "@/components/ui/badge";
import type { Entitlement } from "../../data/mock-entitlements";

interface EntitlementTagsProps {
  entitlement: Entitlement;
}

export const EntitlementTags = ({ entitlement }: EntitlementTagsProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-slate-700">Tags:</span>
      {entitlement.classification?.map((tag, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
};
