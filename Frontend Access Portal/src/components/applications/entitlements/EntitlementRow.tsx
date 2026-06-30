import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, AlertTriangle, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import CustomBadge from "@/components/applications/common/CustomBadge";
import { riskBadgeMap } from "@/components/applications/common/badgeMap";
import { EntitlementWithUsersMeta } from "@/components/applications/types";

interface EntitlementRowProps {
  item: EntitlementWithUsersMeta;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (checked: boolean) => void;
  onEntitlementClick: (item: EntitlementWithUsersMeta) => void;
}

export default function EntitlementRow({
  item,
  isSelected,
  isActive,
  onSelect,
  onEntitlementClick,
}: EntitlementRowProps) {
  return (
    <TableRow
      onClick={() => onEntitlementClick(item)}
      className={`cursor-pointer ${isActive ? "bg-muted/50" : ""}`}
    >
      <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            aria-label="Select row"
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{item.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {item.type || "entitlement"}
        </Badge>
      </TableCell>
      <TableCell>
        {item.riskLevel ? (
          <CustomBadge color={riskBadgeMap[item.riskLevel] || "gray"}>
            {item.riskLevel}
          </CustomBadge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        {item.classification && item.classification.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.classification.slice(0, 2).map((c) => (
              <Badge
                key={c}
                variant={c === "High Risk" ? "destructive" : "outline"}
                className="text-xs"
              >
                {c}
              </Badge>
            ))}
            {item.classification.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.classification.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>
      <TableCell>
        {item.requestable ? (
          <span className="text-green-600 text-sm font-medium">Yes</span>
        ) : (
          <span className="text-muted-foreground text-sm">No</span>
        )}
      </TableCell>
      <TableCell>
        {item.owner ? (
          <span className="text-sm underline">{item.owner}</span>
        ) : (
          <Badge className="bg-red-100/60 text-red-800 border border-red-200 hover:bg-red-100 text-xs gap-1">
            <AlertTriangle className="h-3 w-3" />
            Unowned
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-center font-medium">
        {item.assignedUsersCount > 0 ? (
          item.assignedUsersCount
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEntitlementClick(item)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>Trigger Review</DropdownMenuItem>
            <DropdownMenuItem>Assign Owner</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
