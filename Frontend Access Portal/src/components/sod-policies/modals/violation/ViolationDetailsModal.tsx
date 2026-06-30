import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass, getSeverityBadgeClass } from '@/utils/getBadgeClass';
import { 
  AlertTriangle, User, Shield, Clock, FileText, Activity, 
  CheckCircle2, TrendingUp, MessageSquare, Wrench 
} from 'lucide-react';
import type { ViolationDetail } from '@/types/sodPolicies';

interface ViolationDetailsModalProps {
  violation: ViolationDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemediate?: (violation: ViolationDetail) => void;
  onRequestException?: (violation: ViolationDetail) => void;
  onAssign?: (violation: ViolationDetail) => void;
}

export const ViolationDetailsModal: React.FC<ViolationDetailsModalProps> = ({
  violation,
  open,
  onOpenChange,
  onRemediate,
  onRequestException,
  onAssign
}) => {
  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl flex flex-col p-0 h-[90vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">Violation Details</DialogTitle>
                  <DialogDescription>{violation.policyName}</DialogDescription>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge className={cn(getStatusBadgeClass(violation.status), "border text-xs")}>{violation.status.replace('_', ' ').toUpperCase()}</Badge>
                    <Badge className={cn(getSeverityBadgeClass(violation.severity), "border text-xs")}>{violation.severity.toUpperCase()}</Badge>
                    <Badge variant="outline">Risk Score: {violation.riskScore}</Badge>
                    {violation.sla && (
                      <Badge variant={violation.sla.breached ? 'destructive' : 'secondary'}>
                        SLA: {violation.sla.remaining}h remaining
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {onRemediate && (
                    <Button size="sm" onClick={() => onRemediate(violation)}>
                      <Wrench className="h-4 w-4 mr-2" />
                      Remediate
                    </Button>
                  )}
                  {onRequestException && (
                    <Button size="sm" variant="outline" onClick={() => onRequestException(violation)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Request Exception
                    </Button>
                  )}
                  {onAssign && (
                    <Button size="sm" variant="outline" onClick={() => onAssign(violation)}>
                      <User className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="user">User Profile</TabsTrigger>
                <TabsTrigger value="conflict">Conflict Details</TabsTrigger>
                <TabsTrigger value="impact">Business Impact</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100%-44px)] pr-2">
                <TabsContent value="overview" className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          User Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="font-medium">{violation.userName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{violation.userEmail}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <p className="text-sm">{violation.userDepartment}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Manager</label>
                          <p className="text-sm">{violation.userManager}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Detected</label>
                          <p className="text-sm">{new Date(violation.detectedDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">First Detected</label>
                          <p className="text-sm">{new Date(violation.firstDetectedDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Last Checked</label>
                          <p className="text-sm">{new Date(violation.lastCheckedDate).toLocaleString()}</p>
                        </div>
                        {violation.dueDate && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                            <p className="text-sm font-medium text-destructive">
                              {new Date(violation.dueDate).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Conflicting Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {violation.conflictingRoles.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Roles</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {violation.conflictingRoles.map((role) => (
                              <Badge key={role} variant="outline">{role}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {violation.conflictingEntitlements.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Entitlements</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {violation.conflictingEntitlements.map((ent) => (
                              <Badge key={ent} variant="outline">{ent}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {violation.conflictingApplications.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Applications</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {violation.conflictingApplications.map((app) => (
                              <Badge key={app} variant="outline">{app}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-muted border">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">AI Risk Analysis</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Based on historical data, this violation has a {violation.riskScore}% likelihood of 
                            being exploited. Recommended remediation: Remove role '{violation.conflictingRoles[0]}' 
                            as it provides redundant access.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="user" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Complete Access Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">All Roles (12)</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Finance User', 'AP Processor', 'AR Processor', 'GL Viewer', 'Expense Approver', 
                            'Budget Manager', 'Report Viewer', 'Audit Reader'].map((role) => (
                            <Badge key={role} variant={
                              violation.conflictingRoles.includes(role) ? 'destructive' : 'outline'
                            }>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Access History (Last 30 days)</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">SAP Financial Module</span>
                            <span className="text-sm text-muted-foreground">47 logins</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">Oracle EBS</span>
                            <span className="text-sm text-muted-foreground">23 logins</span>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Previous Violations</h4>
                        <p className="text-sm text-muted-foreground">2 resolved violations in the past year</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="conflict" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conflict Path Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {violation.conflictPath.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                              {idx + 1}
                            </div>
                            <div className="flex-1 p-3 bg-muted rounded-lg">
                              <p className="text-sm">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Policy Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Policy</label>
                        <p className="font-medium">{violation.policyName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Detection Method</label>
                        <p className="text-sm">Automated role assignment analysis</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Detected By</label>
                        <p className="text-sm">{violation.detectedBy}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="impact" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Impact Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Impact Description</label>
                        <p className="mt-1">{violation.businessImpact}</p>
                      </div>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Affected Systems</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {violation.affectedSystems.map((system) => (
                            <Badge key={system} variant="outline">{system}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data Classification</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {violation.dataClassification.map((classification) => (
                            <Badge key={classification} variant="destructive">{classification}</Badge>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <p className="font-medium">Potential Risk Scenario</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              User could create and approve their own payment transactions, leading to 
                              potential fraud. Estimated financial exposure: $50,000-$500,000 per incident.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {violation.history.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{entry.action}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">By {entry.performedBy}</p>
                              <p className="text-sm mt-2">{entry.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Comments ({violation.comments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {violation.comments.map((comment) => (
                          <div key={comment.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm">{comment.userName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm">{comment.comment}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
