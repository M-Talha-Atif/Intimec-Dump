import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { PrivilegeBadge } from "./PrivilegeBadge";
import { LifecycleBadge } from "./LifecycleBadge";
import { AiInsightBadge } from "./AiInsightBadge";
import { classificationVariantMap } from "../data/classification";
import type { Entitlement } from "../data/mock-entitlements";

interface EntitlementRowProps {
  entitlement: Entitlement;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEntitlementSelect: (entitlement: Entitlement) => void;
}

export const EntitlementRow = ({
  entitlement,
  isSelected,
  onSelect,
  onEntitlementSelect,
}: EntitlementRowProps) => {
  return (
    <TableRow
      key={entitlement.id}
      data-state={isSelected ? "selected" : ""}
      onClick={() => onEntitlementSelect(entitlement)}
      className="cursor-pointer"
    >
      <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          onCheckedChange={(checked) => onSelect(entitlement.id, !!checked)}
          checked={isSelected}
          aria-label={`Select row ${entitlement.displayName}`}
        />
      </TableCell>
      <TableCell className="font-medium whitespace-nowrap">
        {entitlement.application}
      </TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">
        {entitlement.attribute}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{entitlement.displayName}</span>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {entitlement.privilegeLevel && (
              <PrivilegeBadge level={entitlement.privilegeLevel} />
            )}
            {entitlement.lifecycle && (
              <LifecycleBadge lifecycle={entitlement.lifecycle} />
            )}
            {entitlement.aiInsightTags?.map((tag) => (
              <AiInsightBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge variant="outline">{entitlement.type}</Badge>
      </TableCell>
      <TableCell
        className="max-w-[200px] truncate"
        title={entitlement.description}
      >
        {entitlement.description}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {entitlement.owner ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer underline-dashed">
                {entitlement.owner}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>View {entitlement.owner}&apos;s profile</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Badge
            variant="destructive"
            className="bg-red-100/60 text-red-800 border-red-200"
          >
            <AlertTriangle className="mr-1 h-3.5 w-3.5" />
            Unowned
          </Badge>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-center">
        {entitlement.assignedUsersCount !== undefined ? (
          <div className="flex items-center justify-center gap-1.5 text-slate-600">
            <Users className="h-4 w-4" />
            <span>{entitlement.assignedUsersCount}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {entitlement.lastUsed ? (
          <div className="flex items-center gap-1.5 text-slate-600">
            <CalendarDays className="h-4 w-4" />
            <span>{format(new Date(entitlement.lastUsed), "MMM d, yyyy")}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </TableCell>
      <TableCell>
        {entitlement.requestable ? (
          <Badge
            variant="outline"
            className="text-green-600 border-green-600/50 bg-green-50"
          >
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Requestable
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-slate-600 border-slate-600/50 bg-slate-50"
          >
            <XCircle className="mr-1 h-3.5 w-3.5" />
            Not Requestable
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {entitlement.classification.length > 0 ? (
            entitlement.classification.map((c) => (
              <Badge key={c} variant={classificationVariantMap[c] || "default"}>
                {c}
              </Badge>
            ))
          ) : (
            <span className="text-slate-400 text-xs">Unclassified</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
