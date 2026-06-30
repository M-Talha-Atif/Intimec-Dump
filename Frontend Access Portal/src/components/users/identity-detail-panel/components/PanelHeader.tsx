import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Key, UserX, ShieldAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { type User } from "@/data/mock-users";
import { statusColors } from "../constants";
import { getActiveDelegation } from "@/types/delegation";

interface PanelHeaderProps {
  user: User;
  onClose: () => void;
}

export function PanelHeader({ user, onClose }: PanelHeaderProps) {
  const activeDelegation = getActiveDelegation(user.id);

  return (
    <div className="p-6 border-b">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <Badge
              className={cn("text-xs font-bold", statusColors[user.status])}
            >
              {user.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {user.department} • {user.type}
          </p>
          {user.manager && (
            <p className="text-sm text-muted-foreground">
              Manager: {user.manager}
            </p>
          )}

          {/* Active Delegation Indicator */}
          {activeDelegation && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Acting On Behalf: {activeDelegation.delegateName}
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Delegation active until{" "}
                {activeDelegation.endDate || "indefinite"}
              </p>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {user.isPrivileged && (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            <Key className="mr-1.5 h-3 w-3" />
            Privileged
          </Badge>
        )}
        {user.isOrphan && (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <UserX className="mr-1.5 h-3 w-3" />
            Orphan
          </Badge>
        )}
        {user.riskLevel === "High" && (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <ShieldAlert className="mr-1.5 h-3 w-3" />
            High Risk
          </Badge>
        )}
      </div>
    </div>
  );
}
