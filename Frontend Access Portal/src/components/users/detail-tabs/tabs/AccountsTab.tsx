import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AppWindow,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Database,
  KeyRound,
  Eye,
  ShieldOff,
  Dna,
  Users,
  Shield,
  Key,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useIdentityShadows from "@/hooks/identities/useIdentityShadows";
import useEntitlementsByShadow from "@/hooks/identities/useEntitlementsByShadow";
import { ShadowDTO, EntitlementDTO } from "@/types/identity";
import {
  TabProps,
  TabCard,
  ExpandableRow,
  useExpandableRows,
  UnifiedAccount,
} from "../shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTs(ts: string | number | null | undefined): string {
  if (!ts) return "—";
  // Handle epoch seconds (< 10^11) — multiply to get millis
  const val = typeof ts === 'number' && ts < 100_000_000_000 ? ts * 1000 : ts;
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
}

function syncSituationLabel(sit: string): { label: string; active: boolean } {
  switch (sit) {
    case "LINKED": return { label: "Linked", active: true };
    case "UNLINKED": return { label: "Unlinked", active: false };
    case "DISPUTED": return { label: "Disputed", active: false };
    case "NOT_SERVER": return { label: "Not in IGA", active: false };
    case "DELETED": return { label: "Deleted", active: false };
    default: return { label: sit, active: false };
  }
}

function riskBadgeClass(level: string | null | undefined): string {
  switch ((level ?? "").toUpperCase()) {
    case "HIGH": return "bg-red-100 text-red-800";
    case "MEDIUM": return "bg-orange-100 text-orange-800";
    case "LOW": return "bg-green-100 text-green-800";
    default: return "bg-slate-100 text-slate-700";
  }
}

function attrValueToString(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

const GROUP_ATTR_KEYS = ["memberOf", "groups", "groupMembership", "memberOfGroups"];
// Attributes hidden from the attributes table (shown elsewhere or irrelevant)
const HIDDEN_FROM_TABLE = new Set(["applicationName", ...GROUP_ATTR_KEYS]);

// ---------------------------------------------------------------------------
// AccessRow — unified type for entitlements catalog + group memberships
// ---------------------------------------------------------------------------

interface AccessRow {
  id: string;
  objectType: string;
  name: string;
  riskLevel: string | null;
  source: string;
  description: string | null;
}

/**
 * Resolves a human-readable access type label.
 * `objectClass` (ConnID standard) is the most reliable discriminator.
 * Falls back to `entitlementType` (Entitlement.kind) when objectClass is absent.
 * Both may be "entitlement" when the connector didn't emit a type — that's fine,
 * it just means the import source (e.g. CSV connector) didn't specify a kind column.
 */
function resolveObjectType(ent: EntitlementDTO): string {
  const oc = (ent.objectClass ?? "").toUpperCase();
  if (oc === "__GROUP__") return "Group";
  if (oc === "__ROLE__") return "Role";
  if (oc === "__PERMISSION__") return "Permission";
  if (oc === "__PRIVILEGE__") return "Privilege";
  if (oc === "__ACCOUNT__") return "Account";
  // Fall back to kind field
  const kind = (ent.entitlementType ?? "").toLowerCase();
  if (kind === "group") return "Group";
  if (kind === "role") return "Role";
  if (kind === "permission") return "Permission";
  if (kind === "privilege") return "Privilege";
  return "Entitlement";
}

/**
 * Maps a ShadowEntitlementDto (backend projection) to a display row.
 * Groups in AD/LDAP are modeled as entitlements in the IGA catalog
 * (objectClass = __GROUP__) so they already appear here — no need to
 * parse shadow.attributes.groups separately.
 */
function entitlementToRow(ent: EntitlementDTO, idx: number): AccessRow {
  return {
    id: ent.assignmentId ?? ent.entitlementId ?? `ent-${idx}`,
    objectType: resolveObjectType(ent),
    name: ent.entitlementName || "—",
    riskLevel: ent.riskLevel,
    source: ent.source || "Direct Assignment",
    description: null,
  };
}

// ---------------------------------------------------------------------------
// Assigned Access section — catalog entitlements + group memberships merged
// ---------------------------------------------------------------------------

const AssignedAccessSection: React.FC<{ shadow: ShadowDTO; isExpanded: boolean }> = ({
  shadow,
  isExpanded,
}) => {
  const [hideLowRisk, setHideLowRisk] = useState(false);
  const [showOnlyRoles, setShowOnlyRoles] = useState(false);

  const { data: entitlements, isLoading, error } = useEntitlementsByShadow(shadow.id, isExpanded);

  if (!isExpanded) return null;

  let allRows: AccessRow[] = entitlements.map(entitlementToRow);

  if (hideLowRisk)
    allRows = allRows.filter(
      (r) => (r.riskLevel ?? "").toUpperCase() !== "LOW" && r.riskLevel !== null
    );
  if (showOnlyRoles)
    allRows = allRows.filter((r) => r.objectType.toUpperCase() === "ROLE");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Group": return Users;
      case "Role": return Shield;
      case "Permission": return Key;
      default: return KeyRound;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Assigned Access in Application</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="hide-low-risk"
                checked={hideLowRisk}
                onCheckedChange={setHideLowRisk}
              />
              <Label htmlFor="hide-low-risk" className="text-sm">Hide Low Risk</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-only-roles"
                checked={showOnlyRoles}
                onCheckedChange={setShowOnlyRoles}
              />
              <Label htmlFor="show-only-roles" className="text-sm">Show Only Roles</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading access data...
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 py-4">Failed to load access data.</div>
        ) : allRows.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No access objects match the current filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Object Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Assignment Source</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRows.map((row) => {
                const TypeIcon = getTypeIcon(row.objectType);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{row.objectType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{row.name}</TableCell>
                    <TableCell>
                      {row.riskLevel ? (
                        <Badge
                          variant="secondary"
                          className={cn("uppercase", riskBadgeClass(row.riskLevel))}
                        >
                          {row.riskLevel}
                        </Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell>{row.source}</TableCell>
                    <TableCell className="text-slate-600">{row.description || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// Expanded detail panel
// ---------------------------------------------------------------------------

const ShadowDetailPanel: React.FC<{ shadow: ShadowDTO; isExpanded: boolean }> = ({
  shadow,
  isExpanded,
}) => {
  const { label: syncLabel, active: syncActive } = syncSituationLabel(
    shadow.synchronizationSituation
  );
  const appMeta = shadow._appMeta ?? null;
  const provisionedFrom = appMeta
    ? appMeta.isAuthoritative
      ? "IGA Orchestrator (Authoritative)"
      : "External Sync"
    : null;

  // Group keys are shown in Assigned Access — exclude from the attributes table
  const attrEntries = Object.entries(shadow.attributes || {}).filter(
    ([k]) => !HIDDEN_FROM_TABLE.has(k)
  );

  return (
    <div className="p-6 bg-slate-50/50 border-t">
      <div className="space-y-6">

        {/* Account Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {/* <Database className="h-5 w-5" /> */}
              Account Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Account ID</label>
                  <p className="text-sm font-mono break-all">{shadow.resourceUid || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Created At</label>
                  <p className="text-sm">{formatTs(shadow.metadata?.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Synchronized</label>
                  <p className="text-sm">{formatTs(shadow.metadata?.lastSynchronizedAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Modified</label>
                  <p className="text-sm">{formatTs(shadow.metadata?.updatedAt)}</p>
                </div>
                {provisionedFrom && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Provisioned From</label>
                    <p className="text-sm">{provisionedFrom}</p>
                  </div>
                )}
              </div>
              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Object Class</label>
                  <p className="text-sm font-mono">{shadow.objectClass || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={syncActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}
                    >
                      {syncLabel}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Account Type</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 capitalize">
                      {shadow.kind || "Account"}
                    </Badge>
                  </div>
                </div>
                {appMeta?.ownerName && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Owner</label>
                    <p className="text-sm flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {appMeta.ownerName}
                    </p>
                  </div>
                )}
                {appMeta?.riskLevel && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">App Risk Level</label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 font-normal capitalize ${appMeta.riskLevel === "High"
                            ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400"
                            : appMeta.riskLevel === "Medium"
                              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                      >
                        {appMeta.riskLevel}
                      </Badge>
                    </div>
                  </div>
                )}
                {appMeta?.connectorId && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Connector ID</label>
                    <p className="text-sm font-mono">{appMeta.connectorId}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity Attributes in Target Application */}
        {attrEntries.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {/* <Dna className="h-5 w-5 text-blue-600" /> */}
                Identity Attributes in Target Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Attribute</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attrEntries.map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono text-slate-700">{key}</TableCell>
                      <TableCell className="text-slate-600 break-all">{attrValueToString(val)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
            <Clock className="h-4 w-4" />
            No target system attributes synced yet for this account.
          </div>
        )}

        {/* Assigned Access — entitlements catalog + group memberships merged */}
        <AssignedAccessSection shadow={shadow} isExpanded={isExpanded} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Map shadow to table row shape
// ---------------------------------------------------------------------------

function shadowToAccount(shadow: ShadowDTO): UnifiedAccount {
  const isActive = shadow.synchronizationSituation === "LINKED";
  const lastSync = shadow.metadata?.lastSynchronizedAt
    ? formatTs(shadow.metadata.lastSynchronizedAt)
    : "Never";
  return {
    id: shadow.id,
    appName: (shadow.attributes?.applicationName as string) || shadow.resourceId,
    accountName: shadow.resourceUid || shadow.id,
    status: isActive ? "Active" : "Disabled",
    lastSync,
  };
}

// ---------------------------------------------------------------------------
// Account row — 7 columns: toggle | Application | Account | Status | Risk | Last Sync | Actions
// ---------------------------------------------------------------------------

const AccountRow: React.FC<{
  shadow: ShadowDTO;
  account: UnifiedAccount;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ shadow, account, isExpanded, onToggle }) => {
  const riskLevel = shadow._appMeta?.riskLevel ?? null;

  return (
    <ExpandableRow
      isExpanded={isExpanded}
      onToggle={onToggle}
      expandedContent={
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7} className="p-0">
            <ShadowDetailPanel shadow={shadow} isExpanded={isExpanded} />
          </TableCell>
        </TableRow>
      }
    >
      <TableCell className="font-medium">
        <div className="flex items-center">
          <AppWindow className="h-4 w-4 mr-2 text-muted-foreground" />
          {account.appName}
        </div>
      </TableCell>
      <TableCell>{account.accountName}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            account.status === "Active"
              ? "px-2 py-0.5 font-normal bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "px-2 py-0.5 font-normal bg-muted text-muted-foreground border-border"
          }
        >
          {account.status}
        </Badge>
      </TableCell>

      <TableCell>
        {riskLevel ? (
          <Badge
            variant="outline"
            className={`px-2 py-0.5 font-normal capitalize ${riskLevel === "High"
              ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400"
              : riskLevel === "Medium"
                ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
                : "bg-muted text-muted-foreground border-border"
              }`}
          >
            {riskLevel}
          </Badge>
        ) : null}
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">{account.lastSync}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-6 text-xs px-2 gap-1">
            <Eye className="h-3 w-3" />
            Review
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <ShieldOff className="h-3 w-3 mr-1" />
            Revoke
          </Button>
        </div>
      </TableCell>
    </ExpandableRow>
  );
};

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------

const AccountsTab: React.FC<TabProps> = ({ user }) => {
  const { data: shadowsResponse, isLoading, error } = useIdentityShadows(user.id);
  const shadows: ShadowDTO[] = shadowsResponse?.shadows ?? [];
  const { isExpanded, toggleRow } = useExpandableRows(shadows.map(shadowToAccount));

  return (
    <div className="space-y-6 mt-4">
      <TabCard
        title="Linked Accounts"
        description="Resource accounts (shadows) linked to this identity via authoritative and target applications."
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading linked accounts...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-red-500">
            Failed to load linked accounts:{" "}
            {(error as { message?: string })?.message || String(error)}
            {(error as { detail?: string })?.detail && (
              <div className="mt-1 text-xs text-red-400">
                {(error as { detail?: string }).detail}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Application</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shadows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No linked resource accounts found for this identity.
                    </TableCell>
                  </TableRow>
                ) : (
                  shadows.map((shadow) => (
                    <AccountRow
                      key={shadow.id}
                      shadow={shadow}
                      account={shadowToAccount(shadow)}
                      isExpanded={isExpanded(shadow.id)}
                      onToggle={() => toggleRow(shadow.id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </TabCard>
    </div>
  );
};

export default AccountsTab;