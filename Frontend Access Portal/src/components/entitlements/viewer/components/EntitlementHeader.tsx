import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { AISummaryCard } from "./AISummaryCard";
import { EntitlementMetadataGrid } from "./EntitlementMetadataGrid";
import { EntitlementTags } from "./EntitlementTags";
import type { EntitlementHeaderProps } from "../types";

export const EntitlementHeader = ({
  entitlement,
  onEdit,
}: EntitlementHeaderProps) => {
  return (
    <div className="border-b p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-2xl font-bold">{entitlement.displayName}</h1>
            <Badge variant="outline" className="text-primary">
              <Eye className="h-3 w-3 mr-1" />
              Viewing
            </Badge>
          </div>

          <p className="mb-4 max-w-3xl">{entitlement.description}</p>

          <AISummaryCard entitlement={entitlement} />
          <EntitlementMetadataGrid entitlement={entitlement} />
          <EntitlementTags entitlement={entitlement} />
        </div>

        {/* Edit Button */}
        <Button onClick={onEdit} className="flex items-center space-x-2">
          <Pencil className="h-4 w-4" />
          <span>Edit Entitlement</span>
        </Button>
      </div>
    </div>
  );
};
