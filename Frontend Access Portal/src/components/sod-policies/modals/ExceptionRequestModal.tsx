
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText, Send } from 'lucide-react';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { getRiskBadgeClass } from '@/utils/getRiskColor';
import { cn } from '@/lib/utils';

interface ExceptionRequestModalProps {
  violation: any;
  open: boolean;
  onClose: () => void;
  onRequestException: (violationId: string, exceptionData: any) => void;
}

export const ExceptionRequestModal = ({ violation, open, onClose, onRequestException }: ExceptionRequestModalProps) => {
  const [justification, setJustification] = useState('');
  const [businessImpact, setBusinessImpact] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [compensatingControls, setCompensatingControls] = useState('');
  const [approver, setApprover] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const approvers = ['David Kim (CFO)', 'Lisa Zhang (CISO)', 'Michael Roberts (CAO)', 'Sarah Thompson (Head of Compliance)'];

  const handleSubmit = async () => {
    if (!justification.trim() || !businessImpact.trim() || !approver || !expiryDate) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onRequestException(violation.id, { violationId: violation.id, justification, businessImpact, expiryDate, compensatingControls, approver, requestDate: new Date(), status: 'Pending Review' });
    toast({ title: "Exception Requested", description: `Exception request has been submitted for approval to ${approver}` });
    setIsSubmitting(false);
    onClose();
    setJustification(''); setBusinessImpact(''); setExpiryDate(undefined); setCompensatingControls(''); setApprover('');
  };

  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Request Exception - {violation.id}
              </DialogTitle>
              <DialogDescription>Submit a formal exception request with business justification and compensating controls.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{violation.policy}</span>
                    <Badge className={cn(getRiskBadgeClass(violation.severity), "border text-xs")}>{violation.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{violation.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">User: {violation.user}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Business Justification *</Label>
                  <Textarea id="justification" placeholder="Explain why this access is necessary for business operations..." value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessImpact">Business Impact if Access is Removed *</Label>
                  <Textarea id="businessImpact" placeholder="Describe the impact on business operations if this access is removed..." value={businessImpact} onChange={(e) => setBusinessImpact(e.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Approver *</Label>
                  <Select value={approver} onValueChange={setApprover}>
                    <SelectTrigger><SelectValue placeholder="Select approver" /></SelectTrigger>
                    <SelectContent>
                      {approvers.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exception Expiry Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} disabled={(date) => date < new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compensatingControls">Compensating Controls (Optional)</Label>
                  <Textarea id="compensatingControls" placeholder="Describe any compensating controls that will be implemented..." value={compensatingControls} onChange={(e) => setCompensatingControls(e.target.value)} rows={3} />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || !justification.trim() || !businessImpact.trim() || !approver || !expiryDate}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Exception Request'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
