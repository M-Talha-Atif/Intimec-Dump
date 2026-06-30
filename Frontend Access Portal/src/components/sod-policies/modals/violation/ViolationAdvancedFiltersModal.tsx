import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ViolationAdvancedFiltersModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const ViolationAdvancedFiltersModal = ({ open, onClose, onApply }: ViolationAdvancedFiltersModalProps) => {
  const [filters, setFilters] = useState({
    status: [] as string[],
    severity: [] as string[],
    riskScoreMin: '',
    riskScoreMax: '',
    systems: [] as string[],
    slaBreached: false,
    hasException: false,
    assignedOnly: false,
    detectedDateFrom: '',
    detectedDateTo: '',
  });
  const { toast } = useToast();

  const savedPresets = [
    { name: 'Critical Open', count: 12 },
    { name: 'SLA Breached', count: 5 },
    { name: 'My Assigned', count: 8 },
  ];

  const handleApply = () => {
    onApply(filters);
    toast({ title: "Filters Applied", description: "Violation list has been filtered" });
    onClose();
  };

  const handleReset = () => {
    setFilters({
      status: [], severity: [], riskScoreMin: '', riskScoreMax: '',
      systems: [], slaBreached: false, hasException: false, assignedOnly: false,
      detectedDateFrom: '', detectedDateTo: '',
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
                Advanced Violation Filters
              </DialogTitle>
              <DialogDescription>
                Apply multi-criteria filters to narrow down the violation list.
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
                      <Badge key={preset.name} variant="outline" className="cursor-pointer hover:bg-accent"
                        onClick={() => toast({ title: "Preset Loaded", description: preset.name })}>
                        {preset.name} ({preset.count})
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Status</Label>
                    <div className="space-y-2">
                      {['open', 'in_review', 'in_remediation', 'resolved', 'escalated'].map((status) => (
                        <div key={status} className="flex items-center gap-2">
                          <Checkbox id={`status-${status}`} checked={filters.status.includes(status)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({ ...prev, status: checked ? [...prev.status, status] : prev.status.filter(s => s !== status) }));
                            }} />
                          <Label htmlFor={`status-${status}`} className="font-normal capitalize cursor-pointer">
                            {status.replace(/_/g, ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Severity</Label>
                    <div className="space-y-2">
                      {['critical', 'high', 'medium', 'low'].map((severity) => (
                        <div key={severity} className="flex items-center gap-2">
                          <Checkbox id={`severity-${severity}`} checked={filters.severity.includes(severity)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({ ...prev, severity: checked ? [...prev.severity, severity] : prev.severity.filter(s => s !== severity) }));
                            }} />
                          <Label htmlFor={`severity-${severity}`} className="font-normal capitalize cursor-pointer">
                            {severity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Affected Systems</Label>
                    <div className="space-y-2">
                      {['SAP ERP', 'Oracle Financials', 'Workday', 'Salesforce'].map((system) => (
                        <div key={system} className="flex items-center gap-2">
                          <Checkbox id={`system-${system}`} checked={filters.systems.includes(system)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({ ...prev, systems: checked ? [...prev.systems, system] : prev.systems.filter(s => s !== system) }));
                            }} />
                          <Label htmlFor={`system-${system}`} className="font-normal cursor-pointer">{system}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Quick Filters</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox id="sla-breached" checked={filters.slaBreached}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, slaBreached: checked as boolean }))} />
                        <Label htmlFor="sla-breached" className="font-normal cursor-pointer">SLA Breached</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="has-exception" checked={filters.hasException}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasException: checked as boolean }))} />
                        <Label htmlFor="has-exception" className="font-normal cursor-pointer">Has Exception</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="assigned-only" checked={filters.assignedOnly}
                          onCheckedChange={(checked) => setFilters(prev => ({ ...prev, assignedOnly: checked as boolean }))} />
                        <Label htmlFor="assigned-only" className="font-normal cursor-pointer">Assigned to Me</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Risk Score Range</Label>
                  <div className="flex items-center gap-3">
                    <Input type="number" placeholder="Min (0)" min="0" max="100" value={filters.riskScoreMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, riskScoreMin: e.target.value }))} />
                    <span className="text-muted-foreground">to</span>
                    <Input type="number" placeholder="Max (100)" min="0" max="100" value={filters.riskScoreMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, riskScoreMax: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Detection Date Range</Label>
                  <div className="flex items-center gap-3">
                    <Input type="date" value={filters.detectedDateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, detectedDateFrom: e.target.value }))} />
                    <span className="text-muted-foreground">to</span>
                    <Input type="date" value={filters.detectedDateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, detectedDateTo: e.target.value }))} />
                  </div>
                </div>

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
