
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Users, Link, AlertTriangle, 
  Target, UserPlus, Settings
} from 'lucide-react';
import { EntitlementSelector } from './components/EntitlementSelector';
import { RoleSelector } from './components/RoleSelector';
import { IdentitySelector } from './components/IdentitySelector';

interface RoleAssignmentsFormProps {
  roleType: 'business' | 'technical' | 'privileged';
  data: any;
  onChange: (data: any) => void;
}

// Helper functions for type safety
const getArrayLength = (value: unknown): number => {
  return Array.isArray(value) ? value.length : 0;
};

const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

const sumObjectArrayLengths = (obj: unknown): number => {
  if (!obj || typeof obj !== 'object') return 0;
  return Object.values(obj).reduce((sum: number, value: unknown) => {
    return sum + getArrayLength(value);
  }, 0);
};

export function RoleAssignmentsForm({ roleType, data, onChange }: RoleAssignmentsFormProps) {
  const [formData, setFormData] = useState({
    selectedEntitlements: [],
    entitlementTags: {},
    selectedRoles: [],
    selectedIdentities: {
      employee: [],
      'non-employee': [],
      'non-human': []
    },
    assignmentOptions: {
      autoAssign: false,
      requiresReview: true,
      scheduleReview: false
    },
    ...data
  });

  const [activeTab, setActiveTab] = useState('entitlements');
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Check for conflicts and generate suggestions
  useEffect(() => {
    const newConflicts = [];
    const newSuggestions = [];

    // SoD conflict detection
    if (getArrayLength(formData.selectedEntitlements) > 0) {
      const entitlements = formData.selectedEntitlements as string[];
      if (entitlements.includes('ent-2') && entitlements.includes('ent-1')) {
        newConflicts.push('Budget approval and financial reporting access may create SoD conflict');
      }
    }

    // Role type specific suggestions
    if (roleType === 'privileged' && getArrayLength(formData.selectedRoles) === 0) {
      newSuggestions.push('Consider linking to other privileged roles for proper governance');
    }

    if (getArrayLength(formData.selectedEntitlements) === 0 && getArrayLength(formData.selectedRoles) === 0) {
      newSuggestions.push('This role has no entitlements or role relationships defined');
    }

    // High-risk entitlement warnings
    const selectedEntitlements = formData.selectedEntitlements as string[];
    const hasHighRisk = selectedEntitlements.some(id => 
      ['ent-2', 'ent-3', 'ent-5', 'ent-8'].includes(id)
    );
    const totalIdentities = getTotalSelectedIdentities();
    if (hasHighRisk && totalIdentities > 10) {
      newConflicts.push('High-risk entitlements assigned to many identities - review recommended');
    }

    setConflicts(newConflicts);
    setSuggestions(newSuggestions);
  }, [formData, roleType]);

  const handleEntitlementToggle = (entitlementId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEntitlements: (prev.selectedEntitlements as string[]).includes(entitlementId)
        ? (prev.selectedEntitlements as string[]).filter(id => id !== entitlementId)
        : [...(prev.selectedEntitlements as string[]), entitlementId]
    }));
  };

  const handleEntitlementTag = (entitlementId: string, tag: string) => {
    setFormData(prev => ({
      ...prev,
      entitlementTags: {
        ...prev.entitlementTags,
        [entitlementId]: tag
      }
    }));
  };

  const handleRoleToggle = (roleId: string, relationshipType: string) => {
    setFormData(prev => {
      const selectedRoles = prev.selectedRoles as Array<{ roleId: string; relationshipType: string }>;
      const existingIndex = selectedRoles.findIndex(r => r.roleId === roleId);
      if (existingIndex >= 0) {
        const updated = [...selectedRoles];
        updated[existingIndex] = { roleId, relationshipType };
        return { ...prev, selectedRoles: updated };
      } else {
        return {
          ...prev,
          selectedRoles: [...selectedRoles, { roleId, relationshipType }]
        };
      }
    });
  };

  const handleIdentityToggle = (type: string, identityId: string) => {
    setFormData(prev => {
      const identities = prev.selectedIdentities as Record<string, string[]>;
      const currentList = identities[type] || [];
      return {
        ...prev,
        selectedIdentities: {
          ...identities,
          [type]: currentList.includes(identityId)
            ? currentList.filter(id => id !== identityId)
            : [...currentList, identityId]
        }
      };
    });
  };

  const handleAssignmentOptionChange = (option: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignmentOptions: {
        ...prev.assignmentOptions,
        [option]: value
      }
    }));
  };

  const getTotalSelectedIdentities = () => {
    return sumObjectArrayLengths(formData.selectedIdentities);
  };

  const getTotalAssignments = () => {
    return getArrayLength(formData.selectedEntitlements) + getArrayLength(formData.selectedRoles) + getTotalSelectedIdentities();
  };

  return (
    <div className="space-y-6">
      {/* Smart Insights */}
      {(conflicts.length > 0 || suggestions.length > 0) && (
        <div className="space-y-3">
          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Potential Issues Detected</div>
                <ul className="text-sm space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index}>• {conflict}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {suggestions.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Suggestions</div>
                <ul className="text-sm space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Assignment Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Assignment Summary</h4>
              <p className="text-sm text-blue-800">
                Total assignments: {getTotalAssignments()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-xs">
                {getArrayLength(formData.selectedEntitlements)} Entitlements
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getArrayLength(formData.selectedRoles)} Roles
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getTotalSelectedIdentities()} Identities
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entitlements" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Assign Entitlements</span>
            {getArrayLength(formData.selectedEntitlements) > 0 && (
              <Badge variant="secondary" className="text-xs">{getArrayLength(formData.selectedEntitlements)}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Link className="h-4 w-4" />
            <span>Assign to Roles</span>
            {getArrayLength(formData.selectedRoles) > 0 && (
              <Badge variant="secondary" className="text-xs">{getArrayLength(formData.selectedRoles)}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="identities" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Assign to Identities</span>
            {getTotalSelectedIdentities() > 0 && (
              <Badge variant="secondary" className="text-xs">{getTotalSelectedIdentities()}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entitlements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Entitlement Assignment</span>
              </CardTitle>
              <p className="text-sm text-slate-600">
                Select entitlements to include in this role. {roleType === 'privileged' && 'High-risk entitlements are pre-filtered for privileged roles.'}
              </p>
            </CardHeader>
            <CardContent>
              <EntitlementSelector
                roleType={roleType}
                selectedEntitlements={formData.selectedEntitlements as string[]}
                entitlementTags={formData.entitlementTags as Record<string, string>}
                onEntitlementToggle={handleEntitlementToggle}
                onEntitlementTag={handleEntitlementTag}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Role Relationships</span>
              </CardTitle>
              <p className="text-sm text-slate-600">
                Link this role to other roles to create hierarchies and inheritance patterns.
              </p>
            </CardHeader>
            <CardContent>
              <RoleSelector
                currentRoleType={roleType}
                selectedRoles={formData.selectedRoles as Array<{ roleId: string; relationshipType: string }>}
                onRoleToggle={handleRoleToggle}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="identities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Identity Assignment</span>
              </CardTitle>
              <p className="text-sm text-slate-600">
                Assign this role to specific identities at creation time.
              </p>
            </CardHeader>
            <CardContent>
              <IdentitySelector
                selectedIdentities={formData.selectedIdentities as {
                  employee: string[];
                  'non-employee': string[];
                  'non-human': string[];
                }}
                assignmentOptions={formData.assignmentOptions as {
                  autoAssign: boolean;
                  requiresReview: boolean;
                  scheduleReview: boolean;
                }}
                onIdentityToggle={handleIdentityToggle}
                onAssignmentOptionChange={handleAssignmentOptionChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Warning */}
      {getTotalAssignments() === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">No Assignments Configured</div>
            <p className="text-sm">
              You haven't linked this role to any access or recipients. Consider adding entitlements or role relationships to make this role meaningful.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
