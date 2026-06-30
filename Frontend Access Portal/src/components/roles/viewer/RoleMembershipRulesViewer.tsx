
import React, { useMemo } from 'react';
import { Role } from '@/types/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Users, Bot, UserCheck, UserX } from 'lucide-react';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface RoleMembershipRulesViewerProps {
  role: Role;
}

// Generate mock users based on role data
const generateMockUsers = (role: Role) => {
  const firstNames = ['James', 'Sarah', 'Michael', 'Emily', 'Robert', 'Lisa', 'David', 'Jennifer', 'Carlos', 'Aisha', 'Wei', 'Priya'];
  const lastNames = ['Thompson', 'Garcia', 'Kim', 'Patel', 'Anderson', 'Chen', 'Williams', 'Singh', 'Mueller', 'Tanaka', 'Brown', 'Lopez'];
  const departments = [role.businessUnit, role.businessUnit, role.businessUnit, 'IT', 'Operations'];
  const count = Math.min(role.userCount, 8);
  const inactiveCount = role.inactiveUserCount || 0;

  return Array.from({ length: count }, (_, i) => ({
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    department: departments[i % departments.length],
    status: i < count - inactiveCount ? 'Active' as const : 'Inactive' as const,
    lastLogin: i < count - inactiveCount
      ? `2025-06-${String(15 - i).padStart(2, '0')}`
      : `2025-03-${String(10 + i).padStart(2, '0')}`,
    assignmentType: role.membershipRule ? (i % 3 === 0 ? 'Direct' as const : 'Rule-based' as const) : 'Direct' as const,
  }));
};

const RoleMembershipRulesViewer: React.FC<RoleMembershipRulesViewerProps> = ({ role }) => {
  const users = useMemo(() => generateMockUsers(role), [role]);
  const activeCount = role.userCount - (role.inactiveUserCount || 0);

  return (
    <div className="space-y-6">
      {/* AI Membership Suggestion */}
      {role.aiMembershipSuggestion && (
        <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">AI Membership Suggestion</h4>
            <p className="text-sm text-blue-800 dark:text-blue-400">{role.aiMembershipSuggestion}</p>
          </div>
        </div>
      )}

      {/* Membership Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{role.userCount}</div>
          <div className="text-sm text-blue-800 dark:text-blue-300 flex items-center justify-center gap-1">
            Total Members
            <InfoTooltip text="Total number of identities currently assigned to this role." />
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
          <div className="text-sm text-green-800 dark:text-green-300 flex items-center justify-center gap-1">
            Active Members
            <InfoTooltip text="Members who have logged in within the last 90 days." />
          </div>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{role.inactiveUserCount || 0}</div>
          <div className="text-sm text-orange-800 dark:text-orange-300 flex items-center justify-center gap-1">
            Inactive (90d)
            <InfoTooltip text="Members with no login activity in 90+ days. Consider removing access to reduce risk." />
          </div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {role.membershipRule ? 'Dynamic' : 'Manual'}
          </div>
          <div className="text-sm text-purple-800 dark:text-purple-300 flex items-center justify-center gap-1">
            Assignment Mode
            <InfoTooltip text="Dynamic: members are auto-assigned by rule. Manual: members are individually assigned." />
          </div>
        </div>
      </div>

      {/* Membership Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Code className="h-5 w-5" />
            <span>Membership Rule Expression</span>
            <InfoTooltip text="The programmatic rule that determines automatic role assignment. When defined, users matching this criteria are auto-provisioned." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm text-foreground whitespace-pre-wrap font-mono">
            {role.membershipRule || 'No membership rules defined. Assignment is manual.'}
          </pre>
        </CardContent>
      </Card>

      {/* User Membership Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Users className="h-5 w-5" />
            <span>Assigned Users</span>
            <InfoTooltip text="Users currently assigned to this role, showing their status and how they were assigned." />
            {role.userCount > 8 && (
              <Badge variant="secondary" className="text-xs ml-2">Showing 8 of {role.userCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {role.userCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No users assigned</p>
              <p className="text-sm mt-1">This role currently has no members.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Department</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Last Login</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground text-sm">Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr key={i} className="border-b border-muted hover:bg-muted/30">
                      <td className="py-3 px-3 font-medium text-foreground">{user.name}</td>
                      <td className="py-3 px-3 text-sm text-muted-foreground">{user.department}</td>
                      <td className="py-3 px-3">
                        {user.status === 'Active' ? (
                          <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-400">
                            <UserCheck className="h-3 w-3 mr-1" />Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                            <UserX className="h-3 w-3 mr-1" />Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground">{user.lastLogin}</td>
                      <td className="py-3 px-3">
                        <Badge variant="secondary" className="text-xs">{user.assignmentType}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleMembershipRulesViewer;
