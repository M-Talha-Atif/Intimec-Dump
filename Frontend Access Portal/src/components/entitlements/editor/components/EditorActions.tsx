import * as React from "react";
import { Button } from "@/components/ui/button";
import { Save, X, Eye } from "lucide-react";

interface EditorActionsProps {
  hasChanges: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onPreviewImpact: () => void;
}

const EditorActions: React.FC<EditorActionsProps> = ({
  hasChanges,
  onSave,
  onCancel,
  onPreviewImpact,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        onClick={onPreviewImpact}
        className="flex items-center space-x-2"
      >
        <Eye className="h-4 w-4" />
        <span>Preview Impact</span>
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        className="flex items-center space-x-2"
      >
        <X className="h-4 w-4" />
        <span>Cancel</span>
      </Button>
      <Button
        onClick={onSave}
        disabled={!hasChanges}
        className="flex items-center space-x-2"
      >
        <Save className="h-4 w-4" />
        <span>Save Changes</span>
      </Button>
    </div>
  );
};

export default EditorActions;
