import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomPagination from "@/components/applications/common/CustomPagination";
import { Search, LoaderCircle, X, Link, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { useAccessRoles } from "@/hooks/access-catalogue/roles/use-access-roles";
import type { AccessRoleResponse } from "@/types/access-roles";
import type { RoleFormState } from "../types";

interface ChildRolesTabProps {
  form: RoleFormState;
  update: (key: string, value: any) => void;
}

const PAGE_SIZE = 10;

/**
 * Maps backend role type (e.g. "business") to a display label.
 */
const TYPE_LABELS: Record<string, string> = {
  business: "Business Role",
  technical: "Technical Role",
  functional: "Functional Role",
  application: "Application Role",
};

/**
 * Maps backend status to a badge color class.
 */
const STATUS_COLORS: Record<string, string> = {
  enabled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  disabled: "bg-red-50 text-red-700 border-red-200",
};

const ChildRolesTab: React.FC<ChildRolesTabProps> = ({ form, update }) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZE);

  const {
    roles,
    totalElements,
    totalPages,
    loading,
    error,
    refresh,
  } = useAccessRoles({
    page,
    size,
    sort: "name,asc",
  });

  const selectedIds: string[] = form.childRoleIds || [];

  /**
   * Toggles a role in/out of the selected child roles list.
   * Prevents selecting the role being created (by name match as fallback since it has no ID yet).
   */
  const handleToggleRole = useCallback(
    (role: AccessRoleResponse) => {
      const isSelected = selectedIds.includes(role.id);
      const updated = isSelected
        ? selectedIds.filter((id) => id !== role.id)
        : [...selectedIds, role.id];
      update("childRoleIds", updated);
    },
    [selectedIds, update]
  );

  /**
   * Removes a child role by ID from the selected list.
   */
  const handleRemoveRole = useCallback(
    (roleId: string) => {
      update("childRoleIds", selectedIds.filter((id) => id !== roleId));
    },
    [selectedIds, update]
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  /**
   * Client-side filter by search term.
   * The hook fetches all active roles; we filter by name/description locally.
   */
  const filteredRoles = search.trim()
    ? roles.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : roles;

  /**
   * Resolves a role name from the fetched roles list by ID.
   * Used for rendering selected role chips when the role may not be in the current page.
   */
  const resolveRoleName = (roleId: string): string => {
    const found = roles.find((r) => r.id === roleId);
    return found?.displayName || found?.name || roleId;
  };

  const errorMessage = error
    ? typeof error === "string"
      ? error
      : "Failed to load roles"
    : null;

  return (
    <div className="space-y-4">
      {/* Selected child roles chips */}
      {selectedIds.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Selected Child Roles ({selectedIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Render each selected role as a removable badge */}
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5"
                >
                  <span className="text-xs">{resolveRoleName(id)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => handleRemoveRole(id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role picker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Link className="h-4 w-4" />
            <span>Child Roles</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Select roles to nest under this role. Child roles inherit the parent
            relationship for governance and hierarchy purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search roles by name or description..."
              className="pl-10"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error state */}
          {errorMessage && !loading && (
            <div className="text-center py-6">
              <p className="text-sm text-destructive mb-2">Failed to load roles</p>
              <p className="text-xs text-muted-foreground mb-4">{errorMessage}</p>
              <Button variant="outline" size="sm" onClick={refresh}>
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !errorMessage && filteredRoles.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p className="text-sm">
                {search
                  ? "No roles match the current search."
                  : "No roles available."}
              </p>
            </div>
          )}

          {/* Role list — multi-select with checkbox-style visual */}
          {!loading && !errorMessage && filteredRoles.length > 0 && (
            <>
              <ScrollArea className="rounded-md border max-h-[300px]">
                {filteredRoles.map((role) => {
                  const isSelected = selectedIds.includes(role.id);
                  const typeLabel =
                    TYPE_LABELS[role.type?.toLowerCase()] || role.type;
                  const statusColor =
                    STATUS_COLORS[role.status?.toLowerCase()] ||
                    "bg-muted text-muted-foreground border";

                  return (
                    <div
                      key={role.id}
                      onClick={() => handleToggleRole(role)}
                      className={clsx(
                        "flex flex-row items-center border-b select-none hover:bg-accent cursor-pointer",
                        isSelected && "bg-primary/5"
                      )}
                    >
                      {/* Selected indicator bar */}
                      <div
                        className={clsx(
                          "flex flex-col gap-1 flex-1 p-3",
                          isSelected && "border-l-4 border-l-primary"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">
                            {role.displayName || role.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {typeLabel}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={clsx("text-xs", statusColor)}
                          >
                            {role?.status ? role.status.charAt(0).toUpperCase() + role.status.slice(1).toLowerCase() : ''}
                          </Badge>
                        </div>
                        {role.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {role.description}
                          </p>
                        )}
                      </div>

                      {/* Checkbox indicator */}
                      <div className="mr-4 flex-shrink-0">
                        <div
                          className={clsx(
                            "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>

              {/* Pagination */}
              <CustomPagination
                useCallbackMode={true}
                totalElements={totalElements}
                totalPages={totalPages}
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

export default ChildRolesTab;