import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ReportSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (subscriptions: any) => void;
}

export const ReportSubscriptionModal = ({ open, onOpenChange, onSave }: ReportSubscriptionModalProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [subscribers, setSubscribers] = useState<Array<{ email: string; frequency: string }>>([]);

  const handleAdd = () => {
    if (email) {
      setSubscribers([...subscribers, { email, frequency }]);
      setEmail('');
      setFrequency('daily');
    }
  };

  const handleRemove = (index: number) => {
    setSubscribers(subscribers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave?.(subscribers);
    toast({ title: "Subscriptions Updated", description: `${subscribers.length} subscribers configured` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Manage Subscriptions</span>
            <Badge>{subscribers.length} subscribers</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com" />
            </div>
            <div className="w-40">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={!email}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {subscribers.map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{sub.email}</p>
                  <p className="text-sm text-muted-foreground">Receives: {sub.frequency}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleRemove(idx)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Subscriptions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
