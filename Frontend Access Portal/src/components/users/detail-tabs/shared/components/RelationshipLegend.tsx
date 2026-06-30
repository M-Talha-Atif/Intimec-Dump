import React from "react";

const RelationshipLegend: React.FC = () => {
  const relationshipTypes = [
    {
      type: "direct",
      label: "Direct Assignment",
      color: "#10b981",
      pattern: "solid",
    },
    {
      type: "inherited",
      label: "Inherited/Indirect",
      color: "#8b5cf6",
      pattern: "dashed",
    },
    {
      type: "contains",
      label: "Contains/Provides",
      color: "#3b82f6",
      pattern: "solid",
    },
    {
      type: "conflict",
      label: "SoD Conflict",
      color: "#ef4444",
      pattern: "dashed",
    },
  ];

  return (
    <div className="space-y-1 text-xs">
      {relationshipTypes.map(({ type, label, color, pattern }) => (
        <div key={type} className="flex items-center space-x-2">
          <div
            className="w-4 h-0.5"
            style={{
              backgroundColor: pattern === "solid" ? color : "transparent",
              borderTop: pattern === "dashed" ? `2px dashed ${color}` : "none",
            }}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default RelationshipLegend;
