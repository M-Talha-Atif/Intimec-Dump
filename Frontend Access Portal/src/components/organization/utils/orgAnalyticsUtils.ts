import { OrgNodeData } from '@/types/organization';

export interface OrgAnalytics {
  totalUnits: number;
  totalUsers: number;
  totalRoles: number;
  avgUsersPerUnit: number;
  riskDistribution: { Low: number; Medium: number; High: number };
  complianceDistribution: { compliant: number; warning: number; 'non-compliant': number };
  usersByDivision: { name: string; users: number; roles: number }[];
  healthBuckets: Record<string, number>;
  highRiskUnits: number;
  staleRoleUnits: number;
}

export function collectNodes(node: OrgNodeData): OrgNodeData[] {
  const nodes: OrgNodeData[] = [node];
  if (node.children) {
    node.children.forEach(child => nodes.push(...collectNodes(child)));
  }
  return nodes;
}

export function computeAnalytics(data: OrgNodeData): OrgAnalytics {
  const nodes = collectNodes(data);

  const totalUnits = nodes.length;
  const totalUsers = nodes.reduce((sum, n) => sum + n.userCount, 0);
  const totalRoles = nodes.reduce((sum, n) => sum + n.roleCount, 0);
  const avgUsersPerUnit = totalUsers / totalUnits;

  const riskDistribution = {
    Low: nodes.filter(n => n.riskLevel === 'Low').length,
    Medium: nodes.filter(n => n.riskLevel === 'Medium').length,
    High: nodes.filter(n => n.riskLevel === 'High').length,
  };

  const complianceDistribution = {
    compliant: nodes.filter(n => n.complianceStatus === 'compliant').length,
    warning: nodes.filter(n => n.complianceStatus === 'warning').length,
    'non-compliant': nodes.filter(n => n.complianceStatus === 'non-compliant').length,
  };

  const divisions = nodes.filter(n => n.type === 'Division');
  const usersByDivision = divisions.map(d => ({
    name: d.name,
    users: d.userCount,
    roles: d.roleCount,
  }));

  const healthBuckets: Record<string, number> = {
    'Excellent (80-100)': nodes.filter(n => (n.healthScore || 0) >= 80).length,
    'Good (60-79)': nodes.filter(n => (n.healthScore || 0) >= 60 && (n.healthScore || 0) < 80).length,
    'Fair (40-59)': nodes.filter(n => (n.healthScore || 0) >= 40 && (n.healthScore || 0) < 60).length,
    'Poor (<40)': nodes.filter(n => (n.healthScore || 0) < 40).length,
  };

  return {
    totalUnits,
    totalUsers,
    totalRoles,
    avgUsersPerUnit,
    riskDistribution,
    complianceDistribution,
    usersByDivision,
    healthBuckets,
    highRiskUnits: nodes.filter(n => n.riskLevel === 'High').length,
    staleRoleUnits: nodes.filter(n => n.hasStaleRoles).length,
  };
}
