
import React, { useState } from 'react';
import { Role } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, Play, Users, AlertTriangle, CheckCircle, 
  Bot, Lightbulb, Eye, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleMembershipRulesEditorProps {
  role: Role;
  isEditing: boolean;
  onChange: (updates: Partial<Role>) => void;
}

const RoleMembershipRulesEditor: React.FC<RoleMembershipRulesEditorProps> = ({
  role,
  isEditing,
  onChange
}) => {
  const [testResult, setTestResult] = useState<{
    affected: number;
    added: number;
    removed: number;
    isValid: boolean;
    error?: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRuleChange = (newRule: string) => {
    onChange({ membershipRule: newRule });
    setTestResult(null); // Clear previous test results
  };

  const handleSimulateRule = async () => {
    if (!role.membershipRule) return;

    setIsSimulating(true);
    
    // Simulate rule execution
    setTimeout(() => {
      // Mock simulation results
      const mockResult = {
        affected: Math.floor(Math.random() * 50) + 10,
        added: Math.floor(Math.random() * 15) + 2,
        removed: Math.floor(Math.random() * 8) + 1,
        isValid: !role.membershipRule?.includes('invalid'),
        error: role.membershipRule?.includes('invalid') ? 'Invalid syntax in rule' : undefined
      };
      
      setTestResult(mockResult);
      setIsSimulating(false);
    }, 2000);
  };

  const predefinedRules = [
    {
      name: 'Department Based',
      rule: 'user.department == "Finance"',
      description: 'Users in the Finance department'
    },
    {
      name: 'Title and Department',
      rule: 'user.department == "Finance" && user.title.contains("Manager")',
      description: 'Managers in Finance department'
    },
    {
      name: 'Location Based',
      rule: 'user.location == "New York" && user.active == true',
      description: 'Active users in New York office'
    },
    {
      name: 'Multi-condition',
      rule: 'user.department == "IT" && user.clearanceLevel >= 3 && user.contractType == "FTE"',
      description: 'Full-time IT staff with high clearance'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Dynamic Membership Rules</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rule Editor */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Membership Rule Expression
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={role.membershipRule || ''}
                      onChange={(e) => handleRuleChange(e.target.value)}
                      placeholder="e.g., user.department == 'Finance' && user.title == 'Manager'"
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleSimulateRule}
                        disabled={!role.membershipRule || isSimulating}
                        className="flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>{isSimulating ? 'Simulating...' : 'Test Rule'}</span>
                      </Button>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview Population</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <pre className="bg-slate-100 p-4 rounded-md text-sm text-slate-800 whitespace-pre-wrap">
                    {role.membershipRule || 'No membership rules defined. Assignment is manual.'}
                  </pre>
                )}
              </div>

              {/* Test Results */}
              {testResult && (
                <Alert className={cn(
                  testResult.isValid 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                )}>
                  <div className="flex items-start space-x-2">
                    {testResult.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        {testResult.isValid ? (
                          <div>
                            <p className="font-medium text-green-800 mb-2">Rule Validation Successful</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-green-600">{testResult.affected}</div>
                                <div className="text-green-700">Total Affected</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-blue-600">{testResult.added}</div>
                                <div className="text-blue-700">Will Be Added</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-orange-600">{testResult.removed}</div>
                                <div className="text-orange-700">Will Be Removed</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-red-800">Rule Validation Failed</p>
                            <p className="text-red-700 text-sm mt-1">{testResult.error}</p>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </div>

            {/* Rule Templates */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Rule Templates</span>
              </h4>
              
              <div className="space-y-2">
                {predefinedRules.map((template, index) => (
                  <div 
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => isEditing && handleRuleChange(template.rule)}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-600 mb-2">{template.description}</div>
                    <code className="text-xs bg-gray-100 p-1 rounded block">
                      {template.rule}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {role.aiMembershipSuggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <span>AI Membership Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Smart Suggestion</p>
                  <p className="text-blue-800 text-sm">{role.aiMembershipSuggestion}</p>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        // This would apply the AI suggestion
                        const suggestedRule = 'user.department == "Finance" && user.title.contains("Analyst")';
                        handleRuleChange(suggestedRule);
                      }}
                    >
                      Apply Suggestion
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Membership Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Current Membership</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{role.userCount}</div>
              <div className="text-sm text-blue-800">Total Members</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {role.userCount - (role.inactiveUserCount || 0)}
              </div>
              <div className="text-sm text-green-800">Active Members</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {role.inactiveUserCount || 0}
              </div>
              <div className="text-sm text-orange-800">Inactive (90d)</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {role.membershipRule ? 'Dynamic' : 'Manual'}
              </div>
              <div className="text-sm text-purple-800">Assignment Mode</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleMembershipRulesEditor;
