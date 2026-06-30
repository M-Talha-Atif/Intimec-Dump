import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, User, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import type { ViolationDetail } from '@/types/sodPolicies';

interface AssignViolationModalProps {
  violation: ViolationDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (assignee: string, priority: string, dueDate: Date, instructions: string) => void;
}

export const AssignViolationModal: React.FC<AssignViolationModalProps> = ({
  violation,
  open,
  onOpenChange,
  onAssign
}) => {
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date>();
  const [instructions, setInstructions] = useState('');

  const suggestedAssignees = [
    { id: 'john.doe@company.com', name: 'John Doe', role: 'IGA Administrator', workload: 12 },
    { id: 'jane.smith@company.com', name: 'Jane Smith', role: 'Compliance Manager', workload: 8 },
    { id: 'bob.wilson@company.com', name: 'Bob Wilson', role: 'Security Analyst', workload: 15 }
  ];

  const handleAssign = () => {
    if (!assignee || !dueDate) return;
    onAssign(assignee, priority, dueDate, instructions);
    onOpenChange(false);
  };

  if (!violation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col p-0 h-[85vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle>Assign Violation</DialogTitle>
              <DialogDescription>
                {violation.userName} - {violation.policyName}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <Card className="bg-muted border">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">AI Suggestion</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on workload and expertise, Jane Smith (8 active violations) is the 
                          recommended assignee for this {violation.severity} severity violation.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <div className="space-y-2">
                    {suggestedAssignees.map((user) => (
                      <Card
                        key={user.id}
                        className={`cursor-pointer transition-colors ${
                          assignee === user.id ? 'border-primary bg-accent' : ''
                        }`}
                        onClick={() => setAssignee(user.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.role}</p>
                              </div>
                            </div>
                            <Badge variant={user.workload < 10 ? 'default' : 'secondary'}>
                              {user.workload} active
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dueDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Provide specific instructions for the assignee..."
                    rows={4}
                  />
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Auto-notifications</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>✓ Email notification will be sent to assignee</p>
                      <p>✓ Slack notification (if configured)</p>
                      <p>✓ Reminder 24 hours before due date</p>
                      <p>✓ Escalation alert if overdue</p>
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
                onClick={handleAssign}
                disabled={!assignee || !dueDate}
              >
                Assign Violation
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
