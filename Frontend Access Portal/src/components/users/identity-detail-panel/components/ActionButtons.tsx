import React from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  UserCog,
  Clock,
  UserX,
  History,
  Eye,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type User } from "@/data/mock-users";
import { exportData } from "@/lib/exportUtils";
import { useIdentityPanelContext } from "../context/IdentityPanelContext";

interface ActionButtonsProps {
  user: User;
}

export function ActionButtons({ user }: ActionButtonsProps) {
  const {
    setResetPasswordOpen,
    setReassignManagerOpen,
    setDelegationOpen,
    setTerminateAccessOpen,
    setIsAuditModalOpen,
    handleQuickNavigation,
  } = useIdentityPanelContext();

  return (
    <div className="px-6 pb-6">
      {/* Primary Actions */}
      <div className="flex gap-2 flex-wrap  pt-2">
        <Button size="sm" onClick={() => setResetPasswordOpen(true)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Password
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setReassignManagerOpen(true)}
        >
          <UserCog className="w-4 h-4 mr-2" />
          Reassign Manager
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDelegationOpen(true)}
        >
          <Clock className="w-4 h-4 mr-2" />
          Delegation
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setTerminateAccessOpen(true)}
        >
          <UserX className="w-4 h-4 mr-2" />
          Terminate Access
        </Button>
      </div>

      {/* Secondary Actions */}
      <div className="mt-4 pt-4 border-t flex gap-2  flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuickNavigation("activity")}
        >
          <History className="w-4 h-4 mr-2" />
          View Change Log
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsAuditModalOpen(true)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Audit Visibility
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportData(user, "json")}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData(user, "xml")}>
              Export as XML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
