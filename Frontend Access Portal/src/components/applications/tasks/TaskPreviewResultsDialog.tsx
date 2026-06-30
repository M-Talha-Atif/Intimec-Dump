"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertTriangle,
  AlertCircle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface AttributeChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

interface AccountPreview {
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

interface DeletionPreview {
  shadowId: string;
  resourceUid: string;
  linkedIdentityId: string;
  resolvedReaction: string;
}

interface TaskPreviewResponse {
  executionId: string;
  totalAccountsScanned: number;
  wouldCreate: number;
  wouldUpdate: number;
  wouldLink: number;
  wouldDelete: number;
  unchanged: number;
  disputed: number;
  errors: number;
  accounts: AccountPreview[];
  deletions: DeletionPreview[];
  previewedAt: string;
  durationMs: number;
  summary: string;
}

interface TaskPreviewResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TaskPreviewResponse | null;
  isLoading: boolean;
}

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

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="flex-1 min-w-[120px]">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
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
                  <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    isError ? "text-red-500" : "text-muted-foreground"
                  }`} />
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

export default function TaskPreviewResultsDialog({
  open,
  onOpenChange,
  data,
  isLoading,
}: TaskPreviewResultsDialogProps) {
  if (!data && !isLoading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Dry-Run Preview Results
            {data && (
              <Badge variant="outline" className="ml-2 font-normal">
                <Clock className="h-3 w-3 mr-1" />
                {data.durationMs}ms
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            This is a read-only simulation. No data has been modified.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Running dry-run simulation...
              </p>
              <p className="text-xs text-muted-foreground">
                Connecting to connector, streaming accounts, computing diffs...
              </p>
            </div>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Summary Cards */}
            <div className="flex gap-3 flex-wrap">
              <SummaryCard
                label="Would Create"
                value={data.wouldCreate}
                icon={UserPlus}
                color="bg-emerald-600"
              />
              <SummaryCard
                label="Would Update"
                value={data.wouldUpdate}
                icon={RefreshCw}
                color="bg-blue-600"
              />
              <SummaryCard
                label="Would Link"
                value={data.wouldLink}
                icon={Link2}
                color="bg-violet-600"
              />
              <SummaryCard
                label="Would Delete"
                value={data.wouldDelete}
                icon={Trash2}
                color="bg-red-600"
              />
              <SummaryCard
                label="Unchanged"
                value={data.unchanged}
                icon={Equal}
                color="bg-gray-500"
              />
              <SummaryCard
                label="Disputed"
                value={data.disputed}
                icon={AlertTriangle}
                color="bg-amber-500"
              />
              {data.errors > 0 && (
                <SummaryCard
                  label="Errors"
                  value={data.errors}
                  icon={XCircle}
                  color="bg-red-700"
                />
              )}
            </div>

            {/* Summary text */}
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              {data.summary}
            </div>

            {/* Account details table */}
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  Account Details ({data.totalAccountsScanned} scanned)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-[340px]">
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
                      {data.accounts.map((account, idx) => (
                        <AccountDetailRow key={idx} account={account} />
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Deletion previews */}
            {data.deletions && data.deletions.length > 0 && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Deletion Previews ({data.deletions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[200px]">
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
                        {data.deletions.map((del, idx) => (
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
