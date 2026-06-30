import React from "react";
import { Button } from "@/components/ui/button";
import { TreePine, List, Download, Plus } from "lucide-react";
import { FEATURES } from "../data/delegatedAdministrationData";
import { useDelegatedAdministrationContext } from "../contexts/DelegatedAdministrationContext";

interface DelegatedAdministrationHeaderProps {
  onExportJSON: () => void;
  onCreateDelegate: () => void;
}

export const DelegatedAdministrationHeader: React.FC<
  DelegatedAdministrationHeaderProps
> = ({ onExportJSON, onCreateDelegate }) => {
  const { viewMode, setViewMode } = useDelegatedAdministrationContext();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Delegated Administration</h2>
        <p className="text-gray-600">
          Manage scoped administrative access for distributed teams
        </p>
      </div>
      <div className="flex items-center gap-3">
        {FEATURES.delegation.hierarchical && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "tree" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("tree")}
            >
              <TreePine className="h-4 w-4 mr-1" />
              Tree View
            </Button>
            <Button
              variant={viewMode === "legacy" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("legacy")}
            >
              <List className="h-4 w-4 mr-1" />
              Legacy Cards
            </Button>
            <Button variant="outline" size="sm" onClick={onExportJSON}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        )}
        <Button onClick={onCreateDelegate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Delegation
        </Button>
      </div>
    </div>
  );
};
