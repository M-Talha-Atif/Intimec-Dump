import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { Settings, Bell, Database, Brain, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { toast } = useToast();
  const [refreshInterval, setRefreshInterval] = useState('15');
  const [criticalThreshold, setCriticalThreshold] = useState([85]);
  const [highThreshold, setHighThreshold] = useState([70]);
  const [aiConfidence, setAiConfidence] = useState([75]);
  const [notifications, setNotifications] = useState({
    violations: true,
    recommendations: true,
    reports: false,
    tasks: true,
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated successfully.',
    });
    onClose();
  };

  const handleExport = () => {
    const config = { refreshInterval, criticalThreshold, highThreshold, aiConfidence, notifications };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'access-analysis-config.json';
    a.click();
    toast({ title: 'Configuration Exported' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Access Analysis Settings
          </DialogTitle>
          <DialogDescription>
            Configure analysis parameters, risk thresholds, and notification preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Data Refresh Interval</Label>
                <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Retention Period</Label>
                <Select defaultValue="90">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable Audit Logging</Label>
                <Switch defaultChecked />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card className="p-4 space-y-6">
              <div className="space-y-2">
                <Label>Critical Risk Threshold (≥{criticalThreshold}%)</Label>
                <Slider value={criticalThreshold} onValueChange={setCriticalThreshold} min={70} max={100} step={1} />
              </div>

              <div className="space-y-2">
                <Label>High Risk Threshold (≥{highThreshold}%)</Label>
                <Slider value={highThreshold} onValueChange={setHighThreshold} min={50} max={90} step={1} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-flag Excessive Access</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-detect Orphan Accounts</Label>
                <Switch defaultChecked />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card className="p-4 space-y-6">
              <div className="space-y-2">
                <Label>AI Recommendation Confidence Threshold ({aiConfidence}%)</Label>
                <Slider value={aiConfidence} onValueChange={setAiConfidence} min={50} max={100} step={5} />
                <p className="text-xs text-muted-foreground">
                  Only show recommendations with confidence above this threshold
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable Explainable AI</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-learn from User Feedback</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable Predictive Analytics</Label>
                <Switch defaultChecked />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>SoD Violations Detected</Label>
                  <p className="text-xs text-muted-foreground">Get notified of policy violations</p>
                </div>
                <Switch checked={notifications.violations} onCheckedChange={(checked) => setNotifications({ ...notifications, violations: checked })} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>New AI Recommendations</Label>
                  <p className="text-xs text-muted-foreground">When new recommendations are available</p>
                </div>
                <Switch checked={notifications.recommendations} onCheckedChange={(checked) => setNotifications({ ...notifications, recommendations: checked })} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Scheduled Reports</Label>
                  <p className="text-xs text-muted-foreground">Weekly and monthly report summaries</p>
                </div>
                <Switch checked={notifications.reports} onCheckedChange={(checked) => setNotifications({ ...notifications, reports: checked })} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Task Assignments</Label>
                  <p className="text-xs text-muted-foreground">When tasks are assigned to you</p>
                </div>
                <Switch checked={notifications.tasks} onCheckedChange={(checked) => setNotifications({ ...notifications, tasks: checked })} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
