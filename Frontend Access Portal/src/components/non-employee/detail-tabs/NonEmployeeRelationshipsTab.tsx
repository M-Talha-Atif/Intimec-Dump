
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building, Settings, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

export function NonEmployeeRelationshipsTab({ nonEmployee }: { nonEmployee: any }) {
  const apps = ['Salesforce', 'Jira', 'GitHub', 'Confluence'];
  const accounts = [
    { accountId: nonEmployee.email?.split('@')[0] || 'user1', application: 'Salesforce' },
    { accountId: `${(nonEmployee.name || '').toLowerCase().replace(' ', '.')}.contractor`, application: 'Jira' },
    { accountId: `${(nonEmployee.name || '').split(' ')[0]?.toLowerCase()}-ext`, application: 'GitHub' },
  ];

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity Relationship Map</CardTitle>
          <CardDescription>Sponsor → Applications → Accounts → Risk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {/* Sponsor + Identity */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sponsor & Identity</p>
              <Card className="border-2 border-purple-300 bg-purple-50 mb-2">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Sponsor</p>
                      <p className="text-sm font-semibold">{nonEmployee.sponsor || 'Unassigned'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-indigo-300 bg-indigo-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-600" />
                    <div>
                      <p className="text-sm font-semibold">{nonEmployee.name}</p>
                      <p className="text-xs text-muted-foreground">{nonEmployee.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">{nonEmployee.department}</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Applications */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Applications</p>
              <div className="space-y-2">
                {apps.slice(0, 4).map((app, i) => (
                  <Card key={i} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium">{app}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Accounts */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Accounts</p>
              <div className="space-y-2">
                {accounts.map((acc, i) => (
                  <Card key={i} className="border-orange-200 bg-orange-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-xs font-mono font-medium">{acc.accountId}</p>
                          <p className="text-xs text-muted-foreground">{acc.application}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Risk */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Indicators</p>
              <div className="space-y-2">
                {nonEmployee.riskLevel === 'High' && (
                  <Card className="border-red-300 bg-red-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div><p className="text-sm font-medium text-red-800">High Risk</p><p className="text-xs text-red-600">Elevated access</p></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {nonEmployee.daysToExpiry <= 30 && (
                  <Card className="border-orange-300 bg-orange-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <div><p className="text-sm font-medium text-orange-800">Expiring Soon</p><p className="text-xs text-orange-600">{nonEmployee.daysToExpiry} days left</p></div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {nonEmployee.riskLevel === 'Low' && nonEmployee.daysToExpiry > 30 && (
                  <Card className="border-green-300 bg-green-50">
                    <CardContent className="p-3"><p className="text-sm font-medium text-green-800">Low Risk</p><p className="text-xs text-green-600">No concerns</p></CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Sponsor</span><ArrowRight className="h-3 w-3" /><span>Identity</span><ArrowRight className="h-3 w-3" /><span>Applications</span><ArrowRight className="h-3 w-3" /><span>Risk</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
