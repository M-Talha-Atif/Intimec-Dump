import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Shield,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { TabProps } from "../shared";
import useIdentityRoles from "@/hooks/identities/useIdentityRoles";
import useIdentityEntitlements from "@/hooks/identities/useIdentityEntitlements";
import CustomPagination from "@/components/applications/common/CustomPagination";

const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
  Critical: "bg-red-200 text-red-900",
};

const DESCRIPTION_TRUNCATE_LENGTH = 80;

const SERVER_SORTABLE_KEYS = new Set(["source", "assignedAt", "updatedAt"]);

const SortableHeader = ({
  children,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
}: {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentDirection: "asc" | "desc" | null;
  onSort: (key: string) => void;
}) => {
  const isActive = currentSortKey === sortKey;
  return (
    <Button variant="ghost" size="sm" onClick={() => onSort(sortKey)} className="h-8 px-2">
      {children}
      <ArrowUpDown
        className={cn(
          "ml-1 h-3.5 w-3.5",
          isActive ? "text-foreground" : "text-muted-foreground/50"
        )}
      />
      {isActive && (
        <span className="ml-0.5 text-xs text-muted-foreground">
          {currentDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </Button>
  );
};

const AccessTab: React.FC<TabProps> = ({ user }) => {
  const [rolesOpen, setRolesOpen] = useState(true);
  const [entitlementsOpen, setEntitlementsOpen] = useState(true);

  const [roleSearchQuery, setRoleSearchQuery] = useState("");

  const [entSearchRaw, setEntSearchRaw] = useState("");
  const [entSearchDebounced, setEntSearchDebounced] = useState("");

  const [entitlementPage, setEntitlementPage] = useState(0);
  const [entitlementPageSize, setEntitlementPageSize] = useState(10);

  const [entSortKey, setEntSortKey] = useState<string | null>(null);
  const [entSortDir, setEntSortDir] = useState<"asc" | "desc" | null>(null);
  const [roleSortKey, setRoleSortKey] = useState<string | null>(null);
  const [roleSortDir, setRoleSortDir] = useState<"asc" | "desc" | null>(null);

  const entityId = user.entityType || "employee";
  const identityId = user.id;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEntSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEntSearchRaw(value);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setEntSearchDebounced(value.trim());
      setEntitlementPage(0);
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const serverSort = useMemo(() => {
    if (!entSortKey || !entSortDir) return undefined;
    if (SERVER_SORTABLE_KEYS.has(entSortKey)) {
      return `${entSortKey},${entSortDir}`;
    }
    return undefined;
  }, [entSortKey, entSortDir]);

  const {
    data: rolesData,
    error: rolesError,
    isLoading: rolesLoading,
  } = useIdentityRoles(entityId, identityId);

  const {
    data: entitlementsData,
    error: entitlementsError,
    isLoading: entitlementsLoading,
  } = useIdentityEntitlements(
    entityId,
    identityId,
    entitlementPage,
    entitlementPageSize,
    entSearchDebounced || undefined,
    serverSort
  );

  const roles = rolesData?.data || [];
  const entitlements = entitlementsData?.content || [];
  const totalEntitlementPages = entitlementsData?.totalPages || 0;
  const totalEntitlementElements = entitlementsData?.totalElements || 0;

  const sortedEntitlements = useMemo(() => {
    if (!entSortKey || !entSortDir || SERVER_SORTABLE_KEYS.has(entSortKey)) {
      return entitlements;
    }

    return [...entitlements].sort((a, b) => {
      const dir = entSortDir === "asc" ? 1 : -1;
      const aVal = (a as Record<string, any>)[entSortKey];
      const bVal = (b as Record<string, any>)[entSortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * dir;
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * dir;
      }
      return 0;
    });
  }, [entitlements, entSortKey, entSortDir]);

  const filteredAndSortedRoles = useMemo(() => {
    let result = [...roles];

    if (roleSearchQuery.trim()) {
      const q = roleSearchQuery.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.roleName.toLowerCase().includes(q) ||
          r.roleDescription?.toLowerCase().includes(q) ||
          r.roleType?.toLowerCase().includes(q)
      );
    }

    if (roleSortKey && roleSortDir) {
      result.sort((a, b) => {
        const dir = roleSortDir === "asc" ? 1 : -1;
        const aVal = (a as Record<string, any>)[roleSortKey];
        const bVal = (b as Record<string, any>)[roleSortKey];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal) * dir;
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * dir;
        }
        if (typeof aVal === "boolean" && typeof bVal === "boolean") {
          return (Number(aVal) - Number(bVal)) * dir;
        }
        return 0;
      });
    }

    return result;
  }, [roles, roleSearchQuery, roleSortKey, roleSortDir]);

  const truncateText = (text: string, maxLength: number): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleRoleSort = (key: string) => {
    if (roleSortKey === key) {
      if (roleSortDir === "asc") setRoleSortDir("desc");
      else { setRoleSortKey(null); setRoleSortDir(null); }
    } else {
      setRoleSortKey(key);
      setRoleSortDir("asc");
    }
  };

  const handleEntitlementSort = (key: string) => {
    if (entSortKey === key) {
      if (entSortDir === "asc") setEntSortDir("desc");
      else { setEntSortKey(null); setEntSortDir(null); }
    } else {
      setEntSortKey(key);
      setEntSortDir("asc");
    }
    if (SERVER_SORTABLE_KEYS.has(key)) {
      setEntitlementPage(0);
    }
  };

  const handleEntitlementPageChange = useCallback((zeroBasedPage: number) => {
    setEntitlementPage(zeroBasedPage);
  }, []);

  const handleEntitlementPageSizeChange = useCallback((newSize: number) => {
    setEntitlementPageSize(newSize);
    setEntitlementPage(0);
  }, []);

  return (
    <div className="mt-4 space-y-6">

      {/* BUSINESS ROLES (Hardcoded Empty) */}
      <Collapsible defaultOpen>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Business Roles
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Business roles assigned to this identity.
                  </CardDescription>
                </div>
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
              {/* Always empty state since no backend */}
              <p className="text-muted-foreground py-4">
                No business roles assigned to this identity.
              </p>

              {/* Table structure (hidden now but keeps UI consistent for future) */}
              {false && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{/* No data */}</TableBody>
                </Table>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>


      {/* Internal ROLES */}
      <Collapsible open={rolesOpen} onOpenChange={setRolesOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Internal Roles
                    {roles.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">{roles.length}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Internal Roles assigned to this identity with their risk levels and assignment types.
                  </CardDescription>
                </div>
                {rolesOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {!rolesLoading && !rolesError && roles.length > 0 && (
                <div className="relative w-full sm:max-w-xs mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    className="pl-10"
                    value={roleSearchQuery}
                    onChange={(e) => setRoleSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {rolesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading roles...</span>
                </div>
              )}

              {rolesError && (
                <div className="flex items-center gap-2 py-4 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to load roles. Please try again.</span>
                </div>
              )}

              {!rolesLoading && !rolesError && roles.length === 0 && (
                <p className="text-muted-foreground py-4">No roles assigned to this identity.</p>
              )}

              {!rolesLoading && !rolesError && roles.length > 0 && filteredAndSortedRoles.length === 0 && (
                <p className="text-muted-foreground py-4">No roles match your search.</p>
              )}

              {!rolesLoading && !rolesError && filteredAndSortedRoles.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortableHeader sortKey="roleName" currentSortKey={roleSortKey} currentDirection={roleSortDir} onSort={handleRoleSort}>Role Name</SortableHeader></TableHead>
                      <TableHead><SortableHeader sortKey="roleType" currentSortKey={roleSortKey} currentDirection={roleSortDir} onSort={handleRoleSort}>Type</SortableHeader></TableHead>
                      <TableHead><SortableHeader sortKey="riskLevel" currentSortKey={roleSortKey} currentDirection={roleSortDir} onSort={handleRoleSort}>Risk Level</SortableHeader></TableHead>
                      <TableHead><SortableHeader sortKey="assignmentType" currentSortKey={roleSortKey} currentDirection={roleSortDir} onSort={handleRoleSort}>Assignment</SortableHeader></TableHead>
                      <TableHead><SortableHeader sortKey="permissionCount" currentSortKey={roleSortKey} currentDirection={roleSortDir} onSort={handleRoleSort}>Permissions</SortableHeader></TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead><SortableHeader sortKey="roleDescription" currentSortKey={roleSortKey} currentDirection={roleSortDir} onSort={handleRoleSort}>Description</SortableHeader></TableHead>
                      <TableHead><SortableHeader sortKey="roleActive" currentSortKey={roleSortKey} currentDirection={roleSortDir} onSort={handleRoleSort}>Status</SortableHeader></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.roleName}</TableCell>
                        <TableCell><Badge variant="outline">{role.roleType.charAt(0).toUpperCase() + role.roleType.slice(1).toLowerCase()}</Badge></TableCell>
                        <TableCell><Badge className={cn(riskColors[role.riskLevel] || riskColors["Medium"])}>{role.riskLevel}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{role.assignmentType.charAt(0).toUpperCase() + role.assignmentType.slice(1).toLowerCase()}</Badge></TableCell>
                        <TableCell>{role.permissionCount}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.tags.length > 0 ? role.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)) : <span className="text-muted-foreground text-sm">-</span>}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-default text-sm text-muted-foreground">
                                  {truncateText(role.roleDescription, DESCRIPTION_TRUNCATE_LENGTH)}
                                </span>
                              </TooltipTrigger>
                              {role.roleDescription && role.roleDescription.length > DESCRIPTION_TRUNCATE_LENGTH && (
                                <TooltipContent side="bottom" className="max-w-[400px]"><p>{role.roleDescription}</p></TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.roleActive ? "default" : "secondary"} className={role.roleActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                            {role.roleActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ENTITLEMENTS */}
      <Collapsible open={entitlementsOpen} onOpenChange={setEntitlementsOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Entitlements
                    {totalEntitlementElements > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">{totalEntitlementElements}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Technical entitlements assigned across all accounts and applications.
                  </CardDescription>
                </div>
                {entitlementsOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="relative w-full sm:max-w-xs mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entitlements..."
                  className="pl-10"
                  value={entSearchRaw}
                  onChange={handleEntSearchChange}
                />
              </div>

              {entitlementsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading entitlements...</span>
                </div>
              )}

              {entitlementsError && (
                <div className="flex items-center gap-2 py-4 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to load entitlements. Please try again.</span>
                </div>
              )}

              {!entitlementsLoading && !entitlementsError && entitlements.length === 0 && (
                <p className="text-muted-foreground py-4">
                  {entSearchDebounced ? "No entitlements match your search." : "No entitlements assigned to this identity."}
                </p>
              )}

              {!entitlementsLoading && !entitlementsError && entitlements.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead><SortableHeader sortKey="entitlementName" currentSortKey={entSortKey} currentDirection={entSortDir} onSort={handleEntitlementSort}>Entitlement</SortableHeader></TableHead>
                        <TableHead><SortableHeader sortKey="applicationName" currentSortKey={entSortKey} currentDirection={entSortDir} onSort={handleEntitlementSort}>Application</SortableHeader></TableHead>
                        <TableHead><SortableHeader sortKey="accountName" currentSortKey={entSortKey} currentDirection={entSortDir} onSort={handleEntitlementSort}>Account</SortableHeader></TableHead>
                        <TableHead><SortableHeader sortKey="kind" currentSortKey={entSortKey} currentDirection={entSortDir} onSort={handleEntitlementSort}>Kind</SortableHeader></TableHead>
                        <TableHead><SortableHeader sortKey="riskLevel" currentSortKey={entSortKey} currentDirection={entSortDir} onSort={handleEntitlementSort}>Risk Level</SortableHeader></TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead><SortableHeader sortKey="source" currentSortKey={entSortKey} currentDirection={entSortDir} onSort={handleEntitlementSort}>Source</SortableHeader></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TooltipProvider>
                        {sortedEntitlements.map((ent) => (
                          <TableRow key={ent.assignmentId}>
                            <TableCell className="font-medium">{ent.entitlementName}</TableCell>
                            <TableCell>{ent.applicationName}</TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm cursor-default">{truncateText(ent.accountName, 30)}</span>
                                </TooltipTrigger>
                                {ent.accountName.length > 30 && (
                                  <TooltipContent side="bottom" className="max-w-[500px]">
                                    <p className="font-mono text-xs">{ent.accountName}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TableCell>
                            <TableCell><Badge variant="outline">{ent.kind.charAt(0).toUpperCase() + ent.kind.slice(1).toLowerCase() || "Entitlement"}</Badge></TableCell>
                            <TableCell>
                              {ent.riskLevel ? (
                                <Badge className={cn(riskColors[ent.riskLevel] || riskColors["Medium"])}>{ent.riskLevel}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {ent.classification && ent.classification.length > 0 ? (
                                  ent.classification.map((c) => (<Badge key={c} variant="secondary" className="text-xs">{c}</Badge>))
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              {ent.description ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-default text-sm text-muted-foreground">{truncateText(ent.description, 60)}</span>
                                  </TooltipTrigger>
                                  {ent.description.length > 60 && (
                                    <TooltipContent side="bottom" className="max-w-[400px]"><p>{ent.description}</p></TooltipContent>
                                  )}
                                </Tooltip>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell><Badge variant="secondary">{ent.source.charAt(0).toUpperCase() + ent.source.slice(1).toLowerCase()}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TooltipProvider>
                    </TableBody>
                  </Table>

                  <CustomPagination
                    useCallbackMode={true}
                    totalElements={totalEntitlementElements}
                    totalPages={totalEntitlementPages}
                    page={entitlementPage}
                    size={entitlementPageSize}
                    defaultSize={10}
                    onPageChange={handleEntitlementPageChange}
                    onSizeChange={handleEntitlementPageSizeChange}
                  />
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default AccessTab;