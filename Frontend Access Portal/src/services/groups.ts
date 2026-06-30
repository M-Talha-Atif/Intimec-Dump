import { toast } from "@/hooks/use-toast";

// Types
export interface IdentityGroup {
  id: string;
  name: string;
  description: string;
  type: 'static' | 'dynamic';
  memberCount: number;
  email?: string;
  owners: string[];
  ownerDetails?: Array<{ id: string; name: string; email: string }>;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  usedIn: string[];
  riskLevel: 'low' | 'medium' | 'high';
  rules?: DynamicRule[];
  effectiveMemberCount?: number;
}

export interface DynamicRule {
  id: string;
  type: 'attribute' | 'entitlement' | 'membership';
  attribute?: string;
  operator: 'equals' | 'contains' | 'in' | 'has' | 'not' | 'includes' | 'excludes';
  value: string | string[];
  condition?: 'AND' | 'OR';
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  type: 'employee' | 'non-employee' | 'non-human';
  department?: string;
  riskScore: number;
  source: 'static' | 'dynamic' | 'inherited';
}

export interface PreviewResult {
  totalMatched: number;
  samples: GroupMember[];
  delta: {
    adds: number;
    removes: number;
    addedMembers: GroupMember[];
    removedMembers: GroupMember[];
  };
  sodViolations?: Array<{ policy: string; description: string }>;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorEmail: string;
  changes: Record<string, any>;
  ipAddress?: string;
}

export interface ListGroupsParams {
  search?: string;
  type?: 'static' | 'dynamic';
  sortBy?: 'name' | 'memberCount' | 'createdAt' | 'riskLevel';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ListGroupsResponse {
  groups: IdentityGroup[];
  total: number;
  page: number;
  pageSize: number;
}

// API functions
export async function listGroups(params: ListGroupsParams = {}): Promise<ListGroupsResponse> {
  // Simulated API call - replace with actual backend
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockGroups: IdentityGroup[] = [
    {
      id: '1',
      name: 'Engineering Team',
      description: 'All engineering staff with code repository access',
      type: 'dynamic',
      memberCount: 42,
      email: 'engineering@company.com',
      owners: ['alice@company.com', 'bob@company.com'],
      tags: ['department', 'technical'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-01T08:00:00Z',
      usedIn: ['GitHub Enterprise', 'Jira', 'Confluence'],
      riskLevel: 'medium',
      rules: [
        { id: '1', type: 'attribute', attribute: 'department', operator: 'equals', value: 'Engineering' }
      ]
    },
    {
      id: '2',
      name: 'Finance Approvers',
      description: 'Users authorized to approve financial transactions',
      type: 'static',
      memberCount: 8,
      owners: ['carol@company.com'],
      tags: ['approval', 'sensitive'],
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2025-01-15T14:00:00Z',
      usedIn: ['Expensify', 'NetSuite'],
      riskLevel: 'high'
    },
    {
      id: '3',
      name: 'Privileged Admins',
      description: 'Users with elevated administrative privileges across critical systems',
      type: 'static',
      memberCount: 5,
      owners: ['security@company.com'],
      tags: ['privileged', 'critical'],
      createdAt: '2023-11-20T10:00:00Z',
      updatedAt: '2025-02-10T09:00:00Z',
      usedIn: ['Active Directory', 'AWS Console', 'Azure AD', 'CyberArk'],
      riskLevel: 'high'
    },
    {
      id: '4',
      name: 'Sales Department',
      description: 'All sales representatives and managers',
      type: 'dynamic',
      memberCount: 65,
      email: 'sales@company.com',
      owners: ['vp-sales@company.com'],
      tags: ['department', 'revenue'],
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2025-01-20T11:00:00Z',
      usedIn: ['Salesforce', 'HubSpot'],
      riskLevel: 'low',
      rules: [
        { id: '2', type: 'attribute', attribute: 'department', operator: 'equals', value: 'Sales' }
      ]
    },
    {
      id: '5',
      name: 'Contractors',
      description: 'External contractors and temporary workers',
      type: 'dynamic',
      memberCount: 23,
      owners: [],
      tags: ['external', 'temporary'],
      createdAt: '2024-06-15T10:00:00Z',
      usedIn: ['Jira'],
      riskLevel: 'high',
      rules: [
        { id: '3', type: 'attribute', attribute: 'employeeType', operator: 'equals', value: 'Contractor' }
      ]
    },
    {
      id: '6',
      name: 'IT Operations',
      description: 'IT operations and infrastructure team members',
      type: 'dynamic',
      memberCount: 18,
      email: 'it-ops@company.com',
      owners: ['cto@company.com', 'it-manager@company.com'],
      tags: ['department', 'operations'],
      createdAt: '2024-02-20T10:00:00Z',
      updatedAt: '2025-02-01T10:00:00Z',
      usedIn: ['ServiceNow', 'PagerDuty', 'AWS Console', 'Datadog'],
      riskLevel: 'medium',
      rules: [
        { id: '4', type: 'attribute', attribute: 'department', operator: 'equals', value: 'IT' }
      ]
    },
    {
      id: '7',
      name: 'Compliance Committee',
      description: 'Cross-functional compliance and audit team',
      type: 'static',
      memberCount: 6,
      owners: ['compliance-officer@company.com'],
      tags: ['compliance', 'governance'],
      createdAt: '2024-04-10T10:00:00Z',
      updatedAt: '2025-02-15T10:00:00Z',
      usedIn: ['ServiceNow', 'Archer'],
      riskLevel: 'low'
    },
    {
      id: '8',
      name: 'API Service Accounts',
      description: 'Non-human identities for API integrations and automated services',
      type: 'dynamic',
      memberCount: 34,
      owners: [],
      tags: ['non-human', 'automation'],
      createdAt: '2024-08-01T10:00:00Z',
      usedIn: [],
      riskLevel: 'medium',
      rules: [
        { id: '5', type: 'attribute', attribute: 'identityType', operator: 'equals', value: 'Service Account' }
      ]
    }
  ];

  let filtered = [...mockGroups];
  
  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(g => 
      g.name.toLowerCase().includes(term) || 
      g.description.toLowerCase().includes(term)
    );
  }
  
  if (params.type) {
    filtered = filtered.filter(g => g.type === params.type);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    groups: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize
  };
}

export async function getGroup(id: string): Promise<IdentityGroup> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const groups = (await listGroups()).groups;
  const group = groups.find(g => g.id === id);
  
  if (!group) {
    throw new Error('Group not found');
  }
  
  return group;
}

export async function createGroup(data: Partial<IdentityGroup>): Promise<IdentityGroup> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Validate name uniqueness
  const existing = await listGroups({ search: data.name });
  if (existing.groups.some(g => g.name === data.name)) {
    throw new Error('A group with this name already exists');
  }

  const newGroup: IdentityGroup = {
    id: `group_${Date.now()}`,
    name: data.name || '',
    description: data.description || '',
    type: data.type || 'static',
    memberCount: 0,
    email: data.email,
    owners: data.owners || [],
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    usedIn: [],
    riskLevel: data.riskLevel || 'low',
    rules: data.rules
  };

  toast({
    title: "Group created",
    description: `${newGroup.name} has been successfully created.`
  });

  return newGroup;
}

export async function updateGroup(id: string, data: Partial<IdentityGroup>): Promise<IdentityGroup> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const group = await getGroup(id);
  const updated = { ...group, ...data, updatedAt: new Date().toISOString() };

  toast({
    title: "Group updated",
    description: `${updated.name} has been successfully updated.`
  });

  return updated;
}

export async function deleteGroup(id: string, soft: boolean = true): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  toast({
    title: "Group deleted",
    description: "The identity group has been removed."
  });
}

export async function cloneGroup(id: string): Promise<IdentityGroup> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const original = await getGroup(id);
  const cloned = await createGroup({
    ...original,
    name: `${original.name} (Copy)`,
    id: undefined,
    createdAt: undefined
  });

  toast({
    title: "Group cloned",
    description: `Created copy: ${cloned.name}`
  });

  return cloned;
}

export async function getGroupMembers(
  id: string, 
  params: { effective?: boolean; search?: string; page?: number; pageSize?: number } = {}
): Promise<{ members: GroupMember[]; total: number; page: number; pageSize: number }> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockMembers: GroupMember[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      type: 'employee',
      department: 'Engineering',
      riskScore: 45,
      source: 'dynamic'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      type: 'employee',
      department: 'Engineering',
      riskScore: 32,
      source: 'static'
    }
  ];

  let filtered = [...mockMembers];
  
  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(term) || 
      m.email.toLowerCase().includes(term)
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 25;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    members: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize
  };
}

export async function previewDynamicGroup(rules: DynamicRule[]): Promise<PreviewResult> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const samples: GroupMember[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      type: 'employee',
      department: 'Engineering',
      riskScore: 45,
      source: 'dynamic'
    }
  ];

  return {
    totalMatched: 42,
    samples,
    delta: {
      adds: 5,
      removes: 2,
      addedMembers: samples,
      removedMembers: []
    },
    sodViolations: []
  };
}

export async function getGroupAudit(id: string): Promise<AuditEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    {
      id: '1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: 'Group Created',
      actor: 'Alice Johnson',
      actorEmail: 'alice@company.com',
      changes: { name: 'Engineering Team', type: 'dynamic' }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      action: 'Members Added',
      actor: 'Bob Smith',
      actorEmail: 'bob@company.com',
      changes: { added: 5 }
    }
  ];
}

export async function removeMembersFromGroup(groupId: string, memberIds: string[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  toast({
    title: "Members removed",
    description: `${memberIds.length} member(s) removed from group.`
  });
}

export async function checkNameUnique(name: string, excludeId?: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const result = await listGroups({ search: name });
  return !result.groups.some(g => g.name === name && g.id !== excludeId);
}
