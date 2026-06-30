
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Share, Mail } from 'lucide-react';

interface ReportShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  onShare: (recipients: string[], message: string) => void;
}

export const ReportShareDialog = ({ 
  open, 
  onOpenChange, 
  reportName, 
  onShare 
}: ReportShareDialogProps) => {
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState(`Please find the ${reportName} report attached.`);

  const handleShare = () => {
    const recipientList = recipients.split(',').map(email => email.trim()).filter(email => email);
    onShare(recipientList, message);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share className="h-5 w-5" />
            <span>Share Report</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="recipients">Recipients (comma-separated)</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="admin@company.com, manager@company.com"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!recipients.trim()}>
            <Mail className="h-4 w-4 mr-2" />
            Send Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
