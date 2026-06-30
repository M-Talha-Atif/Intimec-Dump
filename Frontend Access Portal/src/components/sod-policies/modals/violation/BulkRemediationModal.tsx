import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Users, Loader2 } from 'lucide-react';

interface BulkRemediationModalProps {
  violationIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (action: string, justification: string) => void;
}

export const BulkRemediationModal: React.FC<BulkRemediationModalProps> = ({
  violationIds,
  open,
  onOpenChange,
  onSubmit
}) => {
  const [action, setAction] = useState('');
  const [justification, setJustification] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [requireApproval, setRequireApproval] = useState(true);

  const handleSubmit = async () => {
    setProcessing(true);
    setProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    onSubmit(action, justification);
    setProcessing(false);
    onOpenChange(false);
  };

  const estimatedImpact = {
    users: violationIds.length,
    departments: Math.ceil(violationIds.length / 3),
    systems: Math.ceil(violationIds.length / 2)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col p-0 h-[85vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Bulk Remediation</DialogTitle>
              <DialogDescription>
                Remediate {violationIds.length} selected violations across multiple users and systems.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <Card className="bg-orange-500/5 border-orange-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Bulk Action Warning</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This action will affect {violationIds.length} violations across multiple 
                          users and systems. Please review carefully before proceeding.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Remediation Action</Label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remove_role">Remove Conflicting Roles</SelectItem>
                      <SelectItem value="remove_entitlement">Remove Specific Entitlements</SelectItem>
                      <SelectItem value="request_exception">Request Exceptions</SelectItem>
                      <SelectItem value="assign_review">Assign for Manual Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Justification</Label>
                  <Textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Provide business justification for this bulk action..."
                    rows={4}
                  />
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-3">Estimated Impact</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{estimatedImpact.users}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{estimatedImpact.departments}</p>
                        <p className="text-xs text-muted-foreground">Departments</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{estimatedImpact.systems}</p>
                        <p className="text-xs text-muted-foreground">Systems</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="approval"
                        checked={requireApproval}
                        onCheckedChange={(checked) => setRequireApproval(checked as boolean)}
                      />
                      <label
                        htmlFor="approval"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Require manager approval before execution
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 ml-6">
                      Recommended for high-impact bulk operations
                    </p>
                  </CardContent>
                </Card>

                {processing && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Processing...</span>
                          <span className="text-sm text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} />
                        <p className="text-xs text-muted-foreground">
                          Processing {violationIds.length} violations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="flex-shrink-0 px-6 py-4">
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={processing}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!action || !justification || processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Execute Bulk Remediation</>
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
