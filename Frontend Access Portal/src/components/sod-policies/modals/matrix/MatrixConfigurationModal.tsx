import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Grid3x3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface MatrixConfigurationModalProps { open: boolean; onClose: () => void; onApply: (config: any) => void; }

export const MatrixConfigurationModal = ({ open, onClose, onApply }: MatrixConfigurationModalProps) => {
  const [config, setConfig] = useState({ xAxis: 'roles', yAxis: 'entitlements', visualization: 'heatmap', colorScheme: 'risk', showEmpty: false, showExceptions: true, minRiskScore: 50, includeSystems: [] as string[] });
  const { toast } = useToast();

  const handleApply = () => { onApply(config); toast({ title: "Configuration Applied", description: "Conflict matrix has been updated" }); onClose(); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex flex-col p-0 h-full">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Matrix Configuration</DialogTitle>
              <DialogDescription>Configure the conflict matrix visualization and data display settings.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X-Axis (Horizontal)</Label>
                    <Select value={config.xAxis} onValueChange={(v) => setConfig(prev => ({ ...prev, xAxis: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="roles">Roles</SelectItem><SelectItem value="entitlements">Entitlements</SelectItem><SelectItem value="applications">Applications</SelectItem><SelectItem value="users">Users</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Y-Axis (Vertical)</Label>
                    <Select value={config.yAxis} onValueChange={(v) => setConfig(prev => ({ ...prev, yAxis: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="roles">Roles</SelectItem><SelectItem value="entitlements">Entitlements</SelectItem><SelectItem value="applications">Applications</SelectItem><SelectItem value="users">Users</SelectItem></SelectContent></Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visualization Type</Label>
                  <Select value={config.visualization} onValueChange={(v) => setConfig(prev => ({ ...prev, visualization: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="heatmap"><div><div className="font-medium">Heatmap</div><div className="text-xs text-muted-foreground">Color-coded grid showing conflict intensity</div></div></SelectItem><SelectItem value="network"><div><div className="font-medium">Network Graph</div><div className="text-xs text-muted-foreground">Node-based relationship visualization</div></div></SelectItem><SelectItem value="sankey"><div><div className="font-medium">Sankey Diagram</div><div className="text-xs text-muted-foreground">Flow-based conflict visualization</div></div></SelectItem></SelectContent></Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={config.colorScheme} onValueChange={(v) => setConfig(prev => ({ ...prev, colorScheme: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="risk">Risk-based (Red/Yellow/Green)</SelectItem><SelectItem value="severity">Severity-based (Gradient)</SelectItem><SelectItem value="count">Count-based (Blue scale)</SelectItem><SelectItem value="custom">Custom Colors</SelectItem></SelectContent></Select>
                </div>

                <div className="space-y-3">
                  <Label>Display Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><Checkbox id="show-empty" checked={config.showEmpty} onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showEmpty: checked as boolean }))} /><Label htmlFor="show-empty" className="font-normal cursor-pointer">Show empty cells (no conflicts)</Label></div>
                    <div className="flex items-center gap-2"><Checkbox id="show-exceptions" checked={config.showExceptions} onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showExceptions: checked as boolean }))} /><Label htmlFor="show-exceptions" className="font-normal cursor-pointer">Highlight approved exceptions</Label></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Risk Score to Display</Label>
                  <div className="flex items-center gap-3"><Input type="range" min="0" max="100" value={config.minRiskScore} onChange={(e) => setConfig(prev => ({ ...prev, minRiskScore: parseInt(e.target.value) }))} className="flex-1" /><span className="text-sm font-medium w-12">{config.minRiskScore}</span></div>
                  <p className="text-xs text-muted-foreground">Only show conflicts with risk score above this threshold</p>
                </div>

                <div className="space-y-2">
                  <Label>Include Systems</Label>
                  <div className="space-y-2">
                    {['SAP ERP', 'Oracle Financials', 'Workday', 'Salesforce'].map(system => (
                      <div key={system} className="flex items-center gap-2"><Checkbox id={`system-${system}`} checked={config.includeSystems.includes(system)} onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeSystems: checked ? [...prev.includeSystems, system] : prev.includeSystems.filter(s => s !== system) }))} /><Label htmlFor={`system-${system}`} className="font-normal cursor-pointer">{system}</Label></div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  <Button onClick={handleApply}><Grid3x3 className="h-4 w-4 mr-2" />Apply Configuration</Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
