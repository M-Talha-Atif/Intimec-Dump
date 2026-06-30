
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
  Clock, 
  User,
  Calendar,
  Shield
} from 'lucide-react';
import { useNonEmployeeDetail } from '@/contexts/NonEmployeeDetailContext';

const mockNonEmployees = [
  {
    id: 'ne_1',
    name: 'Alex Thompson',
    type: 'Contractor',
    email: 'alex.thompson@contractor.com',
    sponsor: 'Jane Smith',
    sponsorDepartment: 'Engineering',
    department: 'Engineering',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'Active',
    riskLevel: 'Medium',
    riskScore: 58,
    accessCount: 12,
    daysToExpiry: 45,
    businessUnit: 'Technology',
    contractValue: '$150,000',
    location: 'San Francisco, CA',
    accounts: [
      { id: 'ne_acc_1', application: 'Active Directory', accountId: 'athompson_ext', status: 'Active', lastSynced: '2024-06-20', authType: 'LDAP', risk: 'Low' },
      { id: 'ne_acc_2', application: 'GitHub Enterprise', accountId: 'alex.t.contractor', status: 'Active', lastSynced: '2024-06-20', authType: 'OAuth', risk: 'Medium' },
      { id: 'ne_acc_3', application: 'Jira', accountId: 'athompson', status: 'Active', lastSynced: '2024-06-19', authType: 'SAML', risk: 'Low' }
    ],
    access: [
      { id: 'ne_role_1', roleName: 'External Developer', type: 'Business', entitlements: ['GitHub RW', 'Jira Developer', 'VPN Access'], status: 'Active', assignedOn: '2024-01-15', source: 'Sponsor Request' },
      { id: 'ne_role_2', roleName: 'CI/CD Pipeline Access', type: 'Technical', entitlements: ['Jenkins Build', 'Docker Registry'], status: 'Active', assignedOn: '2024-02-01', source: 'Manual Request' }
    ],
    activity: [
      { id: 'ne_act_1', timestamp: '2024-06-20 09:15', type: 'Login', description: 'Logged into GitHub Enterprise from corporate VPN', risk: 'Low' },
      { id: 'ne_act_2', timestamp: '2024-06-19 14:30', type: 'Access', description: 'Requested access to staging environment', risk: 'Medium' },
      { id: 'ne_act_3', timestamp: '2024-06-18 11:00', type: 'Config', description: 'Updated profile information', risk: 'Low' },
      { id: 'ne_act_4', timestamp: '2024-06-15 16:45', type: 'Login', description: 'Failed login attempt — incorrect MFA code', risk: 'Medium' },
      { id: 'ne_act_5', timestamp: '2024-06-10 08:30', type: 'Policy', description: 'Access review completed by sponsor', risk: 'Low' }
    ],
    riskContributors: [
      { id: 'ne_rc_1', title: 'Elevated GitHub Privileges', severity: 'Medium', description: 'Write access to production repositories', category: 'Access' },
      { id: 'ne_rc_2', title: 'Failed MFA Attempt', severity: 'Low', description: 'Single failed MFA — no repeat', category: 'Behavioral' }
    ],
    policyViolations: [
      { id: 'ne_pv_1', policy: 'Contractor Access Review', status: 'Compliant', description: 'Quarterly review completed by sponsor', lastEvaluated: '2024-06-15', severity: 'Low' },
      { id: 'ne_pv_2', policy: 'Least Privilege Policy', status: 'Warning', description: 'CI/CD access may exceed project scope', lastEvaluated: '2024-06-18', severity: 'Medium' }
    ],
    aiInsights: [
      { id: 'ne_ai_1', type: 'Recommendation', title: 'Scope CI/CD Access', description: 'Restrict Jenkins access to specific project pipelines rather than all builds.', confidence: 0.82, category: 'Access' },
      { id: 'ne_ai_2', type: 'Insight', title: 'Productive Contractor', description: 'Alex shows consistent daily activity aligned with project timelines.', confidence: 0.76, category: 'Optimization' }
    ]
  },
  {
    id: 'ne_2',
    name: 'Maria Rodriguez',
    type: 'Consultant',
    email: 'maria.rodriguez@consulting.com',
    sponsor: 'Bob Brown',
    sponsorDepartment: 'Marketing',
    department: 'Marketing',
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    status: 'Expiring Soon',
    riskLevel: 'Low',
    riskScore: 32,
    accessCount: 8,
    daysToExpiry: 15,
    businessUnit: 'Sales & Marketing',
    contractValue: '$75,000',
    location: 'New York, NY',
    accounts: [
      { id: 'ne_acc_4', application: 'Salesforce', accountId: 'mrodriguez_ext', status: 'Active', lastSynced: '2024-06-20', authType: 'SAML', risk: 'Low' },
      { id: 'ne_acc_5', application: 'HubSpot', accountId: 'maria.r', status: 'Active', lastSynced: '2024-06-19', authType: 'OAuth', risk: 'Low' }
    ],
    access: [
      { id: 'ne_role_3', roleName: 'Marketing Consultant', type: 'Business', entitlements: ['CRM Read', 'Campaign Analytics', 'Report Export'], status: 'Active', assignedOn: '2024-03-01', source: 'Sponsor Request' }
    ],
    activity: [
      { id: 'ne_act_6', timestamp: '2024-06-20 10:00', type: 'Login', description: 'Logged into Salesforce', risk: 'Low' },
      { id: 'ne_act_7', timestamp: '2024-06-19 15:30', type: 'Access', description: 'Exported campaign performance report', risk: 'Low' },
      { id: 'ne_act_8', timestamp: '2024-06-17 09:00', type: 'Login', description: 'Logged into HubSpot', risk: 'Low' },
      { id: 'ne_act_9', timestamp: '2024-06-15 14:00', type: 'Policy', description: 'Contract extension request submitted', risk: 'Low' }
    ],
    riskContributors: [
      { id: 'ne_rc_3', title: 'Contract Expiring Soon', severity: 'Medium', description: 'Only 15 days remaining on contract', category: 'Lifecycle' }
    ],
    policyViolations: [
      { id: 'ne_pv_3', policy: 'Contract Expiry Policy', status: 'Warning', description: 'Contract expires in 15 days — review required', lastEvaluated: '2024-06-20', severity: 'Medium' }
    ],
    aiInsights: [
      { id: 'ne_ai_3', type: 'Recommendation', title: 'Plan Access Offboarding', description: 'Contract expires in 15 days. Pre-stage access revocation or initiate renewal.', confidence: 0.91, category: 'Compliance' }
    ]
  },
  {
    id: 'ne_3',
    name: 'David Chen',
    type: 'Vendor',
    email: 'david.chen@vendor.com',
    sponsor: 'John Doe',
    sponsorDepartment: 'IT',
    department: 'IT',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    status: 'Active',
    riskLevel: 'High',
    riskScore: 82,
    accessCount: 25,
    daysToExpiry: 90,
    businessUnit: 'Technology',
    contractValue: '$200,000',
    location: 'Austin, TX',
    accounts: [
      { id: 'ne_acc_6', application: 'Active Directory', accountId: 'dchen_vendor', status: 'Active', lastSynced: '2024-06-21', authType: 'LDAP', risk: 'Medium' },
      { id: 'ne_acc_7', application: 'AWS Console', accountId: 'vendor-dchen', status: 'Active', lastSynced: '2024-06-21', authType: 'SAML', risk: 'High' },
      { id: 'ne_acc_8', application: 'ServiceNow', accountId: 'david.chen.vendor', status: 'Active', lastSynced: '2024-06-20', authType: 'SAML', risk: 'Medium' },
      { id: 'ne_acc_9', application: 'Confluence', accountId: 'dchen', status: 'Active', lastSynced: '2024-06-19', authType: 'SAML', risk: 'Low' }
    ],
    access: [
      { id: 'ne_role_4', roleName: 'IT Vendor Admin', type: 'Technical', entitlements: ['AWS Admin', 'ServiceNow Admin', 'Network Config'], status: 'Active', assignedOn: '2024-02-01', source: 'Sponsor Request' },
      { id: 'ne_role_5', roleName: 'Infrastructure Support', type: 'Technical', entitlements: ['Server Access', 'Firewall Management', 'Monitoring'], status: 'Active', assignedOn: '2024-02-15', source: 'Manual Request' }
    ],
    activity: [
      { id: 'ne_act_10', timestamp: '2024-06-21 08:00', type: 'Login', description: 'Logged into AWS Console from vendor VPN', risk: 'Medium' },
      { id: 'ne_act_11', timestamp: '2024-06-20 22:30', type: 'Config', description: 'Modified firewall rules in production', risk: 'High' },
      { id: 'ne_act_12', timestamp: '2024-06-20 14:00', type: 'Access', description: 'Escalated ServiceNow ticket privileges', risk: 'Medium' },
      { id: 'ne_act_13', timestamp: '2024-06-18 10:00', type: 'Login', description: 'Login from new geographic location', risk: 'High' },
      { id: 'ne_act_14', timestamp: '2024-06-15 16:00', type: 'Policy', description: 'SoD violation flagged — admin + network config', risk: 'High' }
    ],
    riskContributors: [
      { id: 'ne_rc_4', title: 'Excessive Admin Privileges', severity: 'High', description: '25 access items across critical infrastructure', category: 'Access' },
      { id: 'ne_rc_5', title: 'After-Hours Activity', severity: 'High', description: 'Production firewall changes at 22:30', category: 'Behavioral' },
      { id: 'ne_rc_6', title: 'SoD Violation', severity: 'High', description: 'Admin + Network Config roles create conflict', category: 'Policy' }
    ],
    policyViolations: [
      { id: 'ne_pv_4', policy: 'Segregation of Duties', status: 'Violation', description: 'Admin and Network Config roles conflict', lastEvaluated: '2024-06-15', severity: 'High' },
      { id: 'ne_pv_5', policy: 'Change Window Policy', status: 'Violation', description: 'Production changes made outside change window', lastEvaluated: '2024-06-20', severity: 'High' },
      { id: 'ne_pv_6', policy: 'Vendor Access Review', status: 'Warning', description: 'Overdue quarterly review', lastEvaluated: '2024-06-10', severity: 'Medium' }
    ],
    aiInsights: [
      { id: 'ne_ai_4', type: 'Anomaly', title: 'After-Hours Production Changes', description: 'David modified production firewall rules at 22:30 — outside normal operating hours.', confidence: 0.89, category: 'Risk' },
      { id: 'ne_ai_5', type: 'Recommendation', title: 'Reduce Access Scope', description: 'Consolidate 25 access items to 2-3 role bundles aligned with project scope.', confidence: 0.85, category: 'Access' }
    ]
  },
  {
    id: 'ne_4',
    name: 'Sarah Kim',
    type: 'Intern',
    email: 'sarah.kim@university.edu',
    sponsor: 'Jane Smith',
    sponsorDepartment: 'Engineering',
    department: 'Engineering',
    startDate: '2024-05-15',
    endDate: '2024-08-15',
    status: 'Active',
    riskLevel: 'Low',
    riskScore: 18,
    accessCount: 5,
    daysToExpiry: 55,
    businessUnit: 'Technology',
    contractValue: '$12,000',
    location: 'San Francisco, CA',
    accounts: [
      { id: 'ne_acc_10', application: 'GitHub Enterprise', accountId: 'skim_intern', status: 'Active', lastSynced: '2024-06-21', authType: 'OAuth', risk: 'Low' },
      { id: 'ne_acc_11', application: 'Jira', accountId: 'sarah.kim.intern', status: 'Active', lastSynced: '2024-06-20', authType: 'SAML', risk: 'Low' }
    ],
    access: [
      { id: 'ne_role_6', roleName: 'Intern Developer', type: 'Business', entitlements: ['GitHub ReadOnly', 'Jira Reporter', 'Confluence Viewer'], status: 'Active', assignedOn: '2024-05-15', source: 'Birthright' }
    ],
    activity: [
      { id: 'ne_act_15', timestamp: '2024-06-21 09:00', type: 'Login', description: 'Logged into GitHub', risk: 'Low' },
      { id: 'ne_act_16', timestamp: '2024-06-20 14:00', type: 'Access', description: 'Cloned project repository', risk: 'Low' },
      { id: 'ne_act_17', timestamp: '2024-06-19 10:30', type: 'Login', description: 'Logged into Jira', risk: 'Low' }
    ],
    riskContributors: [],
    policyViolations: [
      { id: 'ne_pv_7', policy: 'Intern Access Policy', status: 'Compliant', description: 'Access limited to read-only and development tools', lastEvaluated: '2024-06-21', severity: 'Low' }
    ],
    aiInsights: [
      { id: 'ne_ai_6', type: 'Insight', title: 'Low-Risk Intern', description: 'Sarah maintains minimal access footprint consistent with intern role.', confidence: 0.88, category: 'Compliance' }
    ]
  },
  {
    id: 'ne_5',
    name: 'James Wilson',
    type: 'Contractor',
    email: 'james.wilson@consultfirm.com',
    sponsor: 'David Kim',
    sponsorDepartment: 'Finance',
    department: 'Finance',
    startDate: '2024-04-01',
    endDate: '2024-07-15',
    status: 'Expiring Soon',
    riskLevel: 'Medium',
    riskScore: 52,
    accessCount: 10,
    daysToExpiry: 25,
    businessUnit: 'Finance',
    contractValue: '$95,000',
    location: 'Chicago, IL',
    accounts: [
      { id: 'ne_acc_12', application: 'SAP', accountId: 'jwilson_ext', status: 'Active', lastSynced: '2024-06-21', authType: 'SAML', risk: 'Medium' },
      { id: 'ne_acc_13', application: 'Workday', accountId: 'james.wilson.contractor', status: 'Active', lastSynced: '2024-06-20', authType: 'SAML', risk: 'Low' }
    ],
    access: [
      { id: 'ne_role_7', roleName: 'Financial Analyst Contractor', type: 'Business', entitlements: ['SAP Read', 'GL Inquiry', 'Report Generation'], status: 'Active', assignedOn: '2024-04-01', source: 'Sponsor Request' },
      { id: 'ne_role_8', roleName: 'Payroll Viewer', type: 'Business', entitlements: ['Payroll Reports', 'Compensation Data View'], status: 'Pending Review', assignedOn: '2024-05-15', source: 'Manual Request' }
    ],
    activity: [
      { id: 'ne_act_18', timestamp: '2024-06-21 08:30', type: 'Login', description: 'Logged into SAP from corporate network', risk: 'Low' },
      { id: 'ne_act_19', timestamp: '2024-06-20 16:00', type: 'Access', description: 'Exported GL reconciliation report', risk: 'Medium' },
      { id: 'ne_act_20', timestamp: '2024-06-18 11:00', type: 'Policy', description: 'Payroll access review triggered', risk: 'Medium' },
      { id: 'ne_act_21', timestamp: '2024-06-15 09:00', type: 'Login', description: 'Logged into Workday', risk: 'Low' }
    ],
    riskContributors: [
      { id: 'ne_rc_7', title: 'Payroll Data Access', severity: 'Medium', description: 'Contractor accessing sensitive compensation data', category: 'Access' },
      { id: 'ne_rc_8', title: 'Contract Expiring', severity: 'Medium', description: '25 days remaining with active payroll access', category: 'Lifecycle' }
    ],
    policyViolations: [
      { id: 'ne_pv_8', policy: 'Sensitive Data Access', status: 'Warning', description: 'Contractor with payroll data access requires enhanced review', lastEvaluated: '2024-06-18', severity: 'Medium' },
      { id: 'ne_pv_9', policy: 'Contract Expiry Policy', status: 'Warning', description: 'Contract expires in 25 days — plan offboarding', lastEvaluated: '2024-06-20', severity: 'Medium' }
    ],
    aiInsights: [
      { id: 'ne_ai_7', type: 'Recommendation', title: 'Revoke Payroll Access', description: 'Payroll data access is unusual for a financial analyst contractor — consider removal.', confidence: 0.84, category: 'Access' },
      { id: 'ne_ai_8', type: 'Insight', title: 'Approaching Offboarding', description: 'Begin access revocation planning 2 weeks before contract end.', confidence: 0.90, category: 'Compliance' }
    ]
  }
];

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-800',
  'Expiring Soon': 'bg-orange-100 text-orange-800',
  'Expired': 'bg-red-100 text-red-800',
  'Suspended': 'bg-gray-100 text-gray-800'
};

const riskColors: Record<string, string> = {
  'Low': 'bg-blue-100 text-blue-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800'
};

const typeColors: Record<string, string> = {
  'Contractor': 'bg-purple-100 text-purple-800',
  'Consultant': 'bg-indigo-100 text-indigo-800',
  'Vendor': 'bg-pink-100 text-pink-800',
  'Intern': 'bg-green-100 text-green-800'
};

export function NonEmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { setSelectedNonEmployee } = useNonEmployeeDetail();

  const handleRowClick = (nonEmployee: any) => {
    setSelectedNonEmployee(nonEmployee);
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
                placeholder="Search non-employees..." 
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
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
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
          <CardTitle>Non-Employee Directory ({mockNonEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Identity</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Sponsor</th>
                  <th className="text-left p-3">Contract Period</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Risk</th>
                  <th className="text-left p-3">Access</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockNonEmployees.map((nonEmployee) => (
                  <tr 
                    key={nonEmployee.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(nonEmployee)}
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{nonEmployee.name}</div>
                          <div className="text-sm text-gray-500">{nonEmployee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={typeColors[nonEmployee.type] || ''}>
                        {nonEmployee.type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{nonEmployee.sponsor}</div>
                        <div className="text-sm text-gray-500">{nonEmployee.department}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm">{nonEmployee.startDate} - {nonEmployee.endDate}</div>
                          <div className="text-xs text-gray-500">{nonEmployee.daysToExpiry} days remaining</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[nonEmployee.status] || ''}>
                        {nonEmployee.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={riskColors[nonEmployee.riskLevel] || ''}>
                        {nonEmployee.riskLevel}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>{nonEmployee.accessCount} items</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {nonEmployee.status === 'Expiring Soon' && (
                          <Button variant="ghost" size="sm" className="text-orange-600">
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
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
