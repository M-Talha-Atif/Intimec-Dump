import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Shield,
  ShieldOff,
  ChevronDown,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/types/application";

import ApplicationDropDown from "@/components/applications/common/MenuDropDown";

import { shortDate } from "@/utils/dateFormat";
import DetailStatusBadge from "../common/ConnectionStatusBadge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ApplicationIcon from "../common/ApplicationIcon";

function getRiskLevel(app: Application): "High" | "Medium" | "Low" {
  return app.riskLevel || "Low";
}

function getRiskBadgeClass(level: string) {
  switch (level) {
    case "High":
      return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    case "Medium":
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "Low":
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

interface ApplicationTableRowProps {
  application: Application;
  columns: {
    users?: boolean;
    orphan?: boolean;
    risky?: boolean;
    source?: boolean;
    flows?: boolean;
    lastSync?: boolean;
  };
}

export default function ApplicationTableRow({
  application,
  columns,
}: ApplicationTableRowProps) {
  const router = useRouter();
  const riskLevel = getRiskLevel(application);
  const hasOwner = application.authoritative;
  const hasWorkflows = application.flows > 0;

  return (
    <TableRow
      className={cn(
        "cursor-pointer",
        riskLevel === "High" && "bg-destructive/5 hover:bg-destructive/10",
      )}
      onClick={() => {
        router.push(`/applications/${application.id}/overview`);
      }}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <ApplicationIcon
            name={application.name}
            iconPath={application.iconPath}
          />
          <div>
            <div className="font-medium">{application.name}</div>
            <div className="text-sm text-muted-foreground">
              {application.category}
            </div>
          </div>
        </div>
      </TableCell>
      {columns.users && <TableCell>{application.users}</TableCell>}
      {columns.orphan && <TableCell>{application.orphanCount}</TableCell>}
      {columns.risky && <TableCell>{application.riskyCount}</TableCell>}
      <TableCell>
        <Badge className={cn(getRiskBadgeClass(riskLevel), "border text-xs")}>
          {riskLevel}
        </Badge>
      </TableCell>
      {columns.source && (
        <TableCell>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                {application.authoritative ? (
                  <Shield className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldOff className="h-5 w-5 text-muted-foreground" />
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {application.authoritative
                  ? "Authoritative"
                  : "Non-Authoritative"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TableCell>
      )}
      {columns.flows && (
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <span>{application.flows}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
      {columns.lastSync && (
        <TableCell>
          {shortDate(
            Math.max(
              new Date(application.lastSyncAccounts).getTime(),
              new Date(application.lastSyncEntitlements).getTime(),
            ),
          )}
        </TableCell>
      )}
      <TableCell>
        <DetailStatusBadge status={application.connectionStatus} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <CheckCircle2
                className={cn(
                  "h-3.5 w-3.5",
                  hasOwner
                    ? "text-green-600"
                    : "text-muted-foreground/30",
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Owner {hasOwner ? "Assigned" : "Missing"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleDot
                className={cn(
                  "h-3.5 w-3.5",
                  hasWorkflows
                    ? "text-green-600"
                    : "text-muted-foreground/30",
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Workflows{" "}
                {hasWorkflows ? "Configured" : "Not Configured"}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Shield
                className={cn(
                  "h-3.5 w-3.5",
                  "text-muted-foreground/30",
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Certification Inactive</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <ApplicationDropDown
          application={application}
          dotsDirection="horizontal"
          className="w-6 h-6"
        />
      </TableCell>
    </TableRow>
  );
}

export function ApplicationTableRowSkeleton({
  columns,
}: {
  columns: ApplicationTableRowProps["columns"];
}) {
  return (
    <TableRow className="cursor-not-allowed">
      <TableCell>
        <Checkbox disabled />
      </TableCell>
      <TableCell>
        <div className="flex items-center h-10 gap-3">
          <Skeleton className="w-10 h-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="w-1/3 h-4 mb-1 rounded" />
            <Skeleton className="w-1/4 h-3 rounded" />
          </div>
        </div>
      </TableCell>
      {columns.users && (
        <TableCell>
          <Skeleton className="h-4 w-8 rounded" />
        </TableCell>
      )}
      {columns.orphan && (
        <TableCell>
          <Skeleton className="h-4 w-8 rounded" />
        </TableCell>
      )}
      {columns.risky && (
        <TableCell>
          <Skeleton className="h-4 w-8 rounded" />
        </TableCell>
      )}
      {/* Risk Level */}
      <TableCell>
        <Skeleton className="h-5 w-14 rounded-full" />
      </TableCell>
      {columns.source && (
        <TableCell>
          <Skeleton className="h-5 w-5 rounded" />
        </TableCell>
      )}
      {columns.flows && (
        <TableCell>
          <Skeleton className="h-4 w-8 rounded" />
        </TableCell>
      )}
      {columns.lastSync && (
        <TableCell>
          <Skeleton className="h-4 w-24 rounded" />
        </TableCell>
      )}
      {/* Status */}
      <TableCell>
        <Skeleton className="h-5 w-24 rounded-full" />
      </TableCell>
      {/* Governance */}
      <TableCell>
        <div className="flex items-center gap-1">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
        </div>
      </TableCell>
      <TableCell>
        <span className="sr-only">loading</span>
      </TableCell>
    </TableRow>
  );
}
