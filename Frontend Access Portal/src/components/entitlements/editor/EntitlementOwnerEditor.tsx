import React, { useState, useCallback } from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  UserCircle,
  Search,
  User as UserIcon,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import useIdentities from "@/hooks/identities/useIdentities";
import { IDENTITY_ENTITY_TYPES, IdentityEntityType } from "@/constants/identity";
import { IdentityDTO, attr } from "@/types/identity";
import clsx from "clsx";

interface EntitlementOwnerEditorProps {
  entitlement: EntitlementResponseDto;
  isEditing: boolean;
  onChange: (updates: Partial<EntitlementResponseDto>) => void;
}

const IDENTITY_TYPE_MAP: Record<string, IdentityEntityType> = {
  employee: IDENTITY_ENTITY_TYPES.EMPLOYEE,
  "non-employee": IDENTITY_ENTITY_TYPES.NON_EMPLOYEE,
  "non-human": IDENTITY_ENTITY_TYPES.NON_HUMAN,
};

type IdentityTypeKey = "employee" | "non-employee" | "non-human";

const identityTypeLabels: Record<IdentityTypeKey, string> = {
  employee: "Employee",
  "non-employee": "Non-Employee",
  "non-human": "Non-Human",
};

const PAGE_SIZE = 10;

const EntitlementOwnerEditor: React.FC<EntitlementOwnerEditorProps> = ({
  entitlement,
  isEditing,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [identityType, setIdentityType] = useState<IdentityTypeKey>("employee");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZE);

  const currentOwnerId: string | null =
    typeof entitlement.attributes?.owner === "string"
      ? entitlement.attributes.owner
      : typeof entitlement.ownerId === "string"
        ? entitlement.ownerId
        : null;

  const entityType: IdentityEntityType =
    IDENTITY_TYPE_MAP[identityType] ?? IDENTITY_ENTITY_TYPES.EMPLOYEE;

  const { data: identities, pagination, isLoading, error, refresh } = useIdentities(
    entityType,
    {
      page,
      size,
      search: searchTerm,
      sort: "createdAt,desc",
    }
  );

  // Cast error to string OUTSIDE of JSX to avoid unknown leaking into ReactNode
  const errorMessage: string | null = error
    ? error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An unexpected error occurred."
    : null;

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleIdentityTypeChange = (value: string): void => {
    setIdentityType(value as IdentityTypeKey);
    setPage(0);
  };

  const handleSelectOwner = useCallback(
    (identity: IdentityDTO): void => {
      if (!isEditing) return;

      const displayName: string =
        String(attr(identity, "displayName") ?? "") ||
        `${String(attr(identity, "firstName") ?? "")} ${String(attr(identity, "lastName") ?? "")}`.trim();

      onChange({
        ownerId: identity.id,
        attributes: {
          ...entitlement.attributes,
          owner: displayName || identity.id,
        },
      });
    },
    [isEditing, onChange, entitlement.attributes]
  );

  const handleClearOwner = useCallback((): void => {
    if (!isEditing) return;
    onChange({
      ownerId: undefined,
      attributes: {
        ...entitlement.attributes,
        owner: undefined,
      },
    });
  }, [isEditing, onChange, entitlement.attributes]);

  const isSelected = (identityId: string): boolean => {
    return currentOwnerId === identityId ||
      entitlement.ownerId === identityId;
  };

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

  // Pre-render error card outside of the main JSX tree
  const errorCard: React.ReactNode = errorMessage ? (
    <Card>
      <CardContent className="py-6">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">
            Failed to load identities
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {errorMessage}
          </p>
          <Button variant="outline" size="sm" onClick={refresh}>
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCircle className="h-5 w-5" />
            <span>Choose Entitlement Owner</span>
          </CardTitle>
          <CardDescription>
            Select an identity to assign as the owner of this entitlement.
            The owner is responsible for governance, access reviews, and
            approval workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentOwnerId && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Current Owner</p>
                  <p className="text-xs text-muted-foreground">
                    {currentOwnerId}
                  </p>
                </div>
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearOwner}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                className="pl-10"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSearchChange(e.target.value)
                }
              />
            </div>
            <Select
              value={identityType}
              onValueChange={handleIdentityTypeChange}
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

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoaderCircle className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {errorMessage && !isLoading && errorCard}

          {!isLoading && !errorMessage && identities.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">
                {searchTerm
                  ? "No identities match the current search."
                  : "No identities found."}
              </p>
            </div>
          )}

          {!isLoading && !errorMessage && identities.length > 0 && (
            <>
              <ScrollArea className="rounded-md border max-h-[450px]">
                {identities.map((identity) => {
                  const selected = isSelected(identity.id);
                  const displayName = resolveDisplayName(identity);
                  const email = resolveEmail(identity);
                  const status = resolveStatus(identity);

                  return (
                    <div
                      key={identity.id}
                      onClick={() => handleSelectOwner(identity)}
                      className={clsx(
                        "flex flex-row items-center border-b select-none hover:bg-accent",
                        isEditing ? "cursor-pointer" : "cursor-default",
                        selected && "bg-primary/5"
                      )}
                    >
                      <div
                        className={clsx(
                          "flex flex-col gap-2 flex-1 p-4",
                          selected && "border-l-4 border-l-primary"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{displayName}</h4>
                          <Badge variant="outline" className="text-xs">
                            {identityTypeLabels[identityType] ?? "Employee"}
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
                      {selected && (
                        <UserIcon className="mr-4 h-5 w-5 text-primary" />
                      )}
                    </div>
                  );
                })}
              </ScrollArea>

              <CustomPagination
                useCallbackMode={true}
                totalElements={pagination.totalElements}
                totalPages={pagination.totalPages}
                page={page}
                size={size}
                defaultSize={PAGE_SIZE}
                onPageChange={(newPage) => setPage(newPage)}
                onSizeChange={(newSize) => {
                  setSize(newSize);
                  setPage(0);
                }}
                siblingCount={1}
                boundaryCount={1}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EntitlementOwnerEditor;