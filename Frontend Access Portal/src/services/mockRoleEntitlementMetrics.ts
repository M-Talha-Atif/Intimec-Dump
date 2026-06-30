import { mockRoles } from '@/data/mock-roles';
import { mockEntitlements } from '@/data/mock-entitlements';
import type { Role } from '@/types/roles';
import type { Entitlement } from '@/data/mock-entitlements';

// ── Role Metrics ──

const enabledRoles = mockRoles.filter(r => r.status === 'Enabled');
const genericOwners = ['System Operations', 'IT Department', 'Finance Department', 'CRM Team'];

export const roleMetrics = {
  totalActive: enabledRoles.length,
  total: mockRoles.length,
  byType: {
    functional: mockRoles.filter(r => r.type === 'Functional Role').length,
    business: mockRoles.filter(r => r.type === 'Business Role').length,
    technical: mockRoles.filter(r => r.type === 'Technical Role').length,
    application: mockRoles.filter(r => r.type === 'Application Role').length,
  },
  byClassification: {
    admin: mockRoles.filter(r => r.classification === 'Admin Role').length,
    privileged: mockRoles.filter(r => r.classification === 'Privileged').length,
    sensitive: mockRoles.filter(r => r.classification === 'Sensitive').length,
    standard: mockRoles.filter(r => r.classification === 'Standard').length,
  },
  byRisk: {
    low: mockRoles.filter(r => r.risk?.score === 'Low').length,
    medium: mockRoles.filter(r => r.risk?.score === 'Medium').length,
    high: mockRoles.filter(r => r.risk?.score === 'High').length,
  },
  byBusinessUnit: {
    finance: mockRoles.filter(r => r.businessUnit === 'Finance').length,
    hr: mockRoles.filter(r => r.businessUnit === 'Human Resources').length,
    engineering: mockRoles.filter(r => r.businessUnit === 'Engineering').length,
    marketing: mockRoles.filter(r => r.businessUnit === 'Marketing').length,
  },
  withoutOwners: mockRoles.filter(r => r.status === 'Enabled' && genericOwners.includes(r.owner)).length,
  emptyRoles: mockRoles.filter(r => r.userCount === 0 && r.status === 'Enabled').length,
  highRiskRoles: mockRoles.filter(r => r.risk?.score === 'High') as Role[],
  deprecated: mockRoles.filter(r => r.status === 'Deprecated').length,
  totalUsers: mockRoles.reduce((sum, r) => sum + r.userCount, 0),
  avgEntitlementsPerRole: Math.round(
    mockRoles.filter(r => r.status === 'Enabled').reduce((sum, r) => sum + r.entitlements.length, 0) /
    enabledRoles.length * 10
  ) / 10,
  staleReviews: mockRoles.filter(r => {
    const monthsSinceReview = (Date.now() - new Date(r.lastReviewed).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsSinceReview > 6 && r.status === 'Enabled';
  }),
  rolesWithOverlap: mockRoles.filter(r => r.risk?.conflict && (r.risk.conflict.overlap ?? 0) > 50),
  rolesWithInactiveUsers: mockRoles.filter(r => (r.inactiveUserCount ?? 0) > 0),
  roleTrend: [
    { month: 'Jan', count: 7 },
    { month: 'Feb', count: 8 },
    { month: 'Mar', count: 8 },
    { month: 'Apr', count: 9 },
    { month: 'May', count: 9 },
    { month: 'Jun', count: 10 },
  ],
  // App Roles specific
  appRoles: mockRoles.filter(r => r.type === 'Application Role' && r.status === 'Enabled'),
  activeRolesCount: enabledRoles.filter(r => r.userCount > 0).length,
  unusedRolesCount: enabledRoles.filter(r => r.userCount === 0).length,
  overlappingRoles: mockRoles.filter(r => r.risk?.conflict && (r.risk.conflict.overlap ?? 0) > 50),
  // Business Roles specific
  businessRoles: mockRoles.filter(r => r.type === 'Business Role'),
  businessRolesEnabled: mockRoles.filter(r => r.type === 'Business Role' && r.status === 'Enabled'),
  activeBusinessRoles: mockRoles.filter(r => r.type === 'Business Role' && r.status === 'Enabled' && r.userCount > 0).length,
  dormantBusinessRoles: mockRoles.filter(r => r.type === 'Business Role' && r.status === 'Enabled' && r.userCount === 0).length,
  rolesWithConflicts: mockRoles.filter(r => r.risk?.conflict).length,
};

// ── Entitlement Metrics ──

const byApp: Record<string, number> = {};
const byType: Record<string, number> = {};
mockEntitlements.forEach(e => {
  byApp[e.application] = (byApp[e.application] || 0) + 1;
  byType[e.type] = (byType[e.type] || 0) + 1;
});

const complianceFlags = {
  sox: mockEntitlements.filter(e => e.classification.includes('SOX')).length,
  gdpr: mockEntitlements.filter(e => e.classification.includes('GDPR')).length,
  pii: mockEntitlements.filter(e => e.classification.includes('PII')).length,
  highRisk: mockEntitlements.filter(e => e.classification.includes('High Risk')).length,
};

const assignedEntitlements = mockEntitlements.filter(e => (e.assignedUsersCount ?? 0) > 0).length;
const unassignedEntitlements = mockEntitlements.filter(e => (e.assignedUsersCount ?? 0) === 0).length;
const certifiedEntitlements = mockEntitlements.filter(e => e.reviewHistory && e.reviewHistory.length > 0).length;
const uncertifiedEntitlements = mockEntitlements.length - certifiedEntitlements;

export const entitlementMetrics = {
  total: mockEntitlements.length,
  byApplication: byApp,
  byType,
  byRisk: {
    low: mockEntitlements.filter(e => e.risk === 'Low').length,
    medium: mockEntitlements.filter(e => e.risk === 'Medium').length,
    high: mockEntitlements.filter(e => e.risk === 'High').length,
  },
  byPrivilege: {
    read: mockEntitlements.filter(e => e.privilegeLevel === 'Read').length,
    write: mockEntitlements.filter(e => e.privilegeLevel === 'Write').length,
    admin: mockEntitlements.filter(e => e.privilegeLevel === 'Admin').length,
  },
  byLifecycle: {
    active: mockEntitlements.filter(e => (e.lifecycle ?? 'Active') === 'Active').length,
    deprecated: mockEntitlements.filter(e => e.lifecycle === 'Deprecated').length,
    orphaned: mockEntitlements.filter(e => e.lifecycle === 'Orphaned').length,
    inactive: mockEntitlements.filter(e => e.lifecycle === 'Inactive').length,
  },
  orphaned: mockEntitlements.filter(e => e.lifecycle === 'Orphaned') as Entitlement[],
  highRisk: mockEntitlements.filter(e => e.risk === 'High') as Entitlement[],
  adminPrivileges: mockEntitlements.filter(e => e.privilegeLevel === 'Admin') as Entitlement[],
  complianceFlags,
  riskByApplication: Object.keys(byApp).map(app => {
    const appEnts = mockEntitlements.filter(e => e.application === app);
    return {
      application: app,
      low: appEnts.filter(e => e.risk === 'Low').length,
      medium: appEnts.filter(e => e.risk === 'Medium').length,
      high: appEnts.filter(e => e.risk === 'High').length,
    };
  }).sort((a, b) => (b.high + b.medium) - (a.high + a.medium)),
  privilegeByApplication: Object.keys(byApp).map(app => {
    const appEnts = mockEntitlements.filter(e => e.application === app);
    return {
      application: app,
      read: appEnts.filter(e => e.privilegeLevel === 'Read').length,
      write: appEnts.filter(e => e.privilegeLevel === 'Write').length,
      admin: appEnts.filter(e => e.privilegeLevel === 'Admin').length,
    };
  }),
  // New metrics
  assignedEntitlements,
  unassignedEntitlements,
  certifiedEntitlements,
  uncertifiedEntitlements,
  directAccessPercent: 34,
  roleBasedPercent: 66,
};

// ── Governance Intelligence Metrics ──

export const governanceMetrics = {
  // Role Coverage
  roleCoverageRate: 72,
  coverageByDept: [
    { dept: 'Finance', covered: 85, direct: 15 },
    { dept: 'Engineering', covered: 62, direct: 38 },
    { dept: 'HR', covered: 78, direct: 22 },
    { dept: 'Marketing', covered: 55, direct: 45 },
  ],

  // Direct vs Role-Based
  directAccessPercent: 34,
  roleBasedPercent: 66,

  // Maturity Index (composite 0-100)
  maturityIndex: 64,
  maturityDimensions: {
    roleCoverage: 72,
    ownershipCompleteness: 80,
    certificationCoverage: 58,
    roleBasedRatio: 66,
    riskPosture: 45,
  },

  // Complexity Score (0-100, lower is better)
  complexityScore: 42,

  // Role Explosion
  roleGrowthRate: 11,
  userGrowthRate: 5,
  roleExplosionAlert: true,
  roleGrowthTrend: [
    { month: 'Jan', roles: 7, users: 520 },
    { month: 'Feb', roles: 8, users: 528 },
    { month: 'Mar', roles: 8, users: 535 },
    { month: 'Apr', roles: 9, users: 540 },
    { month: 'May', roles: 9, users: 545 },
    { month: 'Jun', roles: 10, users: 550 },
  ],

  // AI Suggestions (mock)
  aiSuggestedRoles: 3,
  aiSuggestions: [
    { name: 'Junior Finance Analyst', reason: 'Cluster of 8 users with identical SAP + Oracle read-only access', confidence: 87, affectedUsers: 8 },
    { name: 'DevOps Engineer', reason: 'Common AWS + GitHub + Jira pattern detected across 12 users', confidence: 82, affectedUsers: 12 },
    { name: 'Sales Support', reason: 'Salesforce + ServiceNow read access frequently co-assigned', confidence: 74, affectedUsers: 15 },
  ],

  // Certification
  certificationCoverage: Math.round((certifiedEntitlements / mockEntitlements.length) * 100),

  // Business role adoption trend
  adoptionTrend: [
    { month: 'Jan', active: 3, dormant: 1 },
    { month: 'Feb', active: 3, dormant: 1 },
    { month: 'Mar', active: 3, dormant: 1 },
    { month: 'Apr', active: 4, dormant: 1 },
    { month: 'May', active: 4, dormant: 0 },
    { month: 'Jun', active: 4, dormant: 1 },
  ],

  // Maturity trend (12 months)
  maturityTrend: [
    { month: 'Jul', score: 48 },
    { month: 'Aug', score: 50 },
    { month: 'Sep', score: 52 },
    { month: 'Oct', score: 55 },
    { month: 'Nov', score: 57 },
    { month: 'Dec', score: 59 },
    { month: 'Jan', score: 60 },
    { month: 'Feb', score: 61 },
    { month: 'Mar', score: 62 },
    { month: 'Apr', score: 63 },
    { month: 'May', score: 63 },
    { month: 'Jun', score: 64 },
  ],
};

export { mockRoles, mockEntitlements };
