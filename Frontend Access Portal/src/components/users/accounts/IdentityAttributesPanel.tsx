
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lock, Dna } from 'lucide-react';
import { AccountDetail } from '@/data/mock-account-details';

type IdentityAttribute = {
  attribute: string;
  value: string;
  isSensitive?: boolean;
  isTransformed?: boolean;
};

type IdentityAttributesPanelProps = {
  accountDetail: AccountDetail;
};

const IdentityAttributesPanel = ({ accountDetail }: IdentityAttributesPanelProps) => {
  // Mock identity attributes based on account ID - in real app this would come from API
  const getIdentityAttributes = (accountId: string): IdentityAttribute[] => {
    const baseAttributes = [
      { attribute: 'givenName', value: 'Sarah' },
      { attribute: 'sn', value: 'Johnson' },
      { attribute: 'mail', value: 'sarah.johnson@company.com' },
      { attribute: 'department', value: 'Engineering' },
      { attribute: 'title', value: 'Senior Software Engineer' },
      { attribute: 'manager', value: 'CN=Jane Smith,OU=Mgr,DC=company,DC=com' },
      { attribute: 'employeeNumber', value: '391847' },
      { attribute: 'status', value: 'Active' },
    ];

    // Vary attributes based on account type
    if (accountId.includes('GH')) {
      return [
        { attribute: 'login', value: 'sjohnson' },
        { attribute: 'name', value: 'Sarah Johnson' },
        { attribute: 'email', value: 'sarah.johnson@company.com' },
        { attribute: 'company', value: 'Acme Corp' },
        { attribute: 'location', value: 'San Francisco, CA' },
        { attribute: 'bio', value: 'Senior Software Engineer specializing in backend systems' },
        { attribute: 'hireable', value: 'false' },
        { attribute: 'public_repos', value: '12' },
      ];
    }

    if (accountId.includes('AWS')) {
      return [
        { attribute: 'UserName', value: 'sarah.johnson' },
        { attribute: 'UserId', value: 'AIDACKCEVSQ6C2EXAMPLE', isSensitive: true },
        { attribute: 'Arn', value: 'arn:aws:iam::123456789012:user/sarah.johnson' },
        { attribute: 'Path', value: '/' },
        { attribute: 'CreateDate', value: '2024-01-05T09:30:00Z' },
        { attribute: 'PasswordLastUsed', value: '2025-01-26T08:00:00Z' },
        { attribute: 'Tags', value: 'Department=Engineering,CostCenter=ENG001', isTransformed: true },
      ];
    }

    return baseAttributes;
  };

  const identityAttributes = getIdentityAttributes(accountDetail.accountId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          {/* <Dna className="h-5 w-5 text-blue-600" /> */}
          <span>Identity Attributes in Target Application</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribute</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {identityAttributes.map((attr, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium font-mono text-sm">
                  <div className="flex items-center space-x-2">
                    <span>{attr.attribute}</span>
                    {attr.isTransformed && (
                      <span className="inline-flex items-center text-xs text-blue-600" title="Value was transformed during provisioning">
                        🛠️
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {attr.isSensitive ? (
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Lock className="h-3 w-3" />
                        <span className="text-sm">••••••••••••</span>
                        <span className="text-xs" title="Sensitive data masked for security">🔒</span>
                      </div>
                    ) : (
                      <span className="text-sm">{attr.value}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {identityAttributes.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Dna className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p>No identity attributes available for this account.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentityAttributesPanel;
