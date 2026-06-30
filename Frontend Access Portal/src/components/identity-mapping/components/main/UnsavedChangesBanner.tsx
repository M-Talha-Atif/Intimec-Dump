"use client";

import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnsavedChangesBannerProps {
  onDiscardChanges: () => void;
  onSaveChanges: () => void;
  isLoading?: boolean;
  isSaveDisabled?: boolean;
}

const UnsavedChangesBanner: React.FC<UnsavedChangesBannerProps> = ({
  onDiscardChanges,
  onSaveChanges,
  isLoading = false,
  isSaveDisabled = false,
}) => {
  return (
    <div className="bg-green-50 border-green-200 p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <span className="text-green-800">
          {isSaveDisabled
            ? "Please select a source and system for all mappings before saving."
            : "You have unsaved changes. Save or discard your changes."}
        </span>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          size="sm"
          variant="outline"
          onClick={onDiscardChanges}
          disabled={isLoading}
          className="text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          Discard
        </Button>
        <Button
          size="sm"
          onClick={onSaveChanges}
          disabled={isLoading || isSaveDisabled}
        >
          {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default UnsavedChangesBanner;
