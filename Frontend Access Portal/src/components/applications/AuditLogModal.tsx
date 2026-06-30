"use client";
import { useState, useMemo, Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  ExternalLink,
  Clock,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Zap,
  Eye,
  Calendar,
  Activity,
} from "lucide-react";
import { mockAuditLogs, getAuditLogsByFilter } from "@/data/mock-audit-logs";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { useRouter } from "next/navigation";
import { formatTimestamp } from "@/utils/dateFormat";

export default function ApplicationAuditLogModal() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { modalState, closeApplicationDialog } = useApplicationContext();

  const isOpen = modalState?.type === "auditLog" && !!modalState.application;

  // Filter audit logs for the specific application
  const applicationAuditLogs = useMemo(() => {
    if (!modalState) return [];
    if (!modalState.application) return [];

    // Filter logs related to this application
    return mockAuditLogs.filter(
      (log) =>
        log.objectType === "application" &&
        (log.objectName
          .toLowerCase()
          .includes(modalState.application.name.toLowerCase()) ||
          log.description
            .toLowerCase()
            .includes(modalState.application.name.toLowerCase()) ||
          log.metadata?.applicationId === modalState.application.name)
    );
  }, [modalState]);

  const filteredLogs = useMemo(() => {
    return getAuditLogsByFilter({
      searchTerm,
      riskLevel: selectedRiskLevel,
      eventType: selectedEventType,
    })
      .filter((log) =>
        applicationAuditLogs.some((appLog) => appLog.id === log.id)
      )
      .filter((log) => {
        if (selectedOutcome !== "all") {
          return log.outcome === selectedOutcome;
        }
        return true;
      });
  }, [
    applicationAuditLogs,
    searchTerm,
    selectedRiskLevel,
    selectedEventType,
    selectedOutcome,
  ]);

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "create":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "update":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "delete":
        return <FileText className="h-4 w-4 text-red-600" />;
      case "provision":
        return <Shield className="h-4 w-4 text-green-600" />;
      case "fail":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "escalate":
        return <Zap className="h-4 w-4 text-orange-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOutcomeBadgeColor = (outcome: string) => {
    switch (outcome) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failure":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportLogs = (format: "csv" | "json") => {
    console.log(
      `Exporting ${filteredLogs.length} application audit logs as ${format}`
    );
    // Implementation for exporting logs
  };

  if (!isOpen) return null;
  const viewFullAuditTrail = () => {
    closeApplicationDialog();
    router.push(
      `/audit-logs?application=${encodeURIComponent(
        modalState.application?.name || ""
      )}`
    );
  };

  // Calculate summary stats
  const totalEvents = applicationAuditLogs.length;
  const lastEventTimestamp =
    applicationAuditLogs.length > 0
      ? formatTimestamp(applicationAuditLogs[0].timestamp)
      : "No events";
  const riskBreakdown = applicationAuditLogs.reduce((acc, log) => {
    acc[log.riskLevel] = (acc[log.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const complianceTags = [
    ...new Set(applicationAuditLogs.flatMap((log) => log.complianceFlags)),
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          closeApplicationDialog();
        }
      }}
    >
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Audit Logs - {modalState.application.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportLogs("csv")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportLogs("json")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={viewFullAuditTrail}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Audit Trail
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Header & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Application Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {modalState.application.category}
                  </div>
                  <div>
                    <span className="font-medium">Owner:</span>{" "}
                    {modalState.application.source === "authoritative"
                      ? "IT"
                      : "Business"}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {modalState.application.status}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Event Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Total Events:</span>{" "}
                    {totalEvents}
                  </div>
                  <div>
                    <span className="font-medium">Last Event:</span>{" "}
                    {lastEventTimestamp}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risk Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {Object.entries(riskBreakdown).map(([risk, count]) => (
                    <div key={risk}>
                      <Badge className={`text-xs ${getRiskBadgeColor(risk)}`}>
                        {risk.toUpperCase()}: {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {complianceTags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {complianceTags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{complianceTags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Search & Filter Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search events, actors, objects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={selectedEventType}
                    onValueChange={setSelectedEventType}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="provision">Provision</SelectItem>
                      <SelectItem value="fail">Failure</SelectItem>
                      <SelectItem value="escalate">Escalate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedRiskLevel}
                    onValueChange={setSelectedRiskLevel}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedOutcome}
                    onValueChange={setSelectedOutcome}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Found {filteredLogs.length} audit events for this application
              </div>
            </CardContent>
          </Card>

          {/* Audit Events Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Object</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Compliance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <Fragment key={log.id}>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(log.id)}
                          >
                            {expandedRows.has(log.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(log.eventType)}
                            <span className="font-medium capitalize">
                              {log.eventType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.objectName}</div>
                            <div className="text-sm text-gray-500 capitalize">
                              {log.objectType}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.actor.name}</div>
                            <div className="text-sm text-gray-500 capitalize">
                              {log.actor.type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(log.riskLevel)}>
                            {log.riskLevel.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getOutcomeBadgeColor(log.outcome)}>
                            {log.outcome.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {log.complianceFlags
                              .slice(0, 2)
                              .map((flag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {flag}
                                </Badge>
                              ))}
                            {log.complianceFlags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{log.complianceFlags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(log.id) && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50">
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">
                                    Event Details
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        Description:
                                      </span>{" "}
                                      {log.description}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Session ID:
                                      </span>{" "}
                                      {log.sessionId}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        IP Address:
                                      </span>{" "}
                                      {log.ipAddress}
                                    </div>
                                    {log.correlationId && (
                                      <div>
                                        <span className="font-medium">
                                          Correlation ID:
                                        </span>{" "}
                                        {log.correlationId}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {log.target && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">
                                      Target Object
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <div>
                                        <span className="font-medium">
                                          Name:
                                        </span>{" "}
                                        {log.target.name}
                                      </div>
                                      <div>
                                        <span className="font-medium">
                                          Type:
                                        </span>{" "}
                                        {log.target.type}
                                      </div>
                                      <div>
                                        <span className="font-medium">ID:</span>{" "}
                                        {log.target.id}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">
                                    Governance
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    {log.resourceOwner && (
                                      <div>
                                        <span className="font-medium">
                                          Owner:
                                        </span>{" "}
                                        {log.resourceOwner}
                                      </div>
                                    )}
                                    {log.department && (
                                      <div>
                                        <span className="font-medium">
                                          Department:
                                        </span>{" "}
                                        {log.department}
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">
                                        Risk Level:
                                      </span>{" "}
                                      {log.riskLevel}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {(log.beforeState || log.afterState) && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">
                                    State Changes
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {log.beforeState && (
                                      <div>
                                        <h5 className="font-medium text-xs text-gray-600 mb-1">
                                          Before
                                        </h5>
                                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                          {JSON.stringify(
                                            log.beforeState,
                                            null,
                                            2
                                          )}
                                        </pre>
                                      </div>
                                    )}
                                    {log.afterState && (
                                      <div>
                                        <h5 className="font-medium text-xs text-gray-600 mb-1">
                                          After
                                        </h5>
                                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                                          {JSON.stringify(
                                            log.afterState,
                                            null,
                                            2
                                          )}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {log.errorMessage && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 text-red-600">
                                    Error Details
                                  </h4>
                                  <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                                    {log.errorMessage}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No audit events found
                  </h3>
                  <p className="text-gray-600">
                    No audit events found for this application with the current
                    filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
