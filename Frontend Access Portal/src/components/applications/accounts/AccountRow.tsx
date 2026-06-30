import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useState } from "react";

import AccountJsonDialog from "./AccountJsonDialog";
import { shortDate } from "@/utils/dateFormat";
import {
  accountStatusBadgeMap,
  riskBadgeMap,
  situationBadgeMap,
} from "@/components/applications/common/badgeMap";
import CustomBadge from "@/components/applications/common/CustomBadge";
import PrivilegeStatusBadge from "./Badges/PrivilegeStatusBadge";
import { AccountWithUserAndEntitlements } from "@/components/applications/types";

export default function AccountRow({
  account,
  isSelected,
  isActive,
  onSelect,
  onAccountClick,
}: {
  account: AccountWithUserAndEntitlements;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (checked: boolean) => void;
  onAccountClick: (account: AccountWithUserAndEntitlements) => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formattedLastSync = shortDate(account.lastSync || 0);

  return (
    <>
      <TableRow
        onClick={() => onAccountClick(account)}
        className={`cursor-pointer ${isActive ? "bg-muted" : ""}`}
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
        <TableCell className="font-medium">
          {account.name || "No Account Name"}
        </TableCell>
        <TableCell>{account.user?.name ?? "No Identity Found"}</TableCell>
        <TableCell>
          <CustomBadge
            color={situationBadgeMap[account.synchronizationSituation ?? "Unknown"]}
          >
            {account.synchronizationSituation ?? "—"}
          </CustomBadge>
        </TableCell>
        <TableCell>
          <CustomBadge
            color={accountStatusBadgeMap[account.status ?? "Unknown"]}
          >
            {account.status || "Unknown"}
          </CustomBadge>
        </TableCell>
        <TableCell>
          <CustomBadge
            color={riskBadgeMap[account.user?.riskLevel ?? "Unknown"]}
          >
            {account.user?.riskLevel ?? "No"}
          </CustomBadge>
        </TableCell>
        <TableCell>
          <PrivilegeStatusBadge
            isPrivileged={account.user?.isPrivileged ?? false}
          />
        </TableCell>
        <TableCell>{formattedLastSync}</TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Correlate</DropdownMenuItem>
              <DropdownMenuItem>Disable</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                View JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AccountJsonDialog
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        accountData={account}
      />
    </>
  );
}
