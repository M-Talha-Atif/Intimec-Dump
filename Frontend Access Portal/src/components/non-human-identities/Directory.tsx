
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Bot,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { useNhiDetail } from '@/contexts/NhiDetailContext';

const mockNHIs = [
  {
    id: 'nhi_1',
    name: 'prod-database-service',
    type: 'Service Account',
    provider: 'Azure AD',
    owner: 'Platform Team',
    created: '2024-01-15',
    lastUsed: '2024-06-20',
    status: 'Active',
    riskLevel: 'Medium',
    riskScore: 62,
    privileges: ['Read', 'Write', 'Admin'],
    applications: ['ProductionDB', 'BackupService'],
    daysUnused: 2,
    rotationStatus: 'Due Soon',
    accounts: [
      { id: 'nhi_acc_1', application: 'ProductionDB', accountId: 'svc-prod-db', status: 'Active', lastSynced: '2024-06-20', authType: 'Certificate', risk: 'Medium' },
      { id: 'nhi_acc_2', application: 'BackupService', accountId: 'svc-backup-rw', status: 'Active', lastSynced: '2024-06-19', authType: 'API Key', risk: 'Low' }
    ],
    grants: [
      { id: 'g1', privilege: 'db:ReadWrite', application: 'ProductionDB', risk: 'Medium', source: 'Role-Based', lastUsed: '2024-06-20' },
      { id: 'g2', privilege: 'backup:Admin', application: 'BackupService', risk: 'Low', source: 'Manual', lastUsed: '2024-06-18' },
      { id: 'g3', privilege: 'db:Admin', application: 'ProductionDB', risk: 'High', source: 'Manual', lastUsed: '2024-06-15' }
    ],
    activity: [
      { id: 'a1', timestamp: '2024-06-20 14:30', type: 'Auth', description: 'Authenticated to ProductionDB via certificate', risk: 'Low' },
      { id: 'a2', timestamp: '2024-06-19 09:00', type: 'Config', description: 'Connection pool configuration updated', risk: 'Low' },
      { id: 'a3', timestamp: '2024-06-18 16:45', type: 'Access', description: 'Granted backup:Admin privilege', risk: 'Medium' },
      { id: 'a4', timestamp: '2024-06-15 11:20', type: 'Rotation', description: 'Certificate rotation scheduled', risk: 'Low' },
      { id: 'a5', timestamp: '2024-06-10 08:00', type: 'Auth', description: 'Failed authentication attempt from unknown IP', risk: 'High' }
    ],
    riskContributors: [
      { id: 'rc1', title: 'Admin Privilege on Production', severity: 'High', description: 'Direct admin access to production database', category: 'Access' },
      { id: 'rc2', title: 'Certificate Rotation Due', severity: 'Medium', description: 'Certificate expires in 15 days', category: 'Credential' }
    ],
    policyViolations: [
      { id: 'pv1', policy: 'Credential Rotation Policy', status: 'Warning', description: 'Certificate rotation due in 15 days', lastEvaluated: '2024-06-20', severity: 'Medium' },
      { id: 'pv2', policy: 'Least Privilege Policy', status: 'Violation', description: 'Admin access not required for backup operations', lastEvaluated: '2024-06-18', severity: 'High' }
    ],
    aiInsights: [
      { id: 'ai1', type: 'Recommendation', title: 'Remove Admin Privilege', description: 'Admin access on ProductionDB has not been used in 5 days. Consider downgrading to ReadWrite.', confidence: 0.87, category: 'Access' },
      { id: 'ai2', type: 'Anomaly', title: 'Unusual Auth Pattern', description: 'Failed authentication from unknown IP detected on Jun 10', confidence: 0.72, category: 'Risk' }
    ]
  },
  {
    id: 'nhi_2',
    name: 'github-api-token',
    type: 'API Key',
    provider: 'GitHub',
    owner: 'DevOps Team',
    created: '2024-03-01',
    lastUsed: '2024-05-15',
    status: 'Dormant',
    riskLevel: 'High',
    riskScore: 85,
    privileges: ['Repository Access', 'Workflow Trigger'],
    applications: ['CI/CD Pipeline'],
    daysUnused: 36,
    rotationStatus: 'Overdue',
    accounts: [
      { id: 'nhi_acc_3', application: 'CI/CD Pipeline', accountId: 'gh-api-cicd', status: 'Dormant', lastSynced: '2024-05-15', authType: 'API Key', risk: 'High' }
    ],
    grants: [
      { id: 'g4', privilege: 'repo:FullAccess', application: 'GitHub', risk: 'High', source: 'Manual', lastUsed: '2024-05-15' },
      { id: 'g5', privilege: 'actions:Trigger', application: 'GitHub', risk: 'Medium', source: 'Manual', lastUsed: '2024-05-10' }
    ],
    activity: [
      { id: 'a6', timestamp: '2024-05-15 10:00', type: 'Auth', description: 'Last successful API authentication', risk: 'Low' },
      { id: 'a7', timestamp: '2024-05-10 14:22', type: 'Access', description: 'Triggered workflow deployment', risk: 'Low' },
      { id: 'a8', timestamp: '2024-04-20 09:15', type: 'Rotation', description: 'Token rotation reminder sent', risk: 'Medium' },
      { id: 'a9', timestamp: '2024-03-01 08:00', type: 'Config', description: 'API token provisioned', risk: 'Low' }
    ],
    riskContributors: [
      { id: 'rc3', title: 'Token Rotation Overdue', severity: 'High', description: 'API key has not been rotated in 112 days', category: 'Credential' },
      { id: 'rc4', title: 'Dormant with High Privileges', severity: 'High', description: 'Full repository access on dormant token', category: 'Access' },
      { id: 'rc5', title: 'No Usage in 36 Days', severity: 'Medium', description: 'Token unused — potential orphan', category: 'Lifecycle' }
    ],
    policyViolations: [
      { id: 'pv3', policy: 'API Key Rotation Policy', status: 'Violation', description: 'Key must be rotated every 90 days', lastEvaluated: '2024-06-20', severity: 'High' },
      { id: 'pv4', policy: 'Dormant Identity Policy', status: 'Violation', description: 'Inactive for 36 days without review', lastEvaluated: '2024-06-20', severity: 'Medium' }
    ],
    aiInsights: [
      { id: 'ai3', type: 'Recommendation', title: 'Revoke or Rotate Token', description: 'This dormant API key with full repo access should be revoked or rotated immediately.', confidence: 0.94, category: 'Risk' },
      { id: 'ai4', type: 'Insight', title: 'Pipeline Migration Detected', description: 'CI/CD pipeline appears to have migrated to a different token. This key may be orphaned.', confidence: 0.78, category: 'Access' }
    ]
  },
  {
    id: 'nhi_3',
    name: 'k8s-cluster-cert',
    type: 'Certificate',
    provider: 'Kubernetes',
    owner: 'Infrastructure Team',
    created: '2024-02-01',
    lastUsed: '2024-06-21',
    status: 'Active',
    riskLevel: 'Low',
    riskScore: 28,
    privileges: ['Cluster Admin'],
    applications: ['Kubernetes Cluster'],
    daysUnused: 1,
    rotationStatus: 'Current',
    accounts: [
      { id: 'nhi_acc_4', application: 'Kubernetes Cluster', accountId: 'k8s-admin-cert', status: 'Active', lastSynced: '2024-06-21', authType: 'Certificate', risk: 'Low' }
    ],
    grants: [
      { id: 'g6', privilege: 'cluster:Admin', application: 'Kubernetes', risk: 'Medium', source: 'Role-Based', lastUsed: '2024-06-21' }
    ],
    activity: [
      { id: 'a10', timestamp: '2024-06-21 08:00', type: 'Auth', description: 'Certificate-based cluster authentication', risk: 'Low' },
      { id: 'a11', timestamp: '2024-06-20 22:00', type: 'Config', description: 'Namespace scaling event triggered', risk: 'Low' },
      { id: 'a12', timestamp: '2024-06-18 14:30', type: 'Rotation', description: 'Certificate rotated successfully', risk: 'Low' },
      { id: 'a13', timestamp: '2024-06-15 10:00', type: 'Access', description: 'Granted access to new namespace', risk: 'Low' }
    ],
    riskContributors: [
      { id: 'rc6', title: 'Cluster Admin Privilege', severity: 'Medium', description: 'Full cluster admin access — standard for infra cert', category: 'Access' }
    ],
    policyViolations: [
      { id: 'pv5', policy: 'Certificate Rotation Policy', status: 'Compliant', description: 'Certificate rotated within 90-day window', lastEvaluated: '2024-06-21', severity: 'Low' }
    ],
    aiInsights: [
      { id: 'ai5', type: 'Insight', title: 'Well-Governed Identity', description: 'This certificate follows all governance policies and rotation schedules.', confidence: 0.91, category: 'Compliance' }
    ]
  },
  {
    id: 'nhi_4',
    name: 'slack-bot-integration',
    type: 'OAuth Token',
    provider: 'Slack',
    owner: 'IT Operations',
    created: '2024-04-10',
    lastUsed: '2024-06-21',
    status: 'Active',
    riskLevel: 'Low',
    riskScore: 22,
    privileges: ['Send Messages', 'Read Channels'],
    applications: ['Slack Workspace'],
    daysUnused: 1,
    rotationStatus: 'Current',
    accounts: [
      { id: 'nhi_acc_5', application: 'Slack Workspace', accountId: 'bot-alerts', status: 'Active', lastSynced: '2024-06-21', authType: 'OAuth', risk: 'Low' }
    ],
    grants: [
      { id: 'g7', privilege: 'chat:write', application: 'Slack', risk: 'Low', source: 'OAuth Scope', lastUsed: '2024-06-21' },
      { id: 'g8', privilege: 'channels:read', application: 'Slack', risk: 'Low', source: 'OAuth Scope', lastUsed: '2024-06-21' }
    ],
    activity: [
      { id: 'a14', timestamp: '2024-06-21 12:00', type: 'Auth', description: 'OAuth token refresh', risk: 'Low' },
      { id: 'a15', timestamp: '2024-06-21 09:30', type: 'Access', description: 'Sent alert notification to #ops-alerts', risk: 'Low' },
      { id: 'a16', timestamp: '2024-06-20 15:00', type: 'Config', description: 'Bot configuration updated by IT admin', risk: 'Low' }
    ],
    riskContributors: [],
    policyViolations: [
      { id: 'pv6', policy: 'OAuth Token Policy', status: 'Compliant', description: 'Token follows least-privilege scoping', lastEvaluated: '2024-06-21', severity: 'Low' }
    ],
    aiInsights: [
      { id: 'ai6', type: 'Insight', title: 'Minimal Scope Bot', description: 'This bot integration uses minimal OAuth scopes — no action needed.', confidence: 0.88, category: 'Compliance' }
    ]
  },
  {
    id: 'nhi_5',
    name: 'aws-lambda-executor',
    type: 'Service Account',
    provider: 'AWS',
    owner: 'Engineering Team',
    created: '2024-05-01',
    lastUsed: '2024-06-21',
    status: 'Active',
    riskLevel: 'High',
    riskScore: 78,
    privileges: ['Lambda Execute', 'S3 Full Access', 'DynamoDB Admin'],
    applications: ['AWS Lambda', 'S3', 'DynamoDB'],
    daysUnused: 1,
    rotationStatus: 'Due Soon',
    accounts: [
      { id: 'nhi_acc_6', application: 'AWS Lambda', accountId: 'lambda-exec-prod', status: 'Active', lastSynced: '2024-06-21', authType: 'IAM Role', risk: 'High' },
      { id: 'nhi_acc_7', application: 'S3', accountId: 'lambda-s3-rw', status: 'Active', lastSynced: '2024-06-21', authType: 'IAM Role', risk: 'Medium' }
    ],
    grants: [
      { id: 'g9', privilege: 'lambda:InvokeFunction', application: 'AWS Lambda', risk: 'Medium', source: 'IAM Policy', lastUsed: '2024-06-21' },
      { id: 'g10', privilege: 's3:*', application: 'S3', risk: 'High', source: 'IAM Policy', lastUsed: '2024-06-21' },
      { id: 'g11', privilege: 'dynamodb:*', application: 'DynamoDB', risk: 'High', source: 'IAM Policy', lastUsed: '2024-06-20' }
    ],
    activity: [
      { id: 'a17', timestamp: '2024-06-21 11:00', type: 'Auth', description: 'IAM role assumption for Lambda execution', risk: 'Low' },
      { id: 'a18', timestamp: '2024-06-21 10:30', type: 'Access', description: 'S3 bucket write operation — 150 objects', risk: 'Medium' },
      { id: 'a19', timestamp: '2024-06-20 23:00', type: 'Config', description: 'Lambda function memory increased to 512MB', risk: 'Low' },
      { id: 'a20', timestamp: '2024-06-19 14:00', type: 'Rotation', description: 'Access key rotation reminder triggered', risk: 'Medium' },
      { id: 'a21', timestamp: '2024-06-18 09:00', type: 'Access', description: 'DynamoDB table scan executed', risk: 'High' }
    ],
    riskContributors: [
      { id: 'rc7', title: 'Wildcard S3 Permissions', severity: 'High', description: 's3:* grants full access to all S3 resources', category: 'Access' },
      { id: 'rc8', title: 'DynamoDB Admin Access', severity: 'High', description: 'Full DynamoDB admin not required for Lambda function', category: 'Access' },
      { id: 'rc9', title: 'Key Rotation Due', severity: 'Medium', description: 'IAM access key rotation due in 10 days', category: 'Credential' }
    ],
    policyViolations: [
      { id: 'pv7', policy: 'Least Privilege Policy', status: 'Violation', description: 'Wildcard permissions on S3 and DynamoDB exceed operational needs', lastEvaluated: '2024-06-21', severity: 'High' },
      { id: 'pv8', policy: 'Key Rotation Policy', status: 'Warning', description: 'Access key rotation due within 10 days', lastEvaluated: '2024-06-21', severity: 'Medium' }
    ],
    aiInsights: [
      { id: 'ai7', type: 'Recommendation', title: 'Scope Down S3 Permissions', description: 'Replace s3:* with specific bucket-level permissions to reduce blast radius.', confidence: 0.93, category: 'Access' },
      { id: 'ai8', type: 'Anomaly', title: 'Unusual DynamoDB Scan', description: 'Full table scan on Jun 18 is atypical — investigate if intentional.', confidence: 0.71, category: 'Risk' }
    ]
  }
];

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-800',
  'Dormant': 'bg-orange-100 text-orange-800',
  'Expired': 'bg-red-100 text-red-800',
  'Suspended': 'bg-gray-100 text-gray-800'
};

const riskColors: Record<string, string> = {
  'Low': 'bg-blue-100 text-blue-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800'
};

const typeColors: Record<string, string> = {
  'Service Account': 'bg-purple-100 text-purple-800',
  'API Key': 'bg-indigo-100 text-indigo-800',
  'Certificate': 'bg-green-100 text-green-800',
  'Secret': 'bg-pink-100 text-pink-800',
  'OAuth Token': 'bg-blue-100 text-blue-800'
};

export function Directory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { setSelectedNhi } = useNhiDetail();

  const handleRowClick = (nhi: any) => {
    setSelectedNhi(nhi);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Directory Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search NHIs..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="service-account">Service Account</SelectItem>
                <SelectItem value="api-key">API Key</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="secret">Secret</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Non-Human Identity Directory ({mockNHIs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Identity</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Provider</th>
                  <th className="text-left p-3">Owner</th>
                  <th className="text-left p-3">Last Used</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Risk</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockNHIs.map((nhi) => (
                  <tr 
                    key={nhi.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(nhi)}
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium">{nhi.name}</div>
                          <div className="text-sm text-gray-500">{nhi.applications.join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={typeColors[nhi.type] || ''}>
                        {nhi.type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{nhi.provider}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{nhi.owner}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm">{nhi.lastUsed}</div>
                          <div className="text-xs text-gray-500">{nhi.daysUnused} days ago</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[nhi.status] || ''}>
                        {nhi.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={riskColors[nhi.riskLevel] || ''}>
                        {nhi.riskLevel}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
