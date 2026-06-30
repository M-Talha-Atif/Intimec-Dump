
import React from 'react';
import IdentityRelationshipGraph from '@/components/shared/IdentityRelationshipGraph';

const NhiRelationshipsTab = ({ identity }: { identity: any }) => {
  const apps = identity.applications || ['AWS', 'Azure'];
  const appData = (typeof apps[0] === 'string' ? apps : apps).map((app: any) => ({
    name: typeof app === 'string' ? app : app.name,
    risk: typeof app === 'string' ? 'medium' : (app.risk || 'medium'),
    accounts: typeof app === 'string' ? 1 : (app.accounts || 1),
  }));

  const accounts = identity.accounts || [
    { id: 'svc-prod-001', name: 'svc-prod-001', application: appData[0]?.name || 'AWS' },
    { id: 'sp-database', name: 'sp-database', application: appData[1]?.name || 'Azure' },
  ];

  const riskIndicators = [];
  if (identity.riskLevel === 'High') {
    riskIndicators.push({
      label: 'Privileged Access',
      subtitle: 'High-risk credentials',
      riskLevel: 'high',
      count: 1,
      metadata: { remediation: 'Review and rotate credentials immediately' }
    });
  }
  if (identity.rotationStatus === 'Overdue') {
    riskIndicators.push({
      label: 'Rotation Overdue',
      subtitle: 'Credential hygiene',
      riskLevel: 'high',
      count: 1,
      metadata: { remediation: 'Rotate credentials per policy schedule' }
    });
  }
  if (identity.daysUnused > 30) {
    riskIndicators.push({
      label: 'Dormant Identity',
      subtitle: `${identity.daysUnused} days unused`,
      riskLevel: 'medium',
      count: 1,
      metadata: { remediation: 'Consider deprovisioning or archiving' }
    });
  }

  return (
    <IdentityRelationshipGraph
      identityName={identity.name}
      identitySubtitle={`${identity.type} • ${identity.provider}`}
      identityType="nhi"
      riskLevel={identity.riskLevel}
      applications={appData}
      accounts={accounts.map((acc: any) => ({
        id: acc.accountId || acc.id || acc,
        name: acc.accountId || acc.id || String(acc),
        application: acc.application || '',
      }))}
      roles={[
        { name: 'Service Role', risk: identity.riskLevel?.toLowerCase() === 'high' ? 'high' : 'low', type: 'System', users: 1 },
      ]}
      entitlements={[
        { name: 'API Access', risk: identity.riskLevel?.toLowerCase() || 'medium', privilege: 'Execute', fromRole: true },
        { name: 'Data Read', risk: 'low', privilege: 'Read', fromRole: true },
      ]}
      riskIndicators={riskIndicators}
    />
  );
};

export default NhiRelationshipsTab;
