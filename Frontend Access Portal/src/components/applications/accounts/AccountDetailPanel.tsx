"use client";

import {
  X,
  Server,
  UserCircle,
  Shield,
  Ban,
  UserCheck,
  Search as SearchIcon,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import InfoTooltip from "@/components/dashboard/InfoTooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CustomBadge from "@/components/applications/common/CustomBadge";
import {
  riskBadgeMap,
  userStatusBadgeMap,
  situationBadgeMap,
  accountStatusBadgeMap,
} from "@/components/applications/common/badgeMap";
import { AccountWithUserAndEntitlements } from "@/components/applications/types";

interface AccountDetailPanelProps {
  account: AccountWithUserAndEntitlements;
  onClose: () => void;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) =>
  value ? (
    <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-right">{value}</dd>
    </div>
  ) : null;

export default function AccountDetailPanel({
  account,
  onClose,
}: AccountDetailPanelProps) {
  const hasMemberships =
    account.entitlements && account.entitlements.length > 0;

  const lastSyncDate = account.lastSync
    ? new Date(account.lastSync).toISOString().split("T")[0]
    : "—";

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="p-0 gap-0 flex flex-col overflow-hidden [&>button:last-child]:hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b flex-shrink-0">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 min-w-0 pr-4">
              <h2 className="text-xl font-bold truncate">
                {account.name || "Unnamed Account"}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <CustomBadge
                  color={
                    situationBadgeMap[
                      account.synchronizationSituation ?? "Unknown"
                    ]
                  }
                >
                  {account.synchronizationSituation ?? "—"}
                </CustomBadge>
                <CustomBadge
                  color={accountStatusBadgeMap[account.status ?? "Unknown"]}
                >
                  {account.status || "Unknown"}
                </CustomBadge>
                {account.user?.isPrivileged && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-300 bg-orange-50 text-xs"
                  >
                    Privileged
                  </Badge>
                )}
              </div>
              {account.user && (
                <p className="text-sm text-muted-foreground">
                  Linked to{" "}
                  <span className="font-medium text-foreground">
                    {account.user.name}
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* 3-Card Grid: Account Metadata, Correlated Identity, Governance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Account Metadata */}
          <Card className="border-l-4 border-l-blue-400">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {/* <Server className="h-4 w-4 text-blue-500" /> */}
                 Account Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <dl>
                <DetailItem
                  label="Account Name"
                  value={
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {account.name}
                    </code>
                  }
                />
                <DetailItem
                  label="Status"
                  value={
                    <CustomBadge
                      color={
                        accountStatusBadgeMap[account.status ?? "Unknown"]
                      }
                    >
                      {account.status}
                    </CustomBadge>
                  }
                />
                <DetailItem
                  label="Privileged"
                  value={
                    account.user?.isPrivileged ? (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )
                  }
                />
                <DetailItem label="Last Sync" value={lastSyncDate} />
              </dl>
            </CardContent>
          </Card>

          {/* Correlated Identity */}
          <Card className="border-l-4 border-l-emerald-400">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-emerald-500" /> Correlated
                Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {account.user ? (
                <dl>
                  <DetailItem label="Name" value={account.user.name} />
                  <DetailItem
                    label="Department"
                    value={account.user.department ?? "—"}
                  />
                  <DetailItem
                    label="Manager"
                    value={
                      account.user.manager ? (
                        <span className="text-primary cursor-pointer hover:underline">
                          {account.user.manager}
                        </span>
                      ) : (
                        "N/A"
                      )
                    }
                  />
                  <DetailItem
                    label="Identity Type"
                    value={
                      <Badge variant="outline" className="text-xs">
                        {account.user.type ?? "—"}
                      </Badge>
                    }
                  />
                  <DetailItem
                    label="Identity Status"
                    value={
                      <CustomBadge
                        color={
                          userStatusBadgeMap[account.user.status || "Unknown"]
                        }
                      >
                        {account.user.status}
                      </CustomBadge>
                    }
                  />
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  No correlated identity found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Governance */}
          <Card className="border-l-4 border-l-purple-400">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" /> Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <dl>
                <DetailItem
                  label="Risk Level"
                  value={
                    <CustomBadge
                      color={
                        riskBadgeMap[account.user?.riskLevel || "Unknown"]
                      }
                    >
                      {account.user?.riskLevel ?? "—"}
                    </CustomBadge>
                  }
                />
                <DetailItem
                  label="AI Analysis"
                  value={
                    <Badge variant="outline" className="text-xs">
                      Flagged
                    </Badge>
                  }
                />
              </dl>
              <div className="flex flex-wrap gap-1.5 mt-4">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <Ban className="mr-1 h-3 w-3" /> Revoke
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <UserCheck className="mr-1 h-3 w-3" /> Certify
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <SearchIcon className="mr-1 h-3 w-3" /> Investigate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Attributes (if any) */}
        {account.applicationAttributes &&
          Object.keys(account.applicationAttributes).length > 0 && (
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Account Attributes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Attribute</TableHead>
                        <TableHead className="text-xs">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(account.applicationAttributes).map(
                        ([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="text-xs text-muted-foreground">
                              {key}
                            </TableCell>
                            <TableCell className="text-sm font-medium break-all">
                              {String(value ?? "—")}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Memberships & Access */}
        {hasMemberships && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">
                Memberships & Access ({account.entitlements.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/80">
                    <TableRow>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.entitlements.map((entitlement) => (
                      <TableRow key={entitlement.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {entitlement.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {entitlement.name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entitlement.description}
                        </TableCell>
                        <TableCell>
                          <CustomBadge
                            color={riskBadgeMap[entitlement.riskLevel]}
                          >
                            {entitlement.riskLevel}
                          </CustomBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Policy Violations */}
        {account.policyViolations &&
          account.policyViolations.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Policy Violations ({account.policyViolations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Policy</TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.policyViolations.map((violation) => (
                        <TableRow key={violation.id}>
                          <TableCell className="font-medium text-sm">
                            {violation.policyName}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {violation.description}
                          </TableCell>
                          <TableCell>
                            <CustomBadge
                              color={
                                violation.status === "Open" ? "red" : "green"
                              }
                            >
                              {violation.status}
                            </CustomBadge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2"
                              >
                                Remediate
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs px-2"
                              >
                                Accept
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Historical Activity */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Historical Activity
              <InfoTooltip text="Recent account events including logins, access changes, and review actions." />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-0">
              {[
                { date: "2025-01-26 09:30", event: "Login Success", actor: "System", detail: "Corporate network" },
                { date: "2025-01-25 17:12", event: "Access Requested", actor: "User", detail: "AWS Console ReadOnly" },
                { date: "2025-01-24 13:48", event: "Entitlement Assigned", actor: "Auto Rule", detail: "Privileged Access Reviewer" },
                { date: "2025-01-20 14:33", event: "Access Revoked", actor: "Security Team", detail: "GitHub Admin Access" },
                { date: "2025-01-15 10:00", event: "Access Certified", actor: "Jane Smith", detail: "Quarterly review campaign" },
              ].map((evt, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-b-0">
                  <div className="mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{evt.event}</p>
                      <span className="text-xs text-muted-foreground">{evt.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{evt.detail} • by {evt.actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </SheetContent>
    </Sheet>
  );
}
