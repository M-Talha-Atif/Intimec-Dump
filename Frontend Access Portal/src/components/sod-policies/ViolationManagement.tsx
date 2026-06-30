import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, Filter, MessageSquare, Calendar, Eye } from 'lucide-react';
import { RemediationModal } from './modals/RemediationModal';
import { CommentModal } from './modals/CommentModal';
import { ExceptionRequestModal } from './modals/ExceptionRequestModal';
import { ViolationDetailsPanel } from './modals/ViolationDetailsPanel';
import { useToast } from "@/hooks/use-toast";

export const ViolationManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [remediationModalOpen, setRemediationModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);
  
  const { toast } = useToast();

  const activeViolations = [
    {
      id: 'V001',
      user: 'John Smith',
      policy: 'SOX Financial Controls',
      description: 'User has both Finance Manager role and IT Administrator access',
      severity: 'High',
      detected: '2025-06-14',
      status: 'Open',
      riskScore: 85,
      affectedSystems: ['SAP Financials', 'Active Directory']
    },
    {
      id: 'V002',
      user: 'Sarah Johnson',
      policy: 'HR Data Protection',
      description: 'Access to payroll data combined with sales commission system',
      severity: 'Medium',
      detected: '2025-06-13',
      status: 'In Review',
      riskScore: 65,
      affectedSystems: ['Workday', 'Salesforce']
    },
    {
      id: 'V003',
      user: 'Mike Chen',
      policy: 'Audit Independence',
      description: 'Auditor has operational responsibilities in audited department',
      severity: 'High',
      detected: '2025-06-12',
      status: 'Escalated',
      riskScore: 90,
      affectedSystems: ['Oracle Financials', 'Internal Audit System']
    }
  ];

  const exceptions = [
    {
      id: 'E001',
      user: 'Alice Williams',
      policy: 'SOX Financial Controls',
      justification: 'Temporary project lead role during system migration',
      approver: 'David Kim (CFO)',
      expires: '2025-07-15',
      status: 'Approved',
      reviewDate: '2025-06-01'
    },
    {
      id: 'E002',
      user: 'Bob Taylor',
      policy: 'IT Security Segregation',
      justification: 'Emergency access for critical security incident response',
      approver: 'Lisa Zhang (CISO)',
      expires: '2025-06-30',
      status: 'Pending Review',
      reviewDate: '2025-06-15'
    }
  ];

  const [resolutionHistory] = useState([
    {
      id: 'R001',
      violationId: 'V004',
      user: 'Jennifer Davis',
      policy: 'HR Data Protection',
      action: 'Role Removed',
      resolution: 'Removed HR Admin role while maintaining Sales Director access',
      resolvedBy: 'IT Administrator',
      resolvedDate: '2025-06-10',
      status: 'Resolved'
    },
    {
      id: 'R002',
      violationId: 'V005',
      user: 'Robert Wilson',
      policy: 'SOX Financial Controls',
      action: 'Exception Approved',
      resolution: 'Approved temporary exception with manager oversight',
      resolvedBy: 'CFO',
      resolvedDate: '2025-06-08',
      status: 'Exception Active'
    }
  ]);

  const handleRemediate = (violationId: string) => {
    const violation = activeViolations.find(v => v.id === violationId);
    setSelectedViolation(violation);
    setRemediationModalOpen(true);
  };

  const handleComment = (violationId: string) => {
    const violation = activeViolations.find(v => v.id === violationId);
    setSelectedViolation(violation);
    setCommentModalOpen(true);
  };

  const handleRequestException = (violationId: string) => {
    const violation = activeViolations.find(v => v.id === violationId);
    setSelectedViolation(violation);
    setExceptionModalOpen(true);
  };

  const handleViewDetails = (violationId: string) => {
    const violation = activeViolations.find(v => v.id === violationId);
    setSelectedViolation(violation);
    setDetailsPanelOpen(true);
  };

  const onRemediate = (violationId: string, action: string, details: string) => {
    toast({
      title: "Remediation Submitted",
      description: `Remediation action "${action}" applied to violation ${violationId}.`,
    });
  };

  const onAddComment = (violationId: string, comment: string) => {
    toast({
      title: "Comment Added",
      description: `Comment added to violation ${violationId}.`,
    });
  };

  const onRequestException = (violationId: string, exceptionData: any) => {
    toast({
      title: "Exception Requested",
      description: `Exception request submitted for violation ${violationId}.`,
    });
  };

  const handleExtendException = (exceptionId: string) => {
    toast({
      title: "Extension Requested",
      description: `Extension request has been submitted for exception ${exceptionId}`,
    });
  };

  const handleRevokeException = (exceptionId: string) => {
    toast({
      title: "Exception Revoked",
      description: `Exception ${exceptionId} has been revoked`,
      variant: "destructive"
    });
  };

  const handleReviewException = (exceptionId: string) => {
    toast({
      title: "Review Initiated",
      description: `Review process has been started for exception ${exceptionId}`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'destructive';
      case 'In Review': return 'secondary';
      case 'Escalated': return 'destructive';
      case 'Resolved': return 'default';
      case 'Approved': return 'default';
      case 'Pending Review': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search violations by user, policy, or system..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Violations</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Violations and Exceptions Tabs */}
      <Tabs defaultValue="violations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="violations">Active Violations</TabsTrigger>
          <TabsTrigger value="exceptions">Approved Exceptions</TabsTrigger>
          <TabsTrigger value="history">Resolution History</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          {activeViolations.map((violation) => (
            <Card key={violation.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-lg">{violation.id}</span>
                      </div>
                      <Badge variant={getSeverityColor(violation.severity)}>
                        {violation.severity}
                      </Badge>
                      <Badge variant={getStatusColor(violation.status)}>
                        {violation.status}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Risk Score: {violation.riskScore}/100
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">User</p>
                        <p className="text-base">{violation.user}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Policy</p>
                        <p className="text-base">{violation.policy}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-sm text-gray-600">{violation.description}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Affected Systems</p>
                      <div className="flex flex-wrap gap-2">
                        {violation.affectedSystems.map((system: string, index: number) => (
                          <Badge key={index} variant="outline">{system}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Detected: {violation.detected}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Button size="sm" onClick={() => handleRemediate(violation.id)}>
                      Remediate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleComment(violation.id)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRequestException(violation.id)}>
                      Request Exception
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(violation.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          {exceptions.map((exception) => (
            <Card key={exception.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span className="font-medium text-lg">{exception.id}</span>
                      </div>
                      <Badge variant={getStatusColor(exception.status)}>
                        {exception.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">User</p>
                        <p className="text-base">{exception.user}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Policy</p>
                        <p className="text-base">{exception.policy}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Approver</p>
                        <p className="text-base">{exception.approver}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Expires</p>
                        <p className="text-base">{exception.expires}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Justification</p>
                      <p className="text-sm text-gray-600">{exception.justification}</p>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last Review: {exception.reviewDate}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Button variant="outline" size="sm" onClick={() => handleExtendException(exception.id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Extend
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRevokeException(exception.id)}>
                      Revoke
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleReviewException(exception.id)}>
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolution History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Violation ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Action Taken</TableHead>
                    <TableHead>Resolved By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolutionHistory.map((resolution) => (
                    <TableRow key={resolution.id}>
                      <TableCell className="font-medium">{resolution.violationId}</TableCell>
                      <TableCell>{resolution.user}</TableCell>
                      <TableCell>{resolution.policy}</TableCell>
                      <TableCell>{resolution.action}</TableCell>
                      <TableCell>{resolution.resolvedBy}</TableCell>
                      <TableCell>{resolution.resolvedDate}</TableCell>
                      <TableCell>
                        <Badge variant={resolution.status === 'Resolved' ? 'default' : 'secondary'}>
                          {resolution.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <RemediationModal
        violation={selectedViolation}
        open={remediationModalOpen}
        onClose={() => setRemediationModalOpen(false)}
        onRemediate={onRemediate}
      />

      <CommentModal
        violation={selectedViolation}
        open={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onAddComment={onAddComment}
      />

      <ExceptionRequestModal
        violation={selectedViolation}
        open={exceptionModalOpen}
        onClose={() => setExceptionModalOpen(false)}
        onRequestException={onRequestException}
      />

      <ViolationDetailsPanel
        violation={selectedViolation}
        open={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
      />
    </div>
  );
};
