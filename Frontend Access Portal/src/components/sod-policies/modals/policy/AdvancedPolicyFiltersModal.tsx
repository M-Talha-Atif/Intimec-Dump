import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Filter, Save, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AdvancedPolicyFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const AdvancedPolicyFiltersModal = ({ open, onClose, onApply }: AdvancedPolicyFiltersModalProps) => {
  const [filters, setFilters] = useState({
    status: [] as string[],
    riskLevel: [] as string[],
    enforcementMode: [] as string[],
    compliance: [] as string[],
    tags: '',
    violationCountMin: '',
    violationCountMax: '',
    createdDateFrom: '',
    createdDateTo: '',
  });
  const [presetName, setPresetName] = useState('');
  const { toast } = useToast();

  const savedPresets = [
    { name: 'High Risk Active', count: 15 },
    { name: 'SOX Compliance', count: 23 },
    { name: 'Preventive Only', count: 8 },
  ];

  const handleApply = () => {
    onApply(filters);
    toast({
      title: "Filters Applied",
      description: "Policy list has been filtered",
    });
    onClose();
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a preset name",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Preset Saved",
      description: `Filter preset "${presetName}" has been saved`,
    });
    setPresetName('');
  };

  const handleReset = () => {
    setFilters({
      status: [],
      riskLevel: [],
      enforcementMode: [],
      compliance: [],
      tags: '',
      violationCountMin: '',
      violationCountMax: '',
      createdDateFrom: '',
      createdDateTo: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl flex flex-col p-0 h-[85vh]">
        <div className="flex flex-col h-full min-w-0">
          <div className="flex-shrink-0 px-6 py-4">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Policy Filters
              </DialogTitle>
              <DialogDescription>
                Apply multi-criteria filters and save presets for quick access.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-6">
                {/* Saved Presets */}
                <div className="space-y-2">
                  <Label>Saved Filter Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {savedPresets.map((preset) => (
                      <Badge
                        key={preset.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => toast({ title: "Preset Loaded", description: preset.name })}
                      >
                        {preset.name} ({preset.count})
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Status Filter */}
                  <div className="space-y-3">
                    <Label>Status</Label>
                    <div className="space-y-2">
                      {['active', 'draft', 'inactive', 'archived'].map((status) => (
                        <div key={status} className="flex items-center gap-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status.includes(status)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                status: checked
                                  ? [...prev.status, status]
                                  : prev.status.filter(s => s !== status)
                              }));
                            }}
                          />
                          <Label htmlFor={`status-${status}`} className="font-normal capitalize cursor-pointer">
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Level Filter */}
                  <div className="space-y-3">
                    <Label>Risk Level</Label>
                    <div className="space-y-2">
                      {['critical', 'high', 'medium', 'low'].map((risk) => (
                        <div key={risk} className="flex items-center gap-2">
                          <Checkbox
                            id={`risk-${risk}`}
                            checked={filters.riskLevel.includes(risk)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                riskLevel: checked
                                  ? [...prev.riskLevel, risk]
                                  : prev.riskLevel.filter(r => r !== risk)
                              }));
                            }}
                          />
                          <Label htmlFor={`risk-${risk}`} className="font-normal capitalize cursor-pointer">
                            {risk}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enforcement Mode */}
                  <div className="space-y-3">
                    <Label>Enforcement Mode</Label>
                    <div className="space-y-2">
                      {['preventive', 'detective', 'advisory'].map((mode) => (
                        <div key={mode} className="flex items-center gap-2">
                          <Checkbox
                            id={`mode-${mode}`}
                            checked={filters.enforcementMode.includes(mode)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                enforcementMode: checked
                                  ? [...prev.enforcementMode, mode]
                                  : prev.enforcementMode.filter(m => m !== mode)
                              }));
                            }}
                          />
                          <Label htmlFor={`mode-${mode}`} className="font-normal capitalize cursor-pointer">
                            {mode}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Compliance Framework */}
                  <div className="space-y-3">
                    <Label>Compliance Framework</Label>
                    <div className="space-y-2">
                      {['SOX', 'GDPR', 'ISO27001', 'HIPAA'].map((framework) => (
                        <div key={framework} className="flex items-center gap-2">
                          <Checkbox
                            id={`compliance-${framework}`}
                            checked={filters.compliance.includes(framework)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                compliance: checked
                                  ? [...prev.compliance, framework]
                                  : prev.compliance.filter(c => c !== framework)
                              }));
                            }}
                          />
                          <Label htmlFor={`compliance-${framework}`} className="font-normal cursor-pointer">
                            {framework}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Violation Count Range */}
                <div className="space-y-2">
                  <Label>Violation Count Range</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.violationCountMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, violationCountMin: e.target.value }))}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.violationCountMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, violationCountMax: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Created Date Range</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="date"
                      value={filters.createdDateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, createdDateFrom: e.target.value }))}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={filters.createdDateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, createdDateTo: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="e.g. finance, critical, sox-404"
                    value={filters.tags}
                    onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                {/* Save as Preset */}
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <Label>Save Current Filters as Preset</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Preset name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                    />
                    <Button onClick={handleSavePreset} variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleReset}>
                    <X className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleApply}>
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
