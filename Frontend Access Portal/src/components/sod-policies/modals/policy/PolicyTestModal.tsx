import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, AlertTriangle, CheckCircle2, Users, TrendingUp, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSeverityBadgeClass } from '@/utils/getBadgeClass';
import type { SoDPolicy } from '@/types/sodPolicies';

interface PolicyTestModalProps {
  policy: SoDPolicy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PolicyTestModal: React.FC<PolicyTestModalProps> = ({
  policy,
  open,
  onOpenChange
}) => {
  const [testing, setTesting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [results] = useState({
    totalUsers: 1247,
    violations: 23,
    highRisk: 8,
    mediumRisk: 12,
    lowRisk: 3,
    affectedDepartments: ['Finance', 'Operations', 'IT'],
    estimatedImpact: 'Medium'
  });

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestComplete(true);
    }, 2000);
  };

  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col p-0 h-[85vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Test Policy: {policy.name}</DialogTitle>
              <DialogDescription>
                Simulate policy execution against the current user population to identify potential violations.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Policy Testing</h3>
                        <p className="text-sm text-muted-foreground">
                          Test this policy against current user population
                        </p>
                      </div>
                      {!testComplete && (
                        <Button onClick={runTest} disabled={testing}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {testing ? 'Testing...' : 'Run Test'}
                        </Button>
                      )}
                    </div>

                    {testing && (
                      <div className="space-y-2">
                        <Progress value={66} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          Analyzing {results.totalUsers} users...
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {testComplete && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-destructive/5 border-destructive/20">
                        <CardContent className="pt-6">
                          <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                          <p className="text-2xl font-bold">{results.violations}</p>
                          <p className="text-sm text-muted-foreground">Violations Detected</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <Users className="h-8 w-8 text-primary mb-2" />
                          <p className="text-2xl font-bold">{results.totalUsers}</p>
                          <p className="text-sm text-muted-foreground">Users Analyzed</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <TrendingUp className="h-8 w-8 text-primary mb-2" />
                          <p className="text-2xl font-bold">{results.estimatedImpact}</p>
                          <p className="text-sm text-muted-foreground">Impact Level</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-3">Violation Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Badge className={cn(getSeverityBadgeClass('high'), "border text-xs")}>High Risk</Badge>
                              <span className="text-sm">Critical violations requiring immediate action</span>
                            </div>
                            <span className="font-bold">{results.highRisk}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Badge className={cn(getSeverityBadgeClass('medium'), "border text-xs")}>Medium Risk</Badge>
                              <span className="text-sm">Violations needing review within 7 days</span>
                            </div>
                            <span className="font-bold">{results.mediumRisk}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Badge className={cn(getSeverityBadgeClass('low'), "border text-xs")}>Low Risk</Badge>
                              <span className="text-sm">Advisory violations for monitoring</span>
                            </div>
                            <span className="font-bold">{results.lowRisk}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-3">Affected Departments</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.affectedDepartments.map((dept) => (
                            <Badge key={dept} variant="outline">{dept}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted border">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">Recommendations</p>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <li>• Review high-risk violations before activating policy</li>
                              <li>• Consider adding exceptions for legacy accounts</li>
                              <li>• Coordinate with department heads for remediation plan</li>
                              <li>• Schedule activation during low-activity period</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-shrink-0 px-6 py-4">
            <DialogFooter>
              {testComplete && (
                <>
                  <Button variant="outline" className="shrink-0 mr-4 mb-4">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                  <Button onClick={() => onOpenChange(false)}>
                    View Violations
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
