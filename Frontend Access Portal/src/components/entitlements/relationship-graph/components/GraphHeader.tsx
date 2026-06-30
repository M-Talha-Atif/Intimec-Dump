import * as React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Minimize2, KeyRound } from "lucide-react";
import { Entitlement } from "../../data/mock-entitlements";

interface GraphHeaderProps {
  entitlement: Entitlement;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const GraphHeader: React.FC<GraphHeaderProps> = ({
  entitlement,
  isExpanded,
  onToggleExpanded,
}) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          {/* <KeyRound className="h-5 w-5" /> */}
          <span>Entitlement Relationships - UML View</span>
          <Badge variant="outline">{entitlement.displayName}</Badge>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onToggleExpanded}>
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default GraphHeader;
