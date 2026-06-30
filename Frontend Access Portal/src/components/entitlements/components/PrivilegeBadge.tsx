import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, ShieldCheck } from "lucide-react";
import type { BadgeLevel } from "../types/table";

export const PrivilegeBadge = ({ level }: { level: BadgeLevel }) => {
  const config = {
    Read: {
      icon: Eye,
      color: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200",
    },
    Write: {
      icon: Pencil,
      color: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
    },
    Admin: {
      icon: ShieldCheck,
      color: "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200",
    },
  };
  const { icon: Icon, color } = config[level];
  return (
    <Badge variant="outline" className={`font-normal text-xs ${color}`}>
      <Icon className="h-3 w-3 mr-1" />
      {level}
    </Badge>
  );
};
