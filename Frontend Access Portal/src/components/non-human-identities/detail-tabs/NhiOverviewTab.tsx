
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Shield, Building, Clock, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const NhiOverviewTab = ({ identity }: { identity: any }) => {
  const getAccessSummary = () => {
    const apps = identity.applications?.length || 0;
    const privs = identity.privileges?.length || 0;
    return `${identity.name} is a ${identity.type} in ${identity.provider} with ${privs} privileges across ${apps} applications. Owner: ${identity.owner || 'Unassigned'}. Last used: ${identity.lastUsed || 'Unknown'}. Rotation status: ${identity.rotationStatus || 'Not configured'}.`;
  };

  return (
    <div className="space-y-6 pt-4">
      {/* AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Sparkles className="w-5 h-5 mr-2 text-orange-500" />
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">{getAccessSummary()}</p>
          {identity.riskLevel === 'High' && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm font-medium text-amber-800 mb-1">AI Risk Insights:</p>
              <ul className="text-sm text-amber-700 space-y-1">
                <li className="flex items-start"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0" />High-privilege service account with {identity.rotationStatus === 'Overdue' ? 'overdue credential rotation' : 'elevated access scope'}</li>
                <li className="flex items-start"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0" />Dormant for {identity.daysUnused || 0} days — review business justification</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <Shield className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">{(identity.privileges || []).length}</div>
            <div className="text-xs text-muted-foreground">Privileges</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Building className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">{(identity.applications || []).length}</div>
            <div className="text-xs text-muted-foreground">Linked Apps</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold">{identity.daysUnused ?? '—'}</div>
            <div className="text-xs text-muted-foreground">Days Since Use</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <RefreshCw className="h-6 w-6 mx-auto mb-1 text-primary" />
            <div className="text-sm font-semibold">{identity.rotationStatus ?? 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Rotation</div>
            {identity.rotationStatus && (
              <Progress value={identity.rotationStatus === 'Current' ? 100 : identity.rotationStatus === 'Due Soon' ? 60 : 20} className="h-1 mt-2" />
            )}
          </div>
        </Card>
      </div>

      {/* Ownership & Environment */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ownership</CardTitle>
            <CardDescription>Identity ownership and accountability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Owner Team</span><span className="font-medium">{identity.owner || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Primary Contact</span><span className="font-medium">{identity.primaryOwner || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Backup Contact</span><span className="font-medium">{identity.backupOwner || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Attestation</span>
              <Badge variant={identity.attestationStatus === 'Compliant' ? 'default' : 'destructive'}>{identity.attestationStatus || 'Not configured'}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Deployment and configuration details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Environment</span><span className="font-medium">{identity.environment || 'Production'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Provider</span><span className="font-medium">{identity.provider}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Type</span><span className="font-medium">{identity.type}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Created</span><span className="font-medium">{identity.created || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Managed</span>
              <Badge variant="secondary">{identity.managed !== false ? 'Managed' : 'Unmanaged'}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NhiOverviewTab;
