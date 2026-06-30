import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useRiskAnalyticsConfig } from '@/contexts/RiskAnalyticsConfigContext';
import { useToast } from '@/hooks/use-toast';

interface RiskSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskSettingsModal: React.FC<RiskSettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, resetConfig } = useRiskAnalyticsConfig();
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    updateConfig(localConfig);
    toast({
      title: "Settings Saved",
      description: "Risk analytics configuration has been updated.",
    });
    onClose();
  };

  const handleReset = () => {
    resetConfig();
    setLocalConfig(config);
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Risk Analytics Settings</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="scoring" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scoring">Risk Scoring</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="scoring" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Weight Configuration</CardTitle>
                  <CardDescription>
                    Adjust the importance of different factors in risk score calculation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Severity Weight</Label>
                      <span className="text-sm text-muted-foreground">{localConfig.riskWeights.severity}%</span>
                    </div>
                    <Slider
                      value={[localConfig.riskWeights.severity]}
                      onValueChange={(value) => setLocalConfig({
                        ...localConfig,
                        riskWeights: { ...localConfig.riskWeights, severity: value[0] }
                      })}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Age Weight</Label>
                      <span className="text-sm text-muted-foreground">{localConfig.riskWeights.age}%</span>
                    </div>
                    <Slider
                      value={[localConfig.riskWeights.age]}
                      onValueChange={(value) => setLocalConfig({
                        ...localConfig,
                        riskWeights: { ...localConfig.riskWeights, age: value[0] }
                      })}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Business Impact Weight</Label>
                      <span className="text-sm text-muted-foreground">{localConfig.riskWeights.businessImpact}%</span>
                    </div>
                    <Slider
                      value={[localConfig.riskWeights.businessImpact]}
                      onValueChange={(value) => setLocalConfig({
                        ...localConfig,
                        riskWeights: { ...localConfig.riskWeights, businessImpact: value[0] }
                      })}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Compliance Weight</Label>
                      <span className="text-sm text-muted-foreground">{localConfig.riskWeights.compliance}%</span>
                    </div>
                    <Slider
                      value={[localConfig.riskWeights.compliance]}
                      onValueChange={(value) => setLocalConfig({
                        ...localConfig,
                        riskWeights: { ...localConfig.riskWeights, compliance: value[0] }
                      })}
                      max={100}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Severity Thresholds</CardTitle>
                  <CardDescription>
                    Define score ranges for different severity levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Critical Threshold (score ≥)</Label>
                    <Input
                      type="number"
                      value={localConfig.severityThresholds.critical}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        severityThresholds: { ...localConfig.severityThresholds, critical: parseInt(e.target.value) }
                      })}
                      min={0}
                      max={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Risks with score ≥ {localConfig.severityThresholds.critical} are marked as Critical
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>High Threshold (score ≥)</Label>
                    <Input
                      type="number"
                      value={localConfig.severityThresholds.high}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        severityThresholds: { ...localConfig.severityThresholds, high: parseInt(e.target.value) }
                      })}
                      min={0}
                      max={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Risks with score ≥ {localConfig.severityThresholds.high} are marked as High
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Medium Threshold (score ≥)</Label>
                    <Input
                      type="number"
                      value={localConfig.severityThresholds.medium}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        severityThresholds: { ...localConfig.severityThresholds, medium: parseInt(e.target.value) }
                      })}
                      min={0}
                      max={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Risks with score ≥ {localConfig.severityThresholds.medium} are marked as Medium
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Configuration</CardTitle>
                  <CardDescription>
                    Set up automated alerts for risk thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Alerts</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications when thresholds are exceeded</p>
                    </div>
                    <Switch
                      checked={localConfig.alertsEnabled}
                      onCheckedChange={(checked) => setLocalConfig({ ...localConfig, alertsEnabled: checked })}
                    />
                  </div>

                  {localConfig.alertsEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Critical Risks Alert Threshold</Label>
                        <Input
                          type="number"
                          value={localConfig.alertThresholds.criticalRisks}
                          onChange={(e) => setLocalConfig({
                            ...localConfig,
                            alertThresholds: { ...localConfig.alertThresholds, criticalRisks: parseInt(e.target.value) }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Alert when critical risks exceed this count
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>SoD Violations Alert Threshold</Label>
                        <Input
                          type="number"
                          value={localConfig.alertThresholds.sodViolations}
                          onChange={(e) => setLocalConfig({
                            ...localConfig,
                            alertThresholds: { ...localConfig.alertThresholds, sodViolations: parseInt(e.target.value) }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Orphan Accounts Alert Threshold</Label>
                        <Input
                          type="number"
                          value={localConfig.alertThresholds.orphanAccounts}
                          onChange={(e) => setLocalConfig({
                            ...localConfig,
                            alertThresholds: { ...localConfig.alertThresholds, orphanAccounts: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="display" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Display Preferences</CardTitle>
                  <CardDescription>
                    Customize how risk data is displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Refresh</Label>
                      <p className="text-xs text-muted-foreground">Automatically refresh risk data</p>
                    </div>
                    <Switch
                      checked={localConfig.autoRefresh}
                      onCheckedChange={(checked) => setLocalConfig({ ...localConfig, autoRefresh: checked })}
                    />
                  </div>

                  {localConfig.autoRefresh && (
                    <div className="space-y-2">
                      <Label>Refresh Interval (seconds)</Label>
                      <Select
                        value={localConfig.refreshInterval.toString()}
                        onValueChange={(value) => setLocalConfig({ ...localConfig, refreshInterval: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                          <SelectItem value="300">5 minutes</SelectItem>
                          <SelectItem value="600">10 minutes</SelectItem>
                          <SelectItem value="1800">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Default Time Range</Label>
                    <Select
                      value={localConfig.defaultTimeRange}
                      onValueChange={(value: any) => setLocalConfig({ ...localConfig, defaultTimeRange: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select
                      value={localConfig.chartType}
                      onValueChange={(value: any) => setLocalConfig({ ...localConfig, chartType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
