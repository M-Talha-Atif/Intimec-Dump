import React from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  MoreHorizontal,
  ClipboardList,
  Edit,
  Activity,
  Download,
  Trash2,
} from "lucide-react";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { Application } from "@/types/application";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";
import useDeleteApplication from "@/hooks/applications/useDeleteApplication";

interface ApplicationDropDownProps extends React.HTMLAttributes<HTMLButtonElement> {
  application: Application;
  dotsDirection?: "horizontal" | "vertical";
}

export default function ApplicationDropDown({
  application,
  dotsDirection,
  className = "",
  ...props
}: ApplicationDropDownProps) {
  const { showApplicationAuditLog, showApplicationExport } =
    useApplicationContext();
  const router = useRouter();
  const t = useTranslations("application.dropdown");
  const { deleteApplication } = useDeleteApplication(application.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {dotsDirection === "horizontal" ? (
          <Button
            variant="ghost"
            size="icon"
            className={clsx("h-10 w-10 ", className)}
            {...props}
          >
            <MoreHorizontal className="h-8 w-8" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-6 w-6 ">
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/applications/${application.id}/tasks`);
          }}
          className="flex items-center space-x-2"
        >
          <ClipboardList className="h-4 w-4" />
          <span>{t("tasks")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/applications/${application.id}/edit`);
          }}
          className="flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>{t("edit")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            showApplicationAuditLog(application);
          }}
          className="flex items-center space-x-2"
        >
          <Activity className="h-4 w-4" />
          <span>{t("view-audit-logs")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            showApplicationExport(application);
          }}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>{t("export-application")}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ConfirmActionDialog
          title={t("delete-modal.title")}
          description={t("delete-modal.description")}
          confirmText={t("delete-modal.confirm-text")}
          cancelText={t("delete-modal.cancel-text")}
          confirmAction={async () => { await deleteApplication(); }}
          destructive={true}
        >
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t("delete")}</span>
          </DropdownMenuItem>
        </ConfirmActionDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
