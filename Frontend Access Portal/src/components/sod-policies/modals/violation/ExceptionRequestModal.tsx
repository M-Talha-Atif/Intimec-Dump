import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { ViolationDetail } from '@/types/sodPolicies';

interface ExceptionRequestModalProps {
  violation: ViolationDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (exceptionData: any) => void;
}

export const ExceptionRequestModal: React.FC<ExceptionRequestModalProps> = ({
  violation,
  open,
  onOpenChange,
  onSubmit
}) => {
  const [justification, setJustification] = useState('');
  const [businessReason, setBusinessReason] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [compensatingControls, setCompensatingControls] = useState<string[]>(['']);
  const [mitigationPlan, setMitigationPlan] = useState('');
  const [reviewFrequency, setReviewFrequency] = useState('90');

  const addControl = () => {
    setCompensatingControls([...compensatingControls, '']);
  };

  const updateControl = (index: number, value: string) => {
    const updated = [...compensatingControls];
    updated[index] = value;
    setCompensatingControls(updated);
  };

  const removeControl = (index: number) => {
    setCompensatingControls(compensatingControls.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!violation || !justification || !businessReason || !expiryDate) return;
    
    onSubmit({
      violationId: violation.id,
      justification,
      businessReason,
      expiryDate,
      compensatingControls: compensatingControls.filter(c => c.trim() !== ''),
      mitigationPlan,
      reviewFrequency: parseInt(reviewFrequency)
    });
    
    onOpenChange(false);
  };

  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col p-0 h-[90vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Request Exception
              </DialogTitle>
              <DialogDescription>
                {violation.userName} - {violation.policyName}. Submit an exception request with business justification and compensating controls.
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
                        <p className="font-medium">Exception Approval Required</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This request will be routed through the approval chain: 
                          Manager → Compliance → Security Team → Final Approval
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Business Justification *</Label>
                  <Textarea
                    value={businessReason}
                    onChange={(e) => setBusinessReason(e.target.value)}
                    placeholder="Explain the business need for this exception..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe why this access combination is necessary for business operations
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Technical Justification *</Label>
                  <Textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Provide technical details and alternatives considered..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Exception Expiry Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !expiryDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Review Frequency</Label>
                    <Select value={reviewFrequency} onValueChange={setReviewFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">Monthly (30 days)</SelectItem>
                        <SelectItem value="90">Quarterly (90 days)</SelectItem>
                        <SelectItem value="180">Semi-Annual (180 days)</SelectItem>
                        <SelectItem value="365">Annual (365 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Compensating Controls *</Label>
                    <Button variant="outline" size="sm" onClick={addControl}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Control
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Define controls to mitigate the risk while exception is active
                  </p>
                  <div className="space-y-2">
                    {compensatingControls.map((control, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={control}
                          onChange={(e) => updateControl(index, e.target.value)}
                          placeholder="e.g., Manager approval required for all transactions"
                        />
                        {compensatingControls.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeControl(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Risk Mitigation Plan</Label>
                  <Textarea
                    value={mitigationPlan}
                    onChange={(e) => setMitigationPlan(e.target.value)}
                    placeholder="Describe how risks will be monitored and managed..."
                    rows={3}
                  />
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-3">Exception Requirements</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">✓</Badge>
                        <p className="text-muted-foreground">
                          At least one compensating control must be defined
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">✓</Badge>
                        <p className="text-muted-foreground">
                          Exception will be reviewed at specified frequency
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">✓</Badge>
                        <p className="text-muted-foreground">
                          Automatic expiry and renewal process
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">✓</Badge>
                        <p className="text-muted-foreground">
                          Enhanced monitoring and audit logging
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
          <div className="flex-shrink-0 px-6 py-4">
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={
                  !justification || 
                  !businessReason || 
                  !expiryDate || 
                  compensatingControls.filter(c => c.trim()).length === 0
                }
              >
                Submit Exception Request
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
