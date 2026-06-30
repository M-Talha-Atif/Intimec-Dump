
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, User, Eye, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, Download, Calendar
} from 'lucide-react';
import { AuditDetailModal } from './AuditDetailModal';
import { formatTimestamp } from '@/utils/dateFormat';

interface ImportAuditRecord {
  id: string;
  runId: string;
  status: 'completed' | 'failed' | 'cancelled' | 'partial';
  startTime: string;
  endTime?: string;
  duration: number;
  triggeredBy: string;
  appsInvolved: string[];
  totalObjects: number;
  successfulObjects: number;
  failedObjects: number;
  errors: string[];
  summary: {
    accountsProcessed: number;
    entitlementsProcessed: number;
    conflictsDetected: number;
    risksIdentified: number;
  };
  businessJustification?: string;
}

export function AuditLogTab() {
  const [auditRecords] = useState<ImportAuditRecord[]>([
    {
      id: 'audit-001',
      runId: 'run-2024-001',
      status: 'completed',
      startTime: '2024-01-20T14:30:00Z',
      endTime: '2024-01-20T15:45:00Z',
      duration: 4500000,
      triggeredBy: 'admin@company.com',
      appsInvolved: ['Active Directory', 'Salesforce', 'Workday'],
      totalObjects: 15420,
      successfulObjects: 15420,
      failedObjects: 0,
      errors: [],
      summary: {
        accountsProcessed: 8920,
        entitlementsProcessed: 6500,
        conflictsDetected: 0,
        risksIdentified: 12
      },
      businessJustification: 'Monthly compliance import for Q1 audit preparation'
    },
    {
      id: 'audit-002',
      runId: 'run-2024-002',
      status: 'failed',
      startTime: '2024-01-19T09:15:00Z',
      endTime: '2024-01-19T09:32:00Z',
      duration: 1020000,
      triggeredBy: 'hr@company.com',
      appsInvolved: ['Workday', 'Active Directory'],
      totalObjects: 5600,
      successfulObjects: 3200,
      failedObjects: 2400,
      errors: [
        'Connection timeout to Workday API',
        'Rate limit exceeded for Active Directory',
        'Invalid schema mapping for 240 user records'
      ],
      summary: {
        accountsProcessed: 3200,
        entitlementsProcessed: 0,
        conflictsDetected: 24,
        risksIdentified: 8
      },
      businessJustification: 'Emergency access provisioning for new contractor team'
    },
    {
      id: 'audit-003',
      runId: 'run-2024-003',
      status: 'partial',
      startTime: '2024-01-18T16:00:00Z',
      endTime: '2024-01-18T17:20:00Z',
      duration: 4800000,
      triggeredBy: 'compliance@company.com',
      appsInvolved: ['SAP', 'Oracle HRMS', 'Privileged Access'],
      totalObjects: 8950,
      successfulObjects: 7200,
      failedObjects: 1750,
      errors: [
        'SAP system maintenance window conflict',
        'Orphaned entitlements detected in Oracle HRMS'
      ],
      summary: {
        accountsProcessed: 4500,
        entitlementsProcessed: 2700,
        conflictsDetected: 156,
        risksIdentified: 45
      },
      businessJustification: 'Quarterly high-risk access certification review'
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState<ImportAuditRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      cancelled: 'secondary',
      partial: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleViewDetails = (record: ImportAuditRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const filteredRecords = auditRecords.filter(record => {
    const matchesSearch = record.runId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.triggeredBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.appsInvolved.some(app => app.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Import History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by run ID, user, or application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Records */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getStatusIcon(record.status)}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">Import Run {record.runId}</h4>
                      {getStatusBadge(record.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{record.triggeredBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatTimestamp(record.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(record.duration)}</span>
                      </div>
                      <div>
                        <span>{record.appsInvolved.length} applications</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {record.appsInvolved.slice(0, 3).map((app, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                      {record.appsInvolved.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{record.appsInvolved.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <span className="text-muted-foreground">Total Objects:</span>
                        <div className="font-medium">{record.totalObjects.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Successful:</span>
                        <div className="font-medium text-green-600">{record.successfulObjects.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed:</span>
                        <div className="font-medium text-red-600">{record.failedObjects.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conflicts:</span>
                        <div className="font-medium text-yellow-600">{record.summary.conflictsDetected}</div>
                      </div>
                    </div>

                    {record.errors.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="text-sm font-medium text-red-700">Errors ({record.errors.length}):</div>
                        <div className="text-sm text-red-600 mt-1">
                          {record.errors[0]}
                          {record.errors.length > 1 && <span className="text-muted-foreground"> and {record.errors.length - 1} more...</span>}
                        </div>
                      </div>
                    )}

                    {record.businessJustification && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Business Justification:</span>
                        <div className="font-medium italic">{record.businessJustification}</div>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(record)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No import history found</h3>
          <p className="text-gray-600">No import runs match your current filters</p>
        </div>
      )}

      <AuditDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        auditRecord={selectedRecord}
      />
    </div>
  );
}
