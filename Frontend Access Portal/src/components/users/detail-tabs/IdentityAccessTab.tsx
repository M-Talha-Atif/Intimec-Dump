
import React, { useState, useMemo } from 'react';
import { type User, type AccessItem } from '@/data/mock-users';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, Clock, Users, Shield, CheckCircle2 } from 'lucide-react';
import { getIdentityProfile } from '@/data/mock-identity-profiles';

const riskColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-red-100 text-red-800',
}

type FilterType = 'All' | 'Direct' | 'Inherited';

const mockCertDates = ['2024-12-15', '2025-01-20', '2024-11-05', '2025-02-10'];
const mockUsage = ['Active', 'Active', 'Unused', 'Active', 'Unused'];

const IdentityAccessTab = ({ user }: { user: User }) => {
  const [filter, setFilter] = useState<FilterType>('All');
  
  const profile = getIdentityProfile(user.id);
  
  const { roles, entitlements } = useMemo(() => {
    if (profile?.access) {
      const accessData = profile.access.map(acc => ({
        id: acc.id,
        type: 'Role' as 'Role' | 'Entitlement',
        name: acc.roleName,
        description: `${acc.type} role with ${acc.entitlements.length} entitlements`,
        source: acc.source === 'Birthright' ? 'Inherited' : 'Direct' as 'Direct' | 'Inherited',
        risk: 'Medium' as 'Low' | 'Medium' | 'High',
        owner: acc.owner,
        lastUsed: acc.assignedOn,
        roleId: acc.id,
        classifications: acc.entitlements.some(e => e.includes('Admin')) ? ['High Risk'] as ('High Risk' | 'PII' | 'SOX')[] : [] as ('High Risk' | 'PII' | 'SOX')[],
        peerDeviation: false,
        provisioningSource: acc.source as 'Birthright' | 'Manager Assignment' | 'Automated Rule' | 'User Request' | 'Exception'
      }));
      
      const roles = accessData.filter(item => item.type === 'Role');
      const entitlements: AccessItem[] = [];
      profile.access.forEach(acc => {
        acc.entitlements.forEach((entitlement, index) => {
          entitlements.push({
            id: `${acc.id}_ent_${index}`,
            type: 'Entitlement',
            name: entitlement,
            description: `Entitlement granted by ${acc.roleName}`,
            source: acc.source === 'Birthright' ? 'Inherited' : 'Direct' as 'Direct' | 'Inherited',
            risk: entitlement.includes('Admin') ? 'High' : 'Low' as 'Low' | 'Medium' | 'High',
            owner: acc.owner,
            lastUsed: acc.assignedOn,
            roleId: acc.id,
            classifications: entitlement.includes('Admin') ? ['High Risk'] as ('High Risk' | 'PII' | 'SOX')[] : [] as ('High Risk' | 'PII' | 'SOX')[],
            peerDeviation: false,
            provisioningSource: acc.source as 'Birthright' | 'Manager Assignment' | 'Automated Rule' | 'User Request' | 'Exception'
          });
        });
      });
      return { roles, entitlements };
    } else {
      const accessData = user.access || [];
      return { roles: accessData.filter(i => i.type === 'Role'), entitlements: accessData.filter(i => i.type === 'Entitlement') };
    }
  }, [user.access, profile]);

  const filteredRoles = useMemo(() => {
    if (filter === 'All') return roles;
    return roles.filter(role => role.source === filter);
  }, [roles, filter]);

  const directCount = roles.filter(r => r.source === 'Direct').length;
  const inheritedCount = roles.filter(r => r.source === 'Inherited').length;
  const highRiskEntitlements = entitlements.filter(e => e.risk === 'High').length;

  if ((!profile?.access && !user.access) || (profile?.access?.length === 0 && (!user.access || user.access.length === 0))) {
    return (
      <Card className="pt-4">
        <CardHeader><CardTitle>Roles & Entitlements</CardTitle></CardHeader>
        <CardContent><p className="text-slate-500">No roles or entitlements found.</p></CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs text-slate-500">Total Roles</p>
          <p className="text-xl font-bold">{roles.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Direct</p>
          <p className="text-xl font-bold text-blue-600">{directCount}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-slate-500">Inherited</p>
          <p className="text-xl font-bold text-purple-600">{inheritedCount}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <p className="text-xs text-slate-500">High Risk</p>
          </div>
          <p className="text-xl font-bold text-red-600">{highRiskEntitlements}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Roles & Entitlements</CardTitle>
          <CardDescription>Access assignments with certification status and usage indicators</CardDescription>
          <div className="pt-2">
            <Button size="sm" variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')} className="mr-2">All</Button>
            <Button size="sm" variant={filter === 'Direct' ? 'default' : 'outline'} onClick={() => setFilter('Direct')} className="mr-2">Direct</Button>
            <Button size="sm" variant={filter === 'Inherited' ? 'default' : 'outline'} onClick={() => setFilter('Inherited')}>Inherited</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={filteredRoles.map(r => r.id)} className="w-full">
            {filteredRoles.map((role, roleIdx) => {
              const roleEntitlements = entitlements.filter(e => e.roleId === role.id);
              const certDate = mockCertDates[roleIdx % mockCertDates.length];
              return (
                <AccordionItem value={role.id} key={role.id}>
                  <AccordionTrigger>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{role.name}</span>
                        <Badge variant="outline" className="text-[10px]">{role.source}</Badge>
                        <Badge className={cn(riskColors[role.risk], 'text-[10px]')}>{role.risk} Risk</Badge>
                        <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                          Certified {certDate}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Owner: {role.owner}</div>
                      {role.peerDeviation && <div className="text-xs text-amber-600 flex items-center gap-1 mt-1"><Users className="h-3 w-3" /> Access deviates from peer group</div>}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Entitlement</TableHead>
                          <TableHead>Classifications</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roleEntitlements.map((item: AccessItem, entIdx) => {
                          const usage = mockUsage[(roleIdx + entIdx) % mockUsage.length];
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium text-sm">{item.name}</TableCell>
                              <TableCell>{item.classifications?.map(c => <Badge key={c} variant="secondary" className="mr-1 text-[10px]">{c}</Badge>)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn(
                                  "text-[10px]",
                                  usage === 'Active' ? 'border-green-300 text-green-700 bg-green-50' : 'border-orange-300 text-orange-700 bg-orange-50'
                                )}>
                                  {usage}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-slate-500">{item.lastUsed}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:text-red-700">Request Removal</Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdentityAccessTab;
