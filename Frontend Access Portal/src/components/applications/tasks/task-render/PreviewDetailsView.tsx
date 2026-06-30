"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Link2,
  Trash2,
  Equal,
  ArrowRight,
  AlertCircle,
  Shield,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────

export interface AttributeChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface AccountPreview {
  resourceUid: string;
  shadowId: string;
  situation: string;
  shadowExists: boolean;
  resolvedReaction: string;
  action: string;
  linkedIdentityId: string;
  attributeChanges: number;
  changes: AttributeChange[];
  message: string;
}

export interface DeletionPreviewItem {
  shadowId: string;
  resourceUid: string;
  linkedIdentityId: string;
  resolvedReaction: string;
}

export interface EntitlementDeletionPreviewItem {
  entitlementId: string;
  sourceUid: string;
  displayName: string;
  objectClass: string;
  assignmentCount: number;
}

export interface EntitlementStats {
  deletedEntitlements: number;
  revokedAssignments: number;
  entitlementsImported?: number;
}

export interface EntitlementPreviewItem {
  resourceUid: string;
  objectClass: string;
  action: string;
  message: string;
}

export interface PreviewDetails {
  accounts: AccountPreview[];
  entitlements?: EntitlementPreviewItem[];
  deletions: DeletionPreviewItem[];
  entitlementDeletions?: EntitlementDeletionPreviewItem[];
  entitlementStats?: EntitlementStats;
  summary: string;
  unchanged: number;
}

// ─── Sub-components ─────────────────────────────────────

function SituationBadge({ situation }: { situation: string }) {
  switch (situation) {
    case "LINKED":
      return <Badge variant="default">Linked</Badge>;
    case "UNMATCHED":
      return <Badge variant="secondary">Unmatched</Badge>;
    case "UNLINKED":
      return <Badge variant="warning">Unlinked</Badge>;
    case "DISPUTED":
      return <Badge variant="destructive">Disputed</Badge>;
    case "ERROR":
    case "SITUATION_UNSPECIFIED":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    default:
      return <Badge variant="outline">{situation}</Badge>;
  }
}

function ActionBadge({ action }: { action: string }) {
  switch (action) {
    case "IDENTITY_CREATED":
      return (
        <Badge className="bg-emerald-600 text-white border-transparent">
          <UserPlus className="h-3 w-3 mr-1" />
          Create
        </Badge>
      );
    case "IDENTITY_UPDATED":
      return (
        <Badge className="bg-blue-600 text-white border-transparent">
          <RefreshCw className="h-3 w-3 mr-1" />
          Update
        </Badge>
      );
    case "IDENTITY_LINKED":
      return (
        <Badge className="bg-violet-600 text-white border-transparent">
          <Link2 className="h-3 w-3 mr-1" />
          Link
        </Badge>
      );
    case "IDENTITY_DELETED":
      return (
        <Badge variant="destructive">
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Badge>
      );
    case "NO_ACTION":
      return (
        <Badge variant="outline">
          <Equal className="h-3 w-3 mr-1" />
          No Change
        </Badge>
      );
    case "ACTION_UNSPECIFIED":
      return <Badge variant="destructive">—</Badge>;
    case "SHADOW_UPDATED":
      return (
        <Badge className="bg-slate-500 text-white border-transparent">
          <RefreshCw className="h-3 w-3 mr-1" />
          Shadow Updated
        </Badge>
      );
    case "SHADOW_CREATED":
      return (
        <Badge className="bg-slate-600 text-white border-transparent">
          <UserPlus className="h-3 w-3 mr-1" />
          Shadow Created
        </Badge>
      );
    case "ALREADY_LINKED":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Link2 className="h-3 w-3 mr-1" />
          Already Linked
        </Badge>
      );
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
}

function AccountDetailRow({ account }: { account: AccountPreview }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChanges = account.changes && account.changes.length > 0;
  const hasMessage = Boolean(account.message && account.message.trim());
  // Only flag as a real error when the proto situation/action signals a failure.
  // Informational messages ("DRY-RUN: ...", "Identity already up to date") are
  // returned on successful accounts and must NOT be treated as errors.
  const isError =
    account.situation === "SITUATION_UNSPECIFIED" ||
    account.situation === "ERROR" ||
    account.action === "ACTION_UNSPECIFIED";

  return (
    <>
      <TableRow
        className={`hover:bg-muted/50 ${
          isError ? "bg-red-50/50 dark:bg-red-950/20" : ""
        } ${hasChanges || hasMessage ? "cursor-pointer" : ""}`}
        onClick={() => (hasChanges || hasMessage) && setIsOpen(!isOpen)}
      >
        <TableCell className="w-8">
          {(hasChanges || hasMessage) && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {account.resourceUid}
        </TableCell>
        <TableCell>
          <SituationBadge situation={account.situation} />
        </TableCell>
        <TableCell>
          <ActionBadge action={account.action} />
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {account.resolvedReaction || "—"}
        </TableCell>
        <TableCell className="text-center">
          {hasChanges ? (
            <Badge variant="secondary">{account.attributeChanges}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="text-xs font-mono text-muted-foreground max-w-[180px] truncate">
          {account.linkedIdentityId || "—"}
        </TableCell>
      </TableRow>
      {(hasChanges || hasMessage) && isOpen && (
        <TableRow className={isError ? "bg-red-50/30 dark:bg-red-950/10" : "bg-muted/30"}>
          <TableCell colSpan={7} className="p-0">
            <div className="px-8 py-3">
              {hasMessage && (
                <div className={`mb-3 flex items-start gap-2 rounded-md border px-3 py-2 ${
                  isError
                    ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
                    : "border-border bg-muted/50"
                }`}>
                  {isError
                    ? <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    : <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  }
                  <div>
                    <p className={`text-xs font-semibold mb-0.5 ${
                      isError ? "text-red-700 dark:text-red-400" : "text-foreground"
                    }`}>
                      {isError ? "Processing Error" : "Note"}
                    </p>
                    <p className={`text-xs font-mono ${
                      isError ? "text-red-600 dark:text-red-300" : "text-muted-foreground"
                    }`}>{account.message}</p>
                  </div>
                </div>
              )}
              {hasChanges && (
                <>
                  <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                    Attribute Changes
                  </p>
                  <div className="grid gap-1.5">
                    {account.changes.map((change, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-mono bg-background rounded px-3 py-1.5 border"
                      >
                        <span className="font-semibold text-foreground min-w-[140px]">
                          {change.fieldName}
                        </span>
                        <span className="text-red-500 line-through">
                          {change.oldValue || "(empty)"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-emerald-600 font-medium">
                          {change.newValue || "(empty)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Main Component ─────────────────────────────────────

export default function PreviewDetailsView({
  details,
}: {
  details: PreviewDetails;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Summary text */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        {details.summary}
      </div>

      {/* Account details table */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">
            Account Details ({details.accounts.length} scanned)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Account UID</TableHead>
                  <TableHead>Situation</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead className="text-center">Changes</TableHead>
                  <TableHead>Identity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details.accounts.map((account, idx) => (
                  <AccountDetailRow key={idx} account={account} />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Entitlement details table */}
      {details.entitlements && details.entitlements.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Entitlement Details ({details.entitlements.length} cataloged)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source UID</TableHead>
                    <TableHead>Object Class</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.entitlements.map((ent, idx) => (
                    <TableRow
                      key={idx}
                      className={
                        ent.action === "ERROR"
                          ? "bg-red-50/50 dark:bg-red-950/20"
                          : ""
                      }
                    >
                      <TableCell className="font-mono text-xs">
                        {ent.resourceUid}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {ent.objectClass || "—"}
                      </TableCell>
                      <TableCell>
                        {ent.action === "SHADOW_CREATED" ? (
                          <Badge className="bg-emerald-600 text-white border-transparent">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Created
                          </Badge>
                        ) : ent.action === "SHADOW_UPDATED" ? (
                          <Badge className="bg-blue-600 text-white border-transparent">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Updated
                          </Badge>
                        ) : ent.action === "ERROR" ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </Badge>
                        ) : (
                          <Badge variant="outline">{ent.action}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                        {ent.message || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Deletion previews */}
      {details.deletions && details.deletions.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Deletion Previews ({details.deletions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shadow ID</TableHead>
                    <TableHead>Resource UID</TableHead>
                    <TableHead>Linked Identity</TableHead>
                    <TableHead>Reaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.deletions.map((del, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs">
                        {del.shadowId}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {del.resourceUid}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {del.linkedIdentityId || "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {del.resolvedReaction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Entitlement stats summary */}
      {/* Entitlement summary badges */}
      {(() => {
        const ents = details.entitlements ?? [];
        const created = ents.filter(e => e.action === "SHADOW_CREATED").length;
        const synced = ents.filter(e => e.action === "SHADOW_UPDATED").length;
        const errors = ents.filter(e => e.action === "ERROR").length;
        const deleted = details.entitlementStats?.deletedEntitlements ?? 0;
        const affectedMemberships = details.entitlementStats?.revokedAssignments ?? 0;
        if (created + synced + errors + deleted === 0) return null;
        return (
          <div className="flex flex-wrap gap-3 text-xs">
            {synced > 0 && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCw className="h-3 w-3" />
                {synced} entitlements synced
              </Badge>
            )}
            {created > 0 && (
              <Badge className="gap-1 bg-emerald-600 text-white border-transparent">
                <UserPlus className="h-3 w-3" />
                {created} entitlements created
              </Badge>
            )}
            {deleted > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Trash2 className="h-3 w-3" />
                {deleted} entitlements deleted
              </Badge>
            )}
            {affectedMemberships > 0 && (
              <Badge variant="destructive" className="gap-1">
                <Link2 className="h-3 w-3" />
                {affectedMemberships} memberships affected
              </Badge>
            )}
            {errors > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors} entitlements failed
              </Badge>
            )}
          </div>
        );
      })()}

      {/* Entitlement deletion previews */}
      {details.entitlementDeletions && details.entitlementDeletions.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" />
              Entitlement Deprovisioning Preview ({details.entitlementDeletions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Source UID</TableHead>
                    <TableHead>Object Class</TableHead>
                    <TableHead className="text-center">Memberships</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.entitlementDeletions.map((ent, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-xs font-medium">
                        {ent.displayName || ent.sourceUid}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {ent.sourceUid}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {ent.objectClass || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {ent.assignmentCount > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {ent.assignmentCount} to reassign
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
