export type OrgDelegate = {
  userId: string;
  name: string;
  role: 'admin' | 'reviewer' | 'approver';
  assignedDate: string;
  expiryDate?: string;
};

export type OrgChangeHistory = {
  date: string;
  user: string;
  action: string;
  details: string;
};

export type OrgNodeData = {
  id: string;
  name: string;
  type: 'Division' | 'Department' | 'Team' | 'Business Unit';
  head?: string;
  userCount: number;
  roleCount: number;
  adminCount: number;
  children?: OrgNodeData[];
  
  // For graph view
  parent?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
  hasStaleRoles?: boolean;
  
  // Identity & Governance
  costCenter?: string;
  legalEntity?: string;
  region?: string;
  country?: string;
  timeZone?: string;
  currency?: string;
  
  // Compliance & Audit
  complianceStatus?: 'compliant' | 'warning' | 'non-compliant';
  lastAuditDate?: string;
  nextReviewDate?: string;
  certificationStatus?: 'certified' | 'pending' | 'expired';
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Operational
  location?: string;
  buildingCode?: string;
  floor?: string;
  applicationCount?: number;
  privilegedUserCount?: number;
  contractorCount?: number;
  vendorCount?: number;
  
  // Delegation
  delegates?: OrgDelegate[];
  
  // Financial
  budget?: number;
  actualSpend?: number;
  licenseCost?: number;
  
  // Risk & Health Scores
  riskScore?: number; // 0-100
  healthScore?: number; // 0-100
  sodViolationCount?: number;
  orphanAccountCount?: number;
  dormantAccountCount?: number;
  overProvisionedUserCount?: number;
  
  // Metadata
  createdDate?: string;
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
  description?: string;
  tags?: string[];
  
  // Change History
  changeHistory?: OrgChangeHistory[];
};

export type OrgExportFormat = 'csv' | 'json' | 'xml' | 'excel';

export type OrgImportResult = {
  success: boolean;
  created: number;
  updated: number;
  errors: Array<{ line: number; message: string }>;
  warnings: Array<{ line: number; message: string }>;
};
