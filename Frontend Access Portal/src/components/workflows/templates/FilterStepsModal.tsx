import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, Search, Clock, Shield, AlertTriangle, 
  Zap, UserCheck, Settings, Mail, Database
} from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow';

interface FilterStepsModalProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onClose: () => void;
}

export const FilterStepsModal = ({ template, open, onClose }: FilterStepsModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [showOnlyLongRunning, setShowOnlyLongRunning] = useState(false);

  if (!template) return null;

  const steps = template.linearSteps || [];

  const stepTypes = Array.from(new Set(steps.map(step => step.type)));
  const complianceFrameworks = Array.from(new Set(
    steps.flatMap(step => step.metadata?.complianceFramework || [])
  ));

  const filteredSteps = useMemo(() => {
    return steps.filter(step => {
      // Search filter
      if (searchTerm && !step.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !step.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(step.type)) {
        return false;
      }

      // Compliance filter
      if (selectedCompliance.length > 0) {
        const stepCompliance = step.metadata?.complianceFramework || [];
        if (!selectedCompliance.some(comp => stepCompliance.includes(comp))) {
          return false;
        }
      }

      // Risk level filter
      if (selectedRiskLevel !== 'all' && step.riskLevel !== selectedRiskLevel) {
        return false;
      }

      // Long running filter
      if (showOnlyLongRunning) {
        const duration = step.metadata?.estimatedDuration || '';
        const hasLongDuration = duration.includes('hour') || 
          (duration.includes('minute') && parseInt(duration) > 30);
        if (!hasLongDuration) {
          return false;
        }
      }

      return true;
    });
  }, [steps, searchTerm, selectedTypes, selectedCompliance, selectedRiskLevel, showOnlyLongRunning]);

  const getStepIcon = (stepType: string) => {
    const icons = {
      trigger: Zap,
      condition: Shield,
      approval: UserCheck,
      provisioning: Settings,
      notification: Mail,
      database: Database
    };
    return icons[stepType as keyof typeof icons] || Settings;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedCompliance([]);
    setSelectedRiskLevel('all');
    setShowOnlyLongRunning(false);
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleComplianceToggle = (framework: string) => {
    setSelectedCompliance(prev => 
      prev.includes(framework) 
        ? prev.filter(f => f !== framework)
        : [...prev, framework]
    );
  };

  const handleLongRunningChange = (checked: boolean | "indeterminate") => {
    setShowOnlyLongRunning(checked === true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter Workflow Steps: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Filter Options
                <Button onClick={clearAllFilters} variant="outline" size="sm">
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div>
                <Label htmlFor="search">Search Steps</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by step name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Step Types */}
              <div>
                <Label>Step Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stepTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => handleTypeToggle(type)}
                      />
                      <Label htmlFor={`type-${type}`} className="text-sm capitalize">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Frameworks */}
              {complianceFrameworks.length > 0 && (
                <div>
                  <Label>Compliance Frameworks</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {complianceFrameworks.map(framework => (
                      <div key={framework} className="flex items-center space-x-2">
                        <Checkbox
                          id={`compliance-${framework}`}
                          checked={selectedCompliance.includes(framework)}
                          onCheckedChange={() => handleComplianceToggle(framework)}
                        />
                        <Label htmlFor={`compliance-${framework}`} className="text-sm">
                          {framework}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Level */}
              <div>
                <Label htmlFor="risk-level">Risk Level</Label>
                <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                  <SelectTrigger id="risk-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Filters */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="long-running"
                  checked={showOnlyLongRunning}
                  onCheckedChange={handleLongRunningChange}
                />
                <Label htmlFor="long-running" className="text-sm">
                  Show only long-running steps ({'>'}30 minutes)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Filtered Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Filtered Steps
                <Badge variant="secondary">
                  {filteredSteps.length} of {steps.length} steps
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSteps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No steps match the current filters</p>
                  <Button onClick={clearAllFilters} variant="outline" size="sm" className="mt-2">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSteps.map((step, index) => {
                    const StepIcon = getStepIcon(step.type);
                    return (
                      <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{step.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {step.type}
                            </Badge>
                            <Badge className={`text-xs ${getRiskColor(step.riskLevel)}`}>
                              {step.riskLevel} risk
                            </Badge>
                            {step.metadata?.estimatedDuration && (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.metadata.estimatedDuration}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          
                          {step.conditions && step.conditions.length > 0 && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-700">Conditions: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {step.conditions.map((condition, idx) => (
                                  <code key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {condition}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}

                          {step.metadata?.complianceFramework && (
                            <div className="flex flex-wrap gap-1">
                              {step.metadata.complianceFramework.map((framework, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  <Shield className="h-2 w-2 mr-1" />
                                  {framework}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
