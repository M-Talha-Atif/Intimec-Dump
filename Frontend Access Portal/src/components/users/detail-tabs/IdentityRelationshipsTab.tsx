
import React from 'react';
import { type User } from '@/data/mock-users';
import IdentityRelationshipGraph from '@/components/shared/IdentityRelationshipGraph';

interface IdentityRelationshipsTabProps {
  user: User;
}

const IdentityRelationshipsTab: React.FC<IdentityRelationshipsTabProps> = ({ user }) => {
  return (
    <IdentityRelationshipGraph
      identityName={user.name}
      identitySubtitle={`${user.department} • ${user.type}`}
      identityType="employee"
      riskLevel={user.riskLevel}
      applications={[
        { name: 'SAP ERP', risk: 'high', accounts: 2 },
        { name: 'Salesforce', risk: 'low', accounts: 1 },
        { name: 'Office 365', risk: 'low', accounts: 1 },
        { name: 'AWS Console', risk: 'medium', accounts: 1 }
      ]}
      accounts={[
        { id: 'sap-main', name: 'SAP Primary', application: 'SAP ERP', risk: 'high' },
        { id: 'sap-admin', name: 'SAP Admin', application: 'SAP ERP', risk: 'high' },
        { id: 'sf-user', name: 'SF User', application: 'Salesforce' },
        { id: 'o365-user', name: 'O365 User', application: 'Office 365' },
        { id: 'aws-dev', name: 'AWS Dev', application: 'AWS Console', risk: 'medium' }
      ]}
      roles={[
        { name: 'Finance Manager', risk: 'medium', type: 'Business', users: 5 },
        { name: 'Report Viewer', risk: 'low', type: 'Functional', users: 20 },
        { name: 'System Admin', risk: 'high', type: 'System', users: 3 }
      ]}
      entitlements={[
        { name: 'Budget Approval', risk: 'high', privilege: 'Write', fromRole: true },
        { name: 'Financial Reports', risk: 'low', privilege: 'Read', fromRole: false },
        { name: 'User Management', risk: 'high', privilege: 'Admin', fromRole: true }
      ]}
      riskIndicators={[
        {
          label: 'SoD Conflict',
          subtitle: 'Segregation of Duties',
          riskLevel: 'high',
          count: 2,
          conflictCount: 1,
          metadata: {
            conflictDescription: 'both approve budgets and process payments',
            involvedEntitlements: 'Budget Approval + Payment Processing',
            policyName: 'Financial SoD Policy',
            remediation: 'Remove Budget Approval or implement compensating controls',
          }
        }
      ]}
    />
  );
};

export default IdentityRelationshipsTab;
