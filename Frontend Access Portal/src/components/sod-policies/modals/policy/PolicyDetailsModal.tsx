import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, AlertTriangle, CheckCircle2, Clock, Users, FileText, 
  Activity, TrendingUp, Download, PlayCircle, Copy, Edit, Archive 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusBadgeClass, getSeverityBadgeClass } from '@/utils/getBadgeClass';
import type { SoDPolicy } from '@/types/sodPolicies';

interface PolicyDetailsModalProps {
  policy: SoDPolicy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (policy: SoDPolicy) => void;
  onClone?: (policy: SoDPolicy) => void;
  onTest?: (policy: SoDPolicy) => void;
  onArchive?: (policy: SoDPolicy) => void;
}

export const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({
  policy,
  open,
  onOpenChange,
  onEdit,
  onClone,
  onTest,
  onArchive
}) => {
  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl flex flex-col p-0 h-[90vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0">
            <DialogHeader >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl">{policy.name}</DialogTitle>
                  <DialogDescription>
                    View policy details, conditions, compliance mappings, and violation history.
                  </DialogDescription>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={cn(getStatusBadgeClass(policy.status), "border text-xs")}>{policy.status.toUpperCase()}</Badge>
                    <Badge className={cn(getSeverityBadgeClass(policy.riskLevel), "border text-xs")}>
                      {policy.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Badge variant="secondary">{policy.enforcementMode}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(policy)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {onClone && (
                    <Button size="sm" variant="outline" onClick={() => onClone(policy)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Clone
                    </Button>
                  )}
                  {onTest && (
                    <Button size="sm" variant="outline" onClick={() => onTest(policy)}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="shrink-0 mr-4 mb-4">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 pt-4 pb-6 overflow-hidden">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="violations">Violations</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100%-44px)] pr-2">
                <TabsContent value="overview" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Policy Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="mt-1">{policy.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Business Justification</label>
                        <p className="mt-1">{policy.businessJustification}</p>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Category</label>
                          <p className="mt-1 font-medium">{policy.category}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Conflict Type</label>
                          <p className="mt-1 font-medium">{policy.conflictType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Version</label>
                          <p className="mt-1 font-medium">v{policy.version}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-8 w-8 text-destructive" />
                          <div>
                            <p className="text-2xl font-bold">{policy.violationCount}</p>
                            <p className="text-sm text-muted-foreground">Violations</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Shield className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">{policy.exceptionCount}</p>
                            <p className="text-sm text-muted-foreground">Exceptions</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Users className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">{policy.affectedUsers}</p>
                            <p className="text-sm text-muted-foreground">Affected Users</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-8 w-8 text-primary" />
                          <div>
                            <p className="text-2xl font-bold">94%</p>
                            <p className="text-sm text-muted-foreground">Effectiveness</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">AI Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <Activity className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">High Effectiveness</p>
                            <p className="text-sm text-muted-foreground">This policy has detected 89% of similar violations in the past 30 days.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Recommendation</p>
                            <p className="text-sm text-muted-foreground">Consider expanding conditions to include contractor roles for complete coverage.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="conditions" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Policy Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {policy.conditions.map((condition) => (
                          <div key={condition.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Badge variant="outline">{condition.operator}</Badge>
                            <div className="flex-1">
                              <p className="font-medium">{condition.type}</p>
                              <p className="text-sm text-muted-foreground">{condition.value}</p>
                            </div>
                            {condition.negation && <Badge variant="destructive">NOT</Badge>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Compliance Mappings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {policy.complianceFrameworks.map((framework) => (
                          <div key={framework.controlId} className="flex items-start gap-3 p-4 border rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{framework.framework}</p>
                                <Badge variant="outline">{framework.controlId}</Badge>
                                {framework.required && <Badge variant="destructive">Required</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{framework.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="violations" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Violations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No recent violations for this policy</p>
                        <Button variant="link" className="mt-2">View All Historical Violations</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Version History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {policy.versions.map((version) => (
                          <div key={version.version} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">Version {version.version}</p>
                                <p className="text-sm text-muted-foreground">{new Date(version.timestamp).toLocaleDateString()}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">By {version.changedBy}</p>
                              {version.changeReason && (
                                <p className="text-sm mt-2">{version.changeReason}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                {version.rollbackable && (
                                  <Button size="sm" variant="outline">Rollback</Button>
                                )}
                                <Button size="sm" variant="ghost">View Changes</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="approvals" className="space-y-6 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Approval Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {policy.requiresApproval ? (
                        <div className="space-y-3">
                          {policy.approvals.map((approval) => (
                            <div key={approval.id} className="flex items-start gap-3 p-3 border rounded-lg">
                              {approval.status === 'approved' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                              ) : approval.status === 'rejected' ? (
                                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                              ) : (
                                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">{approval.approver}</p>
                                  <Badge variant={
                                    approval.status === 'approved' ? 'default' : 
                                    approval.status === 'rejected' ? 'destructive' : 'secondary'
                                  }>
                                    {approval.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{approval.approverRole}</p>
                                {approval.comments && (
                                  <p className="text-sm mt-2 p-2 bg-muted rounded">{approval.comments}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-muted-foreground">No approval required for this policy</p>
                      )}
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
