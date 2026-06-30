"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Maximize2,
  Minimize2,
  GitBranch,
  ArrowRight,
  AlertTriangle,
  Download,
} from "lucide-react";

interface GraphControlsProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  viewMode: "hierarchy" | "direct" | "conflicts";
  onViewModeChange: (mode: "hierarchy" | "direct" | "conflicts") => void;
  filters: Record<string, boolean>;
  onFilterChange: (filterKey: string) => void;
  onExport: (format: "png" | "json") => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  isExpanded,
  onToggleExpanded,
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  onExport,
}) => {
  const getViewModeIcon = (mode: string) => {
    switch (mode) {
      case "hierarchy":
        return <GitBranch className="h-4 w-4" />;
      case "direct":
        return <ArrowRight className="h-4 w-4" />;
      case "conflicts":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <GitBranch className="h-4 w-4" />;
    }
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Graph Controls</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            title={isExpanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-2">
            View Mode
          </label>
          <div className="flex space-x-1">
            {(["hierarchy", "direct", "conflicts"] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => onViewModeChange(mode)}
                className="text-xs"
              >
                {getViewModeIcon(mode)}
                <span className="ml-1 capitalize">{mode}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-3" />

        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-2">
            Show/Hide
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => onFilterChange(key)}
                  className="rounded"
                />
                <span className="capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Separator className="my-3" />

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-2">
            Export
          </label>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("json")}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport("png")}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              PNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphControls;
