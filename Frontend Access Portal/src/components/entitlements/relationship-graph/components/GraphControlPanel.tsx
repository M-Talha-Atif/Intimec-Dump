import * as React from "react";
import { Panel } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Network, GitMerge, Target } from "lucide-react";
import { ViewMode } from "../types/graph-types";

interface GraphControlPanelProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const GraphControlPanel: React.FC<GraphControlPanelProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case "direct":
        return <Target className="h-4 w-4" />;
      case "application":
        return <Network className="h-4 w-4" />;
      case "dependencies":
        return <GitMerge className="h-4 w-4" />;
    }
  };

  return (
    <Panel
      position="top-left"
      className="bg-white rounded-lg shadow-lg p-4 m-4"
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">View Mode</h4>
          <div className="flex space-x-1">
            {(["direct", "application", "dependencies"] as ViewMode[]).map(
              (mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => onViewModeChange(mode)}
                  className="flex items-center space-x-1"
                >
                  {getViewModeIcon(mode)}
                  <span className="capitalize">{mode}</span>
                </Button>
              )
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>Entitlement</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded border-solid border-2"></div>
            <span>Same Application</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded border-dashed border-2"></div>
            <span>High Risk</span>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default GraphControlPanel;
