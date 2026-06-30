import React from "react";
import { Users, Shield, Bot, Settings, AlertTriangle } from "lucide-react";

const NodeLegend: React.FC = () => {
  const legendItems = [
    {
      type: "identity",
      label: "Identity",
      color: "bg-blue-100 border-blue-500",
      icon: Users,
    },
    {
      type: "application",
      label: "Application",
      color: "bg-yellow-100 border-yellow-500",
      icon: Shield,
    },
    {
      type: "account",
      label: "Account",
      color: "bg-orange-100 border-orange-500",
      icon: Settings,
    },
    {
      type: "role",
      label: "Role",
      color: "bg-purple-100 border-purple-500",
      icon: Bot,
    },
    {
      type: "entitlement",
      label: "Entitlement",
      color: "bg-emerald-100 border-emerald-500",
      icon: Shield,
    },
    {
      type: "risk",
      label: "Risk/Conflict",
      color: "bg-red-100 border-red-500",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-1 text-xs">
      {legendItems.map(({ type, label, color, icon: Icon }) => (
        <div key={type} className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded border ${color}`} />
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default NodeLegend;
