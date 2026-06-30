import { Eye, EyeOff, Lock, Shield } from "lucide-react";

export const getSensitivityColor = (sensitivity: string) => {
  const colors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return colors[sensitivity as keyof typeof colors];
};

export const getAccessIcon = (access: string) => {
  const icons = {
    visible: Eye,
    masked: EyeOff,
    redacted: Lock,
    hidden: Shield,
  };
  return icons[access as keyof typeof icons] || null;
};

export const formatRoleName = (role: string): string => {
  return role.replace("-", " ");
};
