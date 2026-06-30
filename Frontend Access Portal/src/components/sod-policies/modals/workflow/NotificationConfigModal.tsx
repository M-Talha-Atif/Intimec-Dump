import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface NotificationConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

export const NotificationConfigModal = ({ open, onClose, onSave }: NotificationConfigModalProps) => {
  const [config, setConfig] = useState({
    name: '', enabled: true, triggers: [] as string[],
    channels: { email: false, slack: false, teams: false },
    recipients: '', subject: '', message: '', frequency: 'immediate',
  });
  const { toast } = useToast();

  const triggerOptions = [
    { value: 'violation_detected', label: 'Violation Detected' },
    { value: 'exception_expiring', label: 'Exception Expiring' },
    { value: 'sla_breach', label: 'SLA Breach' },
    { value: 'policy_changed', label: 'Policy Changed' },
    { value: 'high_risk_alert', label: 'High Risk Alert' },
  ];

  const handleSave = () => {
    if (!config.name.trim()) { toast({ title: "Validation Error", description: "Please provide a notification name", variant: "destructive" }); return; }
    if (config.triggers.length === 0) { toast({ title: "Validation Error", description: "Please select at least one trigger", variant: "destructive" }); return; }
    if (!config.channels.email && !config.channels.slack && !config.channels.teams) { toast({ title: "Validation Error", description: "Please select at least one notification channel", variant: "destructive" }); return; }
    onSave(config);
    toast({ title: "Notification Configured", description: `Notification rule "${config.name}" has been saved` });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl flex flex-col p-0 h-[85vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Configuration
              </DialogTitle>
              <DialogDescription>
                Configure automated notifications for SoD events and policy violations.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Notification Name *</Label>
                  <Input id="name" placeholder="e.g., Critical Violation Alert" value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))} />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="enabled" checked={config.enabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked as boolean }))} />
                  <Label htmlFor="enabled" className="cursor-pointer">Enable this notification</Label>
                </div>

                <div className="space-y-3">
                  <Label>Trigger Events *</Label>
                  <div className="space-y-2">
                    {triggerOptions.map(trigger => (
                      <div key={trigger.value} className="flex items-center gap-2">
                        <Checkbox id={trigger.value} checked={config.triggers.includes(trigger.value)}
                          onCheckedChange={(checked) => {
                            setConfig(prev => ({
                              ...prev,
                              triggers: checked ? [...prev.triggers, trigger.value] : prev.triggers.filter(t => t !== trigger.value)
                            }));
                          }} />
                        <Label htmlFor={trigger.value} className="font-normal cursor-pointer">{trigger.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Notification Channels *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'email', icon: Mail, label: 'Email' },
                      { id: 'slack', icon: MessageSquare, label: 'Slack' },
                      { id: 'teams', icon: MessageSquare, label: 'Teams' },
                    ].map(ch => (
                      <div key={ch.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Checkbox id={ch.id}
                          checked={(config.channels as any)[ch.id]}
                          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, channels: { ...prev.channels, [ch.id]: checked as boolean } }))} />
                        <Label htmlFor={ch.id} className="flex items-center gap-2 cursor-pointer">
                          <ch.icon className="h-4 w-4" />{ch.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Input id="recipients" placeholder="email@example.com, #slack-channel" value={config.recipients}
                    onChange={(e) => setConfig(prev => ({ ...prev, recipients: e.target.value }))} />
                  <p className="text-xs text-muted-foreground">Separate multiple recipients with commas</p>
                </div>

                <div className="space-y-2">
                  <Label>Notification Frequency</Label>
                  <Select value={config.frequency} onValueChange={(value) => setConfig(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Template</Label>
                  <Input id="subject" placeholder="[ALERT] SoD Violation Detected" value={config.subject}
                    onChange={(e) => setConfig(prev => ({ ...prev, subject: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message Template</Label>
                  <Textarea id="message" placeholder="Use variables: {{user_name}}, {{policy_name}}" value={config.message}
                    onChange={(e) => setConfig(prev => ({ ...prev, message: e.target.value }))} rows={5} />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Configuration Summary</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{config.triggers.length} triggers</Badge>
                    <Badge variant="outline">
                      {[config.channels.email && 'Email', config.channels.slack && 'Slack', config.channels.teams && 'Teams'].filter(Boolean).length} channels
                    </Badge>
                    <Badge variant="outline">{config.frequency}</Badge>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleSave}>
                    <Send className="h-4 w-4 mr-2" />
                    Save Configuration
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
