import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  MessageSquare,
  User,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useSoDViolations, useSoDExceptions, useRemediateViolation } from '@/hooks/useSoDPolicies';
import { Progress } from '@/components/ui/progress';
import type { ViolationDetail } from '@/types/sodPolicies';
import {
  ViolationDetailsModal,
  RemediationModal,
  BulkRemediationModal,
  AssignViolationModal,
  ExceptionRequestModal,
  ViolationAdvancedFiltersModal,
  ViolationReportExportModal,
} from '../modals';

export const ViolationCenter = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  
  // Modal states
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [remediateModalOpen, setRemediateModalOpen] = useState(false);
  const [bulkRemediateModalOpen, setBulkRemediateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ViolationDetail | null>(null);
  
  const { data: allViolations } = useSoDViolations();
  const { data: exceptions } = useSoDExceptions();
  const remediateViolation = useRemediateViolation();

  const activeViolations = allViolations?.filter(v => 
    v.status !== 'resolved' && !v.hasException
  );
  const resolvedViolations = allViolations?.filter(v => v.status === 'resolved');
  const inRemediationViolations = allViolations?.filter(v => 
    v.status === 'in_remediation'
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-600 bg-orange-50';
      case 'medium': return 'border-l-yellow-600 bg-yellow-50';
      default: return 'border-l-blue-600 bg-blue-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { variant: 'destructive' as const, label: 'Open' },
      in_review: { variant: 'secondary' as const, label: 'In Review' },
      in_remediation: { variant: 'default' as const, label: 'In Remediation' },
      resolved: { variant: 'outline' as const, label: 'Resolved' },
      escalated: { variant: 'destructive' as const, label: 'Escalated' },
    };
    
    const { variant, label } = config[status as keyof typeof config] || config.open;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const ViolationCard = ({ violation }: { violation: ViolationDetail }) => (
    <Card className={`border-l-4 ${getSeverityColor(violation.severity)} hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-lg">{violation.id}</h3>
              {getStatusBadge(violation.status)}
              <Badge variant="outline" className="capitalize">{violation.severity}</Badge>
              {violation.sla?.breached && (
                <Badge variant="destructive">SLA Breached</Badge>
              )}
            </div>
            
            <p className="text-sm font-medium text-muted-foreground mb-1">{violation.policyName}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {violation.userName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Detected {new Date(violation.detectedDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-destructive mb-1">{violation.riskScore}</div>
            <div className="text-xs text-muted-foreground">Risk Score</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Conflicting Access:</p>
            <div className="flex flex-wrap gap-2">
              {violation.conflictingRoles.map((role, i) => (
                <Badge key={i} variant="secondary">{role}</Badge>
              ))}
              {violation.conflictingEntitlements.map((ent, i) => (
                <Badge key={i} variant="outline">{ent}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Affected Systems:</p>
            <div className="flex flex-wrap gap-2">
              {violation.affectedSystems.map((system, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{system}</Badge>
              ))}
            </div>
          </div>

          {violation.sla && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>SLA Progress</span>
                <span className={violation.sla.breached ? 'text-destructive' : ''}>
                  {violation.sla.remaining} days remaining
                </span>
              </div>
              <Progress 
                value={(1 - violation.sla.remaining / violation.sla.target) * 100} 
                className="h-2"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex gap-2">
              {violation.comments.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  {violation.comments.length}
                </div>
              )}
              {violation.assignedTo && (
                <Badge variant="outline" className="text-xs">
                  Assigned to {violation.assignedTo}
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => { setSelectedViolation(violation); setDetailsModalOpen(true); }}
              >
                View Details
              </Button>
              <Button 
                size="sm"
                onClick={() => { setSelectedViolation(violation); setRemediateModalOpen(true); }}
              >
                Remediate
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Violation Center</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all segregation of duties violations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportModalOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" onClick={() => setFiltersModalOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeViolations?.length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Remediation</p>
                <p className="text-2xl font-bold">{inRemediationViolations?.length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{resolvedViolations?.length || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exceptions</p>
                <p className="text-2xl font-bold">{exceptions?.length || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, policy, system, or violation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            Active ({activeViolations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="remediation">
            In Remediation ({inRemediationViolations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="exceptions">
            Exceptions ({exceptions?.filter(e => e.status === 'approved').length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({resolvedViolations?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeViolations?.map((violation) => (
            <ViolationCard key={violation.id} violation={violation} />
          ))}
          {activeViolations?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium">No Active Violations</p>
                <p className="text-muted-foreground">All violations are being addressed or resolved</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="remediation" className="space-y-4 mt-6">
          {inRemediationViolations?.map((violation) => (
            <ViolationCard key={violation.id} violation={violation} />
          ))}
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4 mt-6">
          {exceptions?.filter(e => e.status === 'approved').map((exception) => (
            <Card key={exception.id} className="border-l-4 border-l-orange-600">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold">{exception.id}</h3>
                      <Badge variant="secondary">Approved</Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{exception.policyName}</p>
                    <p className="text-sm text-muted-foreground mb-2">User: {exception.userName}</p>
                    <p className="text-sm">{exception.justification}</p>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Expires: {new Date(exception.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Review</Button>
                    <Button size="sm" variant="outline">Extend</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          {resolvedViolations?.map((violation) => (
            <Card key={violation.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{violation.id}</p>
                      <p className="text-sm text-muted-foreground">{violation.policyName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Resolved</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(violation.lastCheckedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* All Modals */}
      {selectedViolation && (
        <>
          <ViolationDetailsModal
            violation={selectedViolation}
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
            onRemediate={() => { setDetailsModalOpen(false); setRemediateModalOpen(true); }}
            onRequestException={() => { setDetailsModalOpen(false); setExceptionModalOpen(true); }}
            onAssign={() => { setDetailsModalOpen(false); setAssignModalOpen(true); }}
          />
          <RemediationModal
            violation={selectedViolation}
            open={remediateModalOpen}
            onOpenChange={setRemediateModalOpen}
            onSubmit={(id, action, details) => {
              remediateViolation.mutate({ id, action, details });
              setRemediateModalOpen(false);
            }}
          />
          <ExceptionRequestModal
            violation={selectedViolation}
            open={exceptionModalOpen}
            onOpenChange={setExceptionModalOpen}
            onSubmit={() => setExceptionModalOpen(false)}
          />
          <AssignViolationModal
            violation={selectedViolation}
            open={assignModalOpen}
            onOpenChange={setAssignModalOpen}
            onAssign={() => setAssignModalOpen(false)}
          />
        </>
      )}

      <BulkRemediationModal
        open={bulkRemediateModalOpen}
        onOpenChange={setBulkRemediateModalOpen}
        violationIds={selectedViolations}
        onSubmit={() => setBulkRemediateModalOpen(false)}
      />

      <ViolationAdvancedFiltersModal
        open={filtersModalOpen}
        onClose={() => setFiltersModalOpen(false)}
        onApply={(filters) => {
          console.log('Applied filters:', filters);
          setFiltersModalOpen(false);
        }}
      />

      <ViolationReportExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
};
