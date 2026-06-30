
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Users, Eye, AlertCircle } from 'lucide-react';

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface RuleGroup {
  id: string;
  combinator: 'AND' | 'OR';
  rules: Rule[];
  groups: RuleGroup[];
}

interface VisualRuleBuilderProps {
  onRulesChange: () => void;
  onValidate: () => void;
  onPreview: () => void;
}

export const VisualRuleBuilder: React.FC<VisualRuleBuilderProps> = ({
  onRulesChange,
  onValidate,
  onPreview
}) => {
  const [rootGroup, setRootGroup] = useState<RuleGroup>({
    id: 'root',
    combinator: 'AND',
    rules: [
      {
        id: 'rule-1',
        field: 'department',
        operator: '=',
        value: 'Finance'
      },
      {
        id: 'rule-2',
        field: 'level',
        operator: '>=',
        value: 'Manager'
      }
    ],
    groups: []
  });

  const [previewResults, setPreviewResults] = useState<{ count: number; visible: boolean }>({
    count: 0,
    visible: false
  });

  const fieldOptions = [
    { value: 'department', label: 'Department' },
    { value: 'title', label: 'Title' },
    { value: 'level', label: 'Level' },
    { value: 'costCenter', label: 'Cost Center' },
    { value: 'country', label: 'Country' },
    { value: 'managerLevel', label: 'Manager Level' },
    { value: 'employmentType', label: 'Employment Type' },
    { value: 'location', label: 'Location' }
  ];

  const operatorOptions = [
    { value: '=', label: 'Equals' },
    { value: '!=', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'in', label: 'In' },
    { value: 'not in', label: 'Not In' },
    { value: '>', label: 'Greater Than' },
    { value: '>=', label: 'Greater Than or Equal' },
    { value: '<', label: 'Less Than' },
    { value: '<=', label: 'Less Than or Equal' },
    { value: 'isEmpty', label: 'Is Empty' },
    { value: 'isNotEmpty', label: 'Is Not Empty' }
  ];

  const addRule = (groupId: string) => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      field: '',
      operator: '=',
      value: ''
    };
    
    // Add rule to the specified group
    onRulesChange();
  };

  const addGroup = (parentGroupId: string) => {
    const newGroup: RuleGroup = {
      id: `group-${Date.now()}`,
      combinator: 'AND',
      rules: [],
      groups: []
    };
    
    // Add group to the specified parent group
    onRulesChange();
  };

  const removeRule = (ruleId: string) => {
    // Remove rule logic
    onRulesChange();
  };

  const removeGroup = (groupId: string) => {
    // Remove group logic
    onRulesChange();
  };

  const updateRule = (ruleId: string, field: keyof Rule, value: string) => {
    // Update rule logic
    onRulesChange();
  };

  const handlePreview = () => {
    // Mock preview results
    setPreviewResults({ count: 247, visible: true });
    onPreview();
  };

  const renderRule = (rule: Rule, groupId: string) => (
    <div key={rule.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white">
      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
      
      <Select value={rule.field} onValueChange={(value) => updateRule(rule.id, 'field', value)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select field" />
        </SelectTrigger>
        <SelectContent>
          {fieldOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={rule.operator} onValueChange={(value) => updateRule(rule.id, 'operator', value)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          {operatorOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={rule.value}
        onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
        placeholder="Value"
        className="flex-1"
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeRule(rule.id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderGroup = (group: RuleGroup, depth: number = 0) => (
    <Card key={group.id} className={`${depth > 0 ? 'ml-6 border-l-4 border-blue-200' : ''}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant={group.combinator === 'AND' ? 'default' : 'secondary'}>
              {group.combinator}
            </Badge>
            <Select 
              value={group.combinator} 
              onValueChange={(value: 'AND' | 'OR') => {
                // Update group combinator
                onRulesChange();
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRule(group.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Rule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addGroup(group.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Group
            </Button>
            {depth > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGroup(group.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {group.rules.map(rule => renderRule(rule, group.id))}
        </div>

        {group.groups.map(subGroup => renderGroup(subGroup, depth + 1))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Visual Rule Builder</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onValidate}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Validate Rules
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Matches
          </Button>
        </div>
      </div>

      {previewResults.visible && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Preview Results</h4>
              <p className="text-sm text-blue-800">
                {previewResults.count} users would match these rules
              </p>
            </div>
            <Button variant="link" size="sm" className="ml-auto text-blue-600">
              View Sample Users
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {renderGroup(rootGroup)}
      </div>

      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <strong>Rule Logic:</strong> Users matching the above conditions will be granted this entitlement.
        Use AND for stricter requirements, OR for broader access.
      </div>
    </div>
  );
};
