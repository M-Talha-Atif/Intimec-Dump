"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ShieldAlert,
  AlertCircle,
  BarChart2,
  Activity,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  Info,
} from "lucide-react";
import AuthoritativeStateBadge from "@/components/applications/common/AuthoritativeStateBadge";
import ConnectionStatusBadge from "@/components/applications/common/ConnectionStatusBadge";
import OverviewChart from "./OverviewChart";
import { shortDate } from "@/utils/dateFormat";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Minimal shape expected from the server‑side app data. */
export type OverviewApplication = {
  name: string;
  category: string[];
  isAuthoritative: boolean;
  riskLevel?: string;
  description?: string;
  connectorId?: string;
  scopes?: string[];
  department?: string | null;
  owner?: string[];
  businessOwner?: string[];
  complianceLabels?: string[];
};

export type OverviewData = {
  details: OverviewApplication;
  createdAt?: string;
  lastSyncAccounts?: string;
  lastSyncEntitlements?: string;
  connectionStatus?: string;
  totalAccounts?: number;
  orphanCount?: number;
  riskyCount?: number;
};

function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64 text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Placeholder data — in the future these should come from real APIs
const syncHistory = [
  { time: "14:00", status: "success" as const },
  { time: "12:00", status: "success" as const },
  { time: "10:00", status: "success" as const },
  { time: "08:00", status: "warning" as const },
  { time: "06:00", status: "success" as const },
];

const accountAgeData = [
  { name: "0-30d", value: 120 },
  { name: "30-90d", value: 300 },
  { name: "90-180d", value: 200 },
  { name: "180d+", value: 50 },
];

const complianceFrameworks = [
  { name: "SOX", pass: true, lastReview: "2025-01-15", certDate: "2025-01-20" },
  { name: "GDPR", pass: false, lastReview: "2024-11-01", certDate: null },
  { name: "ISO 27001", pass: true, lastReview: "2025-02-10", certDate: "2025-02-15" },
  { name: "HIPAA", pass: true, lastReview: "2025-01-30", certDate: "2025-02-01" },
];

export default function OverviewContent({ data }: { data: OverviewData }) {
  const app = data.details;
  const totalAccounts = data.totalAccounts ?? 0;
  const orphanCount = data.orphanCount ?? 0;
  const riskyCount = data.riskyCount ?? 0;

  const kpiCards = [
    {
      title: "Total Accounts",
      value: totalAccounts,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      tooltip: "Total number of accounts provisioned in this application.",
    },
    {
      title: "Orphan Accounts",
      value: orphanCount,
      icon: <AlertCircle className="h-5 w-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      tooltip: "Accounts without a correlated identity — potential security risk.",
    },
    {
      title: "Risky Entitlements",
      value: riskyCount,
      icon: <ShieldAlert className="h-5 w-5" />,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/40",
      tooltip: "Entitlements classified as High Risk based on privilege level.",
    },
    {
      title: "Policy Violations",
      value: 0,
      icon: <BarChart2 className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      tooltip: "Active policy violations detected for identities with access.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Row 1: Application Metadata + Sync Health ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Metadata */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Application Metadata
              <InfoTip text="Core configuration and connectivity details for this application connector." />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Owner:</span>{" "}
              <span className="font-medium">
                {app.isAuthoritative ? "IT Department" : "Business Unit"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Connector Type:</span>{" "}
              <span className="font-medium">
                {app.category?.length ? app.category.join(", ") : "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Onboarded:</span>{" "}
              <span className="font-medium">
                {data.createdAt ? shortDate(data.createdAt) : "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Accounts Sync:</span>{" "}
              <span className="font-medium">
                {data.lastSyncAccounts ? shortDate(data.lastSyncAccounts) : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Source:</span>
              <AuthoritativeStateBadge authoritative={app.isAuthoritative} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Health:</span>
              <ConnectionStatusBadge
                status={
                  (data.connectionStatus as "Connected" | "Connection Problem" | "Offline") ??
                  "Offline"
                }
              />
            </div>
            <div>
              <span className="text-muted-foreground">Last Entitlements Sync:</span>{" "}
              <span className="font-medium">
                {data.lastSyncEntitlements ? shortDate(data.lastSyncEntitlements) : "—"}
              </span>
            </div>
            {app.riskLevel && (
              <div>
                <span className="text-muted-foreground">Risk Level:</span>{" "}
                <Badge
                  variant={
                    app.riskLevel === "High"
                      ? "destructive"
                      : app.riskLevel === "Medium"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs"
                >
                  {app.riskLevel}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Sync Health
              <InfoTip text="Last 5 synchronization attempts showing connector reliability." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {syncHistory.map((sync, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {sync.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-muted-foreground">Today {sync.time}</span>
                  </div>
                  <Badge
                    variant={sync.status === "success" ? "outline" : "secondary"}
                    className="text-xs"
                  >
                    {sync.status === "success" ? "Success" : "Warning"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Governance KPIs ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card
            key={kpi.title}
            className="transition-all hover:shadow-md hover:border-primary/30 group"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {kpi.title}
                    </p>
                    <InfoTip text={kpi.tooltip} />
                  </div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <div className={kpi.color}>{kpi.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Row 3: Charts + Compliance ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Age Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Account Age Distribution
              <InfoTip text="Distribution of accounts by age. Older accounts may indicate stale access requiring review." />
            </CardTitle>
          </CardHeader>
          <CardContent style={{ height: 260 }}>
            <OverviewChart accountAgeData={accountAgeData} />
          </CardContent>
        </Card>

        {/* Compliance & Certification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Compliance & Certification
              <InfoTip text="Compliance posture across regulatory frameworks. Red indicates failed or overdue certification." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceFrameworks.map((fw) => (
                <div
                  key={fw.name}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {fw.pass ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{fw.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last review: {fw.lastReview}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={fw.pass ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {fw.pass ? "Compliant" : "Non-Compliant"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Ownership & Lifecycle ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ownership Accountability */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Ownership Accountability
              <InfoTip text="Application ownership chain for governance accountability and escalation." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Primary Owner</span>
              <span className="font-medium">
                {app.owner?.length ? app.owner.join(", ") : "IT Security Team"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Business Owner</span>
              <span className="font-medium">
                {app.businessOwner?.length
                  ? app.businessOwner.join(", ")
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Last Ownership Review</span>
              <span className="font-medium">—</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Governance Committee</span>
              <span className="font-medium">IAM Steering Committee</span>
            </div>
          </CardContent>
        </Card>

        {/* Lifecycle Posture */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Lifecycle Posture
              <InfoTip text="Application lifecycle metrics indicating governance maturity and review cadence." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Onboarding Date</span>
              <span className="font-medium">
                {data.createdAt ? shortDate(data.createdAt) : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Days Since Last Review</span>
              <span className="font-medium">—</span>
            </div>
            <div className="flex justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Next Certification Due</span>
              <Badge variant="secondary" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Pending
              </Badge>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Review Cadence</span>
              <span className="font-medium">Quarterly</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
