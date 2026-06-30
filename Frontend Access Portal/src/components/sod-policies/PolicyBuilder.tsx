import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Eye, Lightbulb, Edit, TestTube, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PolicyBuilderProps {
  policies?: any[];
  onPolicyUpdate?: (policy: any) => void;
}

export const PolicyBuilder = ({ policies = [], onPolicyUpdate }: PolicyBuilderProps) => {
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [conditions, setConditions] = useState([
    { type: 'role', operator: 'AND', value: '', negation: false }
  ]);
  const { toast } = useToast();

  const addCondition = () => {
    setConditions([...conditions, { type: 'role', operator: 'AND', value: '', negation: false }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const handleEditPolicy = (policy: any) => {
    toast({
      title: "Edit Policy",
      description: `Opening editor for "${policy.name}"`,
    });
  };

  const handleTestPolicy = (policy: any) => {
    toast({
      title: "Testing Policy",
      description: `Running tests for "${policy.name}"`,
    });
  };

  const handleClonePolicy = (policy: any) => {
    const clonedPolicy = {
      ...policy,
      id: `POL-${Date.now()}`,
      name: `${policy.name} (Copy)`,
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    if (onPolicyUpdate) {
      onPolicyUpdate(clonedPolicy);
    }
    
    toast({
      title: "Policy Cloned",
      description: `Created copy of "${policy.name}"`,
    });
  };

  const existingPolicies = [
    {
      id: 'pol-001',
      name: 'SOX Financial Controls',
      description: 'Prevent users from having both financial approval and system administration access',
      conditions: 'Role: Finance Manager AND NOT Role: IT Administrator',
      status: 'Active',
      violations: 3,
      lastModified: '2025-06-15'
    },
    {
      id: 'pol-002',
      name: 'HR Data Protection',
      description: 'Segregate HR data access from sales operations',
      conditions: 'Entitlement: View Payroll AND NOT Role: Sales Director',
      status: 'Active',
      violations: 1,
      lastModified: '2025-06-10'
    },
    {
      id: 'pol-003',
      name: 'Audit Independence',
      description: 'Ensure auditors cannot audit their own areas of responsibility',
      conditions: 'Role: Audit Manager AND NOT Department: Operations',
      status: 'Draft',
      violations: 0,
      lastModified: '2025-06-12'
    },
    ...policies
  ];

  return (
    <div className="space-y-6">
      {/* Policy Builder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New SoD Policy</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Suggestions
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policyName">Policy Name</Label>
              <Input
                id="policyName"
                placeholder="e.g., SOX Financial Controls"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select>
                <SelectTrigger id="riskLevel">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyDescription">Description</Label>
            <Textarea
              id="policyDescription"
              placeholder="Describe the purpose and scope of this SoD policy..."
              value={policyDescription}
              onChange={(e) => setPolicyDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Policy Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Policy Conditions</Label>
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>

            {conditions.map((condition, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  {index > 0 && (
                    <div className="space-y-2">
                      <Label>Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={condition.type}
                      onValueChange={(value) => updateCondition(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="role">Role</SelectItem>
                        <SelectItem value="entitlement">Entitlement</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="application">Application</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Select
                      value={condition.value}
                      onValueChange={(value) => updateCondition(index, 'value', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finance-manager">Finance Manager</SelectItem>
                        <SelectItem value="it-admin">IT Administrator</SelectItem>
                        <SelectItem value="hr-partner">HR Business Partner</SelectItem>
                        <SelectItem value="sales-director">Sales Director</SelectItem>
                        <SelectItem value="audit-manager">Audit Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={condition.negation}
                      onCheckedChange={(value) => updateCondition(index, 'negation', value)}
                    />
                    <Label>NOT</Label>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    disabled={conditions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Policy Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Enforcement Mode</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="detective">Detective</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Compliance Framework</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sox">SOX</SelectItem>
                  <SelectItem value="gdpr">GDPR</SelectItem>
                  <SelectItem value="iso27001">ISO 27001</SelectItem>
                  <SelectItem value="internal">Internal Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Auto-Resolution</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch />
                <span className="text-sm text-gray-600">Enable automatic conflict resolution</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline">Cancel</Button>
            <Button variant="outline">Save as Draft</Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Existing SoD Policies ({existingPolicies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {existingPolicies.map((policy, index) => (
              <div key={policy.id || index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{policy.name}</h4>
                      <Badge variant={policy.status === 'Active' ? 'default' : 'secondary'}>
                        {policy.status}
                      </Badge>
                      {policy.violations > 0 && (
                        <Badge variant="destructive">
                          {policy.violations} violations
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
                      {policy.conditions}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Last modified: {policy.lastModified}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPolicy(policy)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestPolicy(policy)}
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleClonePolicy(policy)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Clone
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
