import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { Role } from "@/types/roles";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomPagination from "@/components/applications/common/CustomPagination";
import CustomBadge from "@/components/applications/common/CustomBadge";
import { userStatusBadgeMap } from "@/components/applications/common/badgeMap";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  UserCircle,
  Search,
  User as UserIcon,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import useIdentities from "@/hooks/identities/useIdentities";
import useIdentity from "@/hooks/identities/useIdentity";
import { IDENTITY_ENTITY_TYPES, IdentityEntityType } from "@/constants/identity";
import { IdentityDTO, attr } from "@/types/identity";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

interface RoleOwnersEditorProps {
  role: Role;
  onChange: (updates: Partial<Role>) => void;
}

type IdentityTypeKey = "employee" | "non-employee" | "non-human";

const IDENTITY_TYPE_MAP: Record<string, IdentityEntityType> = {
  employee: IDENTITY_ENTITY_TYPES.EMPLOYEE,
  "non-employee": IDENTITY_ENTITY_TYPES.NON_EMPLOYEE,
  "non-human": IDENTITY_ENTITY_TYPES.NON_HUMAN,
};

const identityTypeLabels: Record<IdentityTypeKey, string> = {
  employee: "Employee",
  "non-employee": "Non-Employee",
  "non-human": "Non-Human",
};

const OWNER_PAGE_SIZE = 10;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RoleOwnersEditor: React.FC<RoleOwnersEditorProps> = ({ role, onChange }) => {
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerIdentityType, setOwnerIdentityType] = useState<IdentityTypeKey>("employee");
  const [ownerPage, setOwnerPage] = useState(0);
  const [ownerSize, setOwnerSize] = useState(OWNER_PAGE_SIZE);
  const [delegationEnabled, setDelegationEnabled] = useState(true);

  const currentOwnerId: string = (role as any).ownerId || role.owner || "";

  // Detect if the stored owner field is a raw UUID (needs identity resolution)
  const isOwnerUuid = role.owner ? UUID_REGEX.test(role.owner) : false;
  const resolveEntityType = isOwnerUuid ? IDENTITY_ENTITY_TYPES.EMPLOYEE : null;

  const {
    data: ownerIdentity,
    isLoading: ownerIdentityLoading,
  } = useIdentity(resolveEntityType, isOwnerUuid ? role.owner : null);

  // Resolved display name for the currently-selected owner
  const ownerDisplayName = useMemo(() => {
    if (!role.owner) return "Unassigned";
    if (!isOwnerUuid) return role.owner;
    if (ownerIdentityLoading) return null;
    if (!ownerIdentity?.coreAttributes) return `${role.owner.substring(0, 8)}…`;
    const core = ownerIdentity.coreAttributes;
    return core.displayName
      ? String(core.displayName)
      : core.firstName || core.lastName
        ? `${String(core.firstName ?? "")} ${String(core.lastName ?? "")}`.trim()
        : core.username
          ? String(core.username)
          : core.email
            ? String(core.email)
            : `${role.owner.substring(0, 8)}…`;
  }, [role.owner, isOwnerUuid, ownerIdentityLoading, ownerIdentity]);

  const ownerEntityType: IdentityEntityType =
    IDENTITY_TYPE_MAP[ownerIdentityType] ?? IDENTITY_ENTITY_TYPES.EMPLOYEE;

  const {
    data: ownerIdentities,
    pagination: ownerPagination,
    isLoading: ownerListLoading,
    error: ownerError,
    refresh: ownerRefresh,
  } = useIdentities(ownerEntityType, {
    page: ownerPage,
    size: ownerSize,
    search: ownerSearch,
    sort: "createdAt,desc",
  });

  const ownerErrorMessage: string | null = ownerError
    ? ownerError instanceof Error
      ? ownerError.message
      : typeof ownerError === "string"
        ? ownerError
        : "An unexpected error occurred."
    : null;

  const resolveDisplayName = (identity: IdentityDTO): string => {
    const display = attr(identity, "displayName");
    if (display) return String(display);
    const first = String(attr(identity, "firstName") ?? "");
    const last = String(attr(identity, "lastName") ?? "");
    const full = `${first} ${last}`.trim();
    return full || identity.id;
  };

  const resolveEmail = (identity: IdentityDTO): string => {
    const email = attr(identity, "email");
    return email ? String(email) : "";
  };

  const resolveStatus = (identity: IdentityDTO): string => {
    return identity.status ? String(identity.status) : "ACTIVE";
  };

  const handleSelectOwner = useCallback(
    (identity: IdentityDTO) => {
      const displayName = resolveDisplayName(identity);
      onChange({
        owner: displayName || identity.id,
        ownerId: identity.id,
      } as any);
    },
    [onChange]
  );

  const handleClearOwner = useCallback(() => {
    onChange({ owner: "", ownerId: "" } as any);
  }, [onChange]);

  const handleOwnerSearchChange = (value: string) => {
    setOwnerSearch(value);
    setOwnerPage(0);
  };

  const handleOwnerIdentityTypeChange = (value: string) => {
    setOwnerIdentityType(value as IdentityTypeKey);
    setOwnerPage(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <UserCircle className="h-4 w-4" />
            <span>Role Owner</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Select an identity to assign as the owner of this role. The owner is
            responsible for governance, access reviews, and approval workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentOwnerId && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">
                    {ownerDisplayName === null ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      ownerDisplayName
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(role as any).ownerId || role.owner}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearOwner}
                className="text-destructive hover:text-destructive"
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                className="pl-10"
                value={ownerSearch}
                onChange={(e) => handleOwnerSearchChange(e.target.value)}
              />
            </div>
            <Select
              value={ownerIdentityType}
              onValueChange={handleOwnerIdentityTypeChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select an Identity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Identity Type</SelectLabel>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="non-employee">Non-Employee</SelectItem>
                  <SelectItem value="non-human">Non-Human</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {ownerListLoading && (
            <div className="flex items-center justify-center py-8">
              <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {ownerErrorMessage && !ownerListLoading && (
            <div className="text-center py-6">
              <p className="text-sm text-destructive mb-2">Failed to load identities</p>
              <p className="text-xs text-muted-foreground mb-4">{ownerErrorMessage}</p>
              <Button variant="outline" size="sm" onClick={ownerRefresh}>
                Retry
              </Button>
            </div>
          )}

          {!ownerListLoading && !ownerErrorMessage && ownerIdentities.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">
                {ownerSearch
                  ? "No identities match the current search."
                  : "No identities found."}
              </p>
            </div>
          )}

          {!ownerListLoading && !ownerErrorMessage && ownerIdentities.length > 0 && (
            <>
              <ScrollArea className="rounded-md border max-h-[300px]">
                {ownerIdentities.map((identity) => {
                  const selected = currentOwnerId === identity.id;
                  const displayName = resolveDisplayName(identity);
                  const email = resolveEmail(identity);
                  const status = resolveStatus(identity);

                  return (
                    <div
                      key={identity.id}
                      onClick={() => handleSelectOwner(identity)}
                      className={clsx(
                        "flex flex-row items-center border-b select-none hover:bg-accent cursor-pointer",
                        selected && "bg-primary/5"
                      )}
                    >
                      <div
                        className={clsx(
                          "flex flex-col gap-2 flex-1 p-3",
                          selected && "border-l-4 border-l-primary"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{displayName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {identityTypeLabels[ownerIdentityType] ?? "Employee"}
                          </Badge>
                          <CustomBadge
                            color={
                              status === "ACTIVE"
                                ? userStatusBadgeMap["Active"]
                                : userStatusBadgeMap["Inactive"]
                            }
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                          </CustomBadge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {email || "No email available"}
                        </div>
                      </div>
                      {selected && <UserIcon className="mr-4 h-5 w-5 text-primary" />}
                    </div>
                  );
                })}
              </ScrollArea>

              <CustomPagination
                useCallbackMode={true}
                totalElements={ownerPagination.totalElements}
                totalPages={ownerPagination.totalPages}
                page={ownerPage}
                size={ownerSize}
                defaultSize={OWNER_PAGE_SIZE}
                onPageChange={(newPage) => setOwnerPage(newPage)}
                onSizeChange={(newSize) => {
                  setOwnerSize(newSize);
                  setOwnerPage(0);
                }}
                siblingCount={1}
                boundaryCount={1}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Governance Settings
            </CardTitle>
            <InfoTooltip text="Configure approval, certification, and delegation policies for this role." />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Approval Workflow</Label>
              <Select
                value={(role as any).approvalWorkflow || "single"}
                onValueChange={(v) => onChange({ approvalWorkflow: v } as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md">
                  <SelectItem value="single">Single Approval</SelectItem>
                  <SelectItem value="dual">Dual Approval</SelectItem>
                  <SelectItem value="manager-then-owner">Manager then Owner</SelectItem>
                  <SelectItem value="auto">Auto-Approve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certification Schedule</Label>
              <Select
                value={(role as any).certSchedule || "quarterly"}
                onValueChange={(v) => onChange({ certSchedule: v } as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <Label>Requestable</Label>
              <p className="text-xs text-muted-foreground">
                Allow users to request this role through the Access Portal
              </p>
            </div>
            <Switch
              checked={(role as any).requestable ?? false}
              onCheckedChange={(v) => onChange({ requestable: v } as any)}
            />
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              Delegation Settings
              <InfoTooltip text="Configure whether the role owner can delegate certification reviews." />
            </h4>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Allow owner to delegate reviews</p>
                <p className="text-xs text-muted-foreground">
                  Owner can assign certification tasks to team members.
                </p>
              </div>
              <Switch checked={delegationEnabled} onCheckedChange={setDelegationEnabled} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Auto-escalate on missed deadline</p>
                <p className="text-xs text-muted-foreground">
                  Escalate to backup owner if review is overdue by 7+ days.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Require justification for changes</p>
                <p className="text-xs text-muted-foreground">
                  Owner must provide reason when modifying entitlements.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleOwnersEditor;
