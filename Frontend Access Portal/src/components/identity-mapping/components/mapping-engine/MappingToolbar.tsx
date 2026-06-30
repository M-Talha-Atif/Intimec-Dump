import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AIMappingAssistant } from "../../AIMappingAssistant";
import { useMappingContext } from "../../context/MappingContext";

export const MappingToolbar: React.FC = () => {
  const { addSystemMapping, setSyncAllModal } = useMappingContext();

  const handleAddMapping = () => {
    // Use the new system mapping function if available, fallback to old one
    if (addSystemMapping) {
      addSystemMapping();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <AIMappingAssistant />
      <Button
        onClick={() => setSyncAllModal(true)}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Sync All</span>
      </Button>
      <Button
        onClick={handleAddMapping}
        className="flex items-center space-x-2"
      >
        <Plus className="h-4 w-4" />
        <span>Add Mapping</span>
      </Button>
    </div>
  );
};
