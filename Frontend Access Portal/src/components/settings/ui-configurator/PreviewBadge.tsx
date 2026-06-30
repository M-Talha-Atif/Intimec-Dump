import React from "react";

interface PreviewBadgeProps {
  children: React.ReactNode;
  mode: boolean;
}

const PreviewBadge: React.FC<PreviewBadgeProps> = ({ children, mode }) => {
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded ${
        mode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"
      }`}
    >
      {children}
    </span>
  );
};

export default PreviewBadge;