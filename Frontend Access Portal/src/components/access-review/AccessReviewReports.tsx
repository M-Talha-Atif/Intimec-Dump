import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar } from "lucide-react";
import InfoTooltip from "@/components/dashboard/InfoTooltip";

const reports = [
  {
    id: "1",
    title: "Campaign Completion Report",
    description: "Summary of all campaign progress, completion rates, and pending items across active and closed campaigns.",
    lastGenerated: "2024-01-15",
    tooltip: "Comprehensive view of certification campaign outcomes. Use for executive reporting and audit evidence.",
  },
  {
    id: "2",
    title: "Revocation Summary",
    description: "Detailed breakdown of revoked access items, affected identities, and remediation status by campaign.",
    lastGenerated: "2024-01-14",
    tooltip: "Tracks all access removals resulting from certification decisions. Critical for demonstrating governance enforcement.",
  },
  {
    id: "3",
    title: "Overdue Summary",
    description: "All review items past SLA deadline with reviewer assignments, escalation status, and aging analysis.",
    lastGenerated: "2024-01-15",
    tooltip: "Identifies governance bottlenecks and accountability gaps. High overdue counts increase compliance exposure.",
  },
  {
    id: "4",
    title: "Reviewer Activity Log",
    description: "Chronological log of reviewer actions including approvals, revocations, delegations, and escalations.",
    lastGenerated: "2024-01-13",
    tooltip: "Provides audit trail for reviewer behavior analysis. Detects patterns like rubber-stamping or review fatigue.",
  },
  {
    id: "5",
    title: "Decision Audit Export",
    description: "Immutable record of all certification decisions with justifications, timestamps, and approval chains.",
    lastGenerated: "2024-01-15",
    tooltip: "Primary audit evidence artifact. Required for SOX, GDPR, and ISO 27001 compliance demonstrations.",
  },
];

export const AccessReviewReports = () => {
  const handleExport = (reportId: string, format: "csv" | "pdf") => {
    // Mock export
    logger.debug(`Exporting report ${reportId} as ${format}`);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Operational Reports</h3>
          <p className="text-sm text-muted-foreground">Export-focused certification reports for audit and compliance</p>
        </div>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{report.title}</h4>
                      <InfoTooltip text={report.tooltip} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Last generated: {report.lastGenerated}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleExport(report.id, "csv")}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport(report.id, "pdf")}>
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
