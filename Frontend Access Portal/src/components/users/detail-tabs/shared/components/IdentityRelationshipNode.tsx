import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import {
  Users,
  Shield,
  Settings,
  Bot,
  AlertTriangle,
  Circle,
} from "lucide-react";

interface NodeData {
  label: string;
  type:
    | "identity"
    | "application"
    | "account"
    | "role"
    | "entitlement"
    | "risk";
  subLabel?: string;
  riskLevel?: "low" | "medium" | "high";
  conflicts?: number;
}

const getNodeIcon = (type: NodeData["type"]) => {
  switch (type) {
    case "identity":
      return Users;
    case "application":
      return Shield;
    case "account":
      return Settings;
    case "role":
      return Bot;
    case "entitlement":
      return Shield;
    case "risk":
      return AlertTriangle;
    default:
      return Circle;
  }
};

const getNodeColor = (type: NodeData["type"], riskLevel?: string) => {
  if (riskLevel === "high" || type === "risk") {
    return "bg-red-100 border-red-500 text-red-900";
  }
  if (riskLevel === "medium") {
    return "bg-orange-100 border-orange-500 text-orange-900";
  }

  switch (type) {
    case "identity":
      return "bg-blue-100 border-blue-500 text-blue-900";
    case "application":
      return "bg-yellow-100 border-yellow-500 text-yellow-900";
    case "account":
      return "bg-orange-100 border-orange-500 text-orange-900";
    case "role":
      return "bg-purple-100 border-purple-500 text-purple-900";
    case "entitlement":
      return "bg-emerald-100 border-emerald-500 text-emerald-900";
    default:
      return "bg-gray-100 border-gray-500 text-gray-900";
  }
};

const IdentityRelationshipNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as NodeData;
  const Icon = getNodeIcon(nodeData.type);
  const colorClass = getNodeColor(nodeData.type, nodeData.riskLevel);

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg border-2 min-w-[160px] shadow-md",
        colorClass
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{nodeData.label}</div>
          {nodeData.subLabel && (
            <div className="text-xs opacity-75">{nodeData.subLabel}</div>
          )}
          {nodeData.conflicts && nodeData.conflicts > 0 && (
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {nodeData.conflicts} conflict{nodeData.conflicts > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default IdentityRelationshipNode;
