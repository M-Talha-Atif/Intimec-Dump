
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock } from 'lucide-react';

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId?: string;
  onSchedule: (scheduleConfig: any) => void;
}

export const ScheduleReportDialog = ({ 
  open, 
  onOpenChange, 
  reportId, 
  onSchedule 
}: ScheduleReportDialogProps) => {
  const [selectedReport, setSelectedReport] = useState(reportId || '');
  const [frequency, setFrequency] = useState('daily');
  const [time, setTime] = useState('08:00');
  const [format, setFormat] = useState('pdf');
  const [recipients, setRecipients] = useState('');

  const handleSchedule = () => {
    const config = {
      reportId: selectedReport,
      frequency,
      time,
      format,
      recipients: recipients.split(',').map(email => email.trim()).filter(email => email)
    };
    onSchedule(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Report</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!reportId && (
            <div>
              <Label htmlFor="report">Select Report</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger id="report">
                  <SelectValue placeholder="Choose a report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk-report">High Risk Identities Report</SelectItem>
                  <SelectItem value="access-review">Access Review Status</SelectItem>
                  <SelectItem value="sod-violations">SoD Violations Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="recipients">Recipients</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="admin@company.com, manager@company.com"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!selectedReport || !recipients.trim()}>
            <Clock className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
