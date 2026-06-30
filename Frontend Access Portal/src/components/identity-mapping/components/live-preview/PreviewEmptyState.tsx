import React from "react";
import { Play } from "lucide-react";
import { IdentityType } from "../../data/identity-mapping";

interface PreviewEmptyStateProps {
  identityType: IdentityType;
}

export const PreviewEmptyState: React.FC<PreviewEmptyStateProps> = ({
  identityType,
}) => {
  return (
    <div className="text-center py-12">
      <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Ready to Preview
      </h3>
      <p className="text-gray-500 mb-4">
        Click &quot;Run Preview&quot; to see how your mappings will transform{" "}
        {identityType} attributes
      </p>
      <p className="text-sm text-gray-400">
        This will process a sample of data from your configured sources
      </p>
    </div>
  );
};
