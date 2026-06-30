import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Users, Shield, Calendar, TrendingUp, FileText, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { mockCriticalRisks, RiskDetail } from '@/services/mockRiskData';
import { cn } from '@/lib/utils';

interface CriticalRiskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskId?: string;
}

export const CriticalRiskDetailModal: React.FC<CriticalRiskDetailModalProps> = ({
  isOpen,
  onClose,
  riskId
}) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskDetail | null>(
    riskId ? mockCriticalRisks.find(r => r.id === riskId) || null : null
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'border-red-300 bg-red-50 text-red-700';
      case 'in-progress': return 'border-blue-300 bg-blue-50 text-blue-700';
      case 'mitigated': return 'border-green-300 bg-green-50 text-green-700';
      case 'suppressed': return 'border-gray-300 bg-gray-50 text-gray-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Critical Risk Details</span>
            <Badge variant="outline" className="ml-2">
              {mockCriticalRisks.length} Total
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[calc(90vh-8rem)]">
          {/* Risk List Sidebar */}
          <ScrollArea className="w-1/3 border rounded-lg">
            <div className="p-2 space-y-2">
              {mockCriticalRisks.map((risk) => (
                <Card
                  key={risk.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedRisk?.id === risk.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedRisk(risk)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={cn("h-2 w-2 rounded-full", getSeverityColor(risk.severity))} />
                          <Badge variant="outline" className={getStatusColor(risk.status)}>
                            {risk.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm">{risk.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Risk Score: {risk.riskScore}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Risk Detail Panel */}
          <div className="flex-1">
            {selectedRisk ? (
              <ScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {/* Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={cn("h-3 w-3 rounded-full", getSeverityColor(selectedRisk.severity))} />
                            <Badge variant="outline" className={getStatusColor(selectedRisk.status)}>
                              {selectedRisk.status}
                            </Badge>
                            <Badge variant="secondary">Score: {selectedRisk.riskScore}</Badge>
                          </div>
                          <CardTitle className="text-xl">{selectedRisk.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">
                            {selectedRisk.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Assign Remediation
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4 mr-2" />
                          Suppress Risk
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>

                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="affected">Affected Entities</TabsTrigger>
                      <TabsTrigger value="impact">Impact</TabsTrigger>
                      <TabsTrigger value="remediation">Remediation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Risk Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">Type</div>
                              <div className="text-sm font-medium capitalize">{selectedRisk.type}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Severity</div>
                              <div className="text-sm font-medium capitalize">{selectedRisk.severity}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Discovered</div>
                              <div className="text-sm">{selectedRisk.discoveredDate.toLocaleDateString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Last Updated</div>
                              <div className="text-sm">{selectedRisk.lastUpdated.toLocaleDateString()}</div>
                            </div>
                            {selectedRisk.owner && (
                              <div>
                                <div className="text-xs text-muted-foreground">Owner</div>
                                <div className="text-sm">{selectedRisk.owner}</div>
                              </div>
                            )}
                            {selectedRisk.dueDate && (
                              <div>
                                <div className="text-xs text-muted-foreground">Due Date</div>
                                <div className="text-sm">{selectedRisk.dueDate.toLocaleDateString()}</div>
                              </div>
                            )}
                          </div>
                          <Separator />
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Sources</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedRisk.source.map((s, i) => (
                                <Badge key={i} variant="secondary">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Technical Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{selectedRisk.technicalDetails}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Compliance Frameworks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedRisk.complianceFrameworks.map((framework, i) => (
                              <Badge key={i} variant="outline">
                                <Shield className="h-3 w-3 mr-1" />
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="affected" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Affected Entities</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedRisk.affectedEntities.map((entity, i) => (
                              <div key={i} className="flex items-center space-x-3 p-2 border rounded-lg">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="text-sm font-medium">{entity.name}</div>
                                  <div className="text-xs text-muted-foreground capitalize">{entity.type}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="impact" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Business Impact</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{selectedRisk.businessImpact}</p>
                        </CardContent>
                      </Card>

                      {selectedRisk.relatedRisks.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Related Risks</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {selectedRisk.relatedRisks.map((relatedId, i) => {
                                const relatedRisk = mockCriticalRisks.find(r => r.id === relatedId);
                                return relatedRisk ? (
                                  <div key={i} className="p-2 border rounded-lg text-sm hover:bg-accent cursor-pointer">
                                    {relatedRisk.title}
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="remediation" className="space-y-4">
                      {selectedRisk.remediationPlan ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Remediation Plan</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{selectedRisk.remediationPlan}</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No remediation plan assigned yet</p>
                            <Button className="mt-4" size="sm">Create Remediation Plan</Button>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a risk to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
