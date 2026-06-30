export interface TreeNode {
  id: string;
  name: string;
  type: "organizational" | "geographical" | "application" | "identity";
  parentId?: string;
  children: TreeNode[];
  status: "active" | "pending" | "expired";
  delegates: DelegatedAdminAssignment[];
  created: string;
  userCount?: number;
  applicationsCount?: number;
}

export interface DelegatedAdminAssignment {
  id: string;
  userId: string;
  userName: string;
  role: "owner" | "admin" | "viewer";
  permissions: string[];
  timeWindow?: {
    start: string;
    end: string;
  };
  allowSiblingAccess?: boolean;
  assigned: string;
  assignedBy: string;
}

export interface HierarchicalDelegationFeatures {
  hierarchical: boolean;
}

export interface EffectiveAccess {
  nodeId: string;
  nodeName: string;
  accessType: "manage" | "view" | "none";
  source: "direct" | "inherited" | "sibling";
  permissions: string[];
}
