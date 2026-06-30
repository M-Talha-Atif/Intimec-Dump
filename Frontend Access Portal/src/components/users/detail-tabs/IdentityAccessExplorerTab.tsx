
import React from 'react';
import { type User, type AccessItem } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { GitBranch, GitCommit, UserCheck, ChevronsUpDown, Shield, KeyRound, Server, FileText, Users } from 'lucide-react';
import { getIdentityProfile } from '@/data/mock-identity-profiles';

const provisioningIcons = {
  'Birthright': <GitCommit className="h-4 w-4 text-sky-600" />,
  'Manager Assignment': <UserCheck className="h-4 w-4 text-indigo-600" />,
  'Automated Rule': <Server className="h-4 w-4 text-slate-600" />,
  'User Request': <FileText className="h-4 w-4 text-orange-600" />,
  'Exception': <Shield className="h-4 w-4 text-red-600" />,
  'Role-Based': <KeyRound className="h-4 w-4 text-purple-600" />,
  'Rule-Based': <Server className="h-4 w-4 text-slate-600" />,
  'Manual Request': <FileText className="h-4 w-4 text-orange-600" />,
}

const AccessPath = ({ user, item }: { user: User, item: AccessItem }) => {
  const pathSteps = [];
  pathSteps.push({ icon: <Users className="h-4 w-4" />, text: `Identity: ${user.name}` });
  
  if (item.provisioningSource === 'Manager Assignment') {
    pathSteps.push({ icon: <UserCheck className="h-4 w-4" />, text: `Manager "${user.manager}" assigned Role "${item.roleName || item.name}"` });
  }
  if (item.provisioningSource === 'User Request') {
    pathSteps.push({ icon: <FileText className="h-4 w-4" />, text: `User requested access` });
  }
   if (item.provisioningSource === 'Birthright') {
    pathSteps.push({ icon: <GitCommit className="h-4 w-4" />, text: `Birthright policy for Department "${user.department}"` });
  }
  if (item.provisioningSource === 'Automated Rule') {
    pathSteps.push({ icon: <Server className="h-4 w-4" />, text: `Automated rule triggered assignment` });
  }

  if (item.roleName || item.type === 'Role') {
     pathSteps.push({ icon: <KeyRound className="h-4 w-4" />, text: `Role "${item.roleName || item.name}" grants Entitlement` });
  }

  pathSteps.push({ icon: <Shield className="h-4 w-4" />, text: `Entitlement: ${item.name}` });
  
  return (
    <div className="pl-4 mt-2 space-y-2">
      {pathSteps.map((step, index) => (
         <div key={index} className="flex items-center gap-3">
           <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100">
             {step.icon}
           </div>
           <span className="text-sm text-slate-600">{step.text}</span>
         </div>
      ))}
    </div>
  );
};

const IdentityAccessExplorerTab = ({ user }: { user: User }) => {
  // Get enhanced profile data
  const profile = getIdentityProfile(user.id);
  
  let roles: AccessItem[] = [];
  let entitlementsByRole: (roleId: string) => AccessItem[] = () => [];

  if (profile?.access) {
    // Use profile access data
    roles = profile.access.map(acc => ({
      id: acc.id,
      type: 'Role' as 'Role' | 'Entitlement',
      name: acc.roleName,
      description: `${acc.type} role with ${acc.entitlements.length} entitlements`,
      source: acc.source === 'Birthright' ? 'Inherited' : 'Direct' as 'Direct' | 'Inherited',
      risk: 'Medium' as 'Low' | 'Medium' | 'High',
      owner: acc.owner,
      lastUsed: acc.assignedOn,
      roleId: acc.id,
      roleName: acc.roleName,
      provisioningSource: acc.source as 'Birthright' | 'Manager Assignment' | 'Automated Rule' | 'User Request' | 'Exception'
    }));

    entitlementsByRole = (roleId: string) => {
      const role = profile.access.find(acc => acc.id === roleId);
      return role?.entitlements.map((entitlement, index) => ({
        id: `${roleId}_ent_${index}`,
        type: 'Entitlement' as 'Role' | 'Entitlement',
        name: entitlement,
        description: `Entitlement granted by ${role.roleName}`,
        source: role.source === 'Birthright' ? 'Inherited' : 'Direct' as 'Direct' | 'Inherited',
        risk: entitlement.includes('Admin') ? 'High' : 'Low' as 'Low' | 'Medium' | 'High',
        owner: role.owner,
        lastUsed: role.assignedOn,
        roleId: roleId,
        roleName: role.roleName,
        provisioningSource: role.source as 'Birthright' | 'Manager Assignment' | 'Automated Rule' | 'User Request' | 'Exception'
      })) || [];
    };
  } else {
    // Fallback to user access data
    const accessData = user.access || [];
    roles = accessData.filter(item => item.type === 'Role');
    entitlementsByRole = (roleId: string) => {
      return accessData.filter(item => item.type === 'Entitlement' && item.roleId === roleId);
    };
  }

  if (roles.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Access Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">No roles or entitlements found for this identity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-4">
      <CardHeader>
        <CardTitle>Access Explorer</CardTitle>
        <CardDescription>Drill down to see how each entitlement was granted.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {roles.map(role => (
            <AccordionItem value={role.id} key={role.id} className="bg-slate-50 rounded-lg border">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                   <KeyRound className="h-5 w-5 text-slate-600"/>
                  <span className="font-semibold text-slate-800">{role.name}</span>
                  <Badge variant="outline">{role.source}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                {entitlementsByRole(role.id).map(entitlement => (
                  <Collapsible key={entitlement.id} className="py-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-slate-700">{entitlement.name}</div>
                      <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
                          Show Path <ChevronsUpDown className="h-4 w-4"/>
                        </button>
                      </CollapsibleTrigger>
                    </div>
                    {entitlement.provisioningSource && (
                       <Badge variant="secondary" className="mt-1 gap-1.5 pl-1.5">
                         {provisioningIcons[entitlement.provisioningSource]}
                         {entitlement.provisioningSource}
                       </Badge>
                    )}
                    <CollapsibleContent>
                      <AccessPath user={user} item={entitlement} />
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default IdentityAccessExplorerTab;
