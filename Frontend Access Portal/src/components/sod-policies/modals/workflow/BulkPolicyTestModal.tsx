import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { getStatusBadgeClass, getSeverityBadgeClass } from '@/utils/getBadgeClass';
import { CheckCircle2, XCircle, AlertTriangle, Play } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BulkPolicyTestModalProps {
  open: boolean;
  onClose: () => void;
  selectedPolicies: string[];
}

export const BulkPolicyTestModal = ({ open, onClose, selectedPolicies }: BulkPolicyTestModalProps) => {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleTest = async () => {
    setTesting(true);
    setProgress(0);
    setResults([]);

    const mockResults = selectedPolicies.map((id, idx) => ({
      policyId: id,
      policyName: `Policy ${id}`,
      status: idx % 3 === 0 ? 'pass' : idx % 3 === 1 ? 'warning' : 'fail',
      potentialViolations: Math.floor(Math.random() * 10),
      affectedUsers: Math.floor(Math.random() * 20),
      executionTime: Math.random() * 500,
      issues: idx % 3 === 2 ? ['Overlapping condition with POL-003', 'High false positive rate'] : [],
    }));

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
      if (i <= mockResults.length * 10) {
        setResults(mockResults.slice(0, Math.floor(i / 10)));
      }
    }

    setResults(mockResults);
    setTesting(false);
    toast({ title: "Testing Complete", description: `Tested ${selectedPolicies.length} policies` });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'fail': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl flex flex-col p-0 h-[85vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Bulk Policy Testing
              </DialogTitle>
              <DialogDescription>
                Test {selectedPolicies.length} policies against the current user base to identify potential violations.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                {testing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Testing policies...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {results.length > 0 && !testing && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg border">
                      <p className="text-2xl font-bold text-green-700">{results.filter(r => r.status === 'pass').length}</p>
                      <p className="text-sm text-muted-foreground">Passed</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg border">
                      <p className="text-2xl font-bold text-orange-700">{results.filter(r => r.status === 'warning').length}</p>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg border">
                      <p className="text-2xl font-bold text-destructive">{results.filter(r => r.status === 'fail').length}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                )}

                {results.length > 0 && (
                  <div className="space-y-2">
                    {results.map((result, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{result.policyName}</h4>
                              <Badge className={cn(result.status === 'pass' ? getStatusBadgeClass('active') : getSeverityBadgeClass(result.status === 'warning' ? 'medium' : 'critical'), "border text-xs")}>
                                {result.status === 'pass' ? 'Pass' : result.status === 'warning' ? 'Warning' : 'Fail'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                              <div><span className="font-medium">Potential Violations:</span> {result.potentialViolations}</div>
                              <div><span className="font-medium">Affected Users:</span> {result.affectedUsers}</div>
                              <div><span className="font-medium">Execution Time:</span> {result.executionTime.toFixed(0)}ms</div>
                            </div>
                            {result.issues.length > 0 && (
                              <div className="mt-2 p-2 bg-muted border rounded">
                                <p className="text-sm font-medium mb-1">Issues Found:</p>
                                <ul className="text-xs list-disc list-inside">
                                  {result.issues.map((issue: string, i: number) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!testing && results.length === 0 && (
                  <div className="text-center py-12">
                    <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">Ready to test {selectedPolicies.length} policies</p>
                    <p className="text-sm text-muted-foreground">This will simulate policy execution against current user base</p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>{results.length > 0 ? 'Close' : 'Cancel'}</Button>
                  {!testing && results.length === 0 && (
                    <Button onClick={handleTest}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Testing
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
