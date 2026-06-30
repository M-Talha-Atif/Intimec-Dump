
export interface ModuleGroup {
  group: string;
  modules: PermissionModule[];
}

export interface PermissionModule {
  moduleId: string;
  label: string;
  group: string;
  actions: string[];
}

export interface RolePolicyRule {
  moduleId: string;
  action: string;
  effect: 'allow' | 'deny' | 'inherit' | 'conditional';
  granularity?: {
    fields?: Record<string, 'hidden' | 'masked' | 'readOnly' | 'editable'>;
    entities?: {
      ownerOnly?: boolean;
      departmentOnly?: boolean;
      filters?: string[];
    };
  };
  conditions?: {
    expr: string;
  };
  sodTags?: string[];
  note?: string;
  inheritedFrom?: string;
  lastModified?: string;
  modifiedBy?: string;
}

export interface PermissionCell {
  moduleId: string;
  action: string;
  effect: 'allow' | 'deny' | 'inherit' | 'conditional';
  source: 'direct' | 'inherited' | 'template' | 'default';
  inheritedFrom?: string;
  hasConditions?: boolean;
}

export interface BulkEditSelection {
  modules: string[];
  actions: string[];
  effect: 'allow' | 'deny' | 'inherit';
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  rules: RolePolicyRule[];
  category: 'standard' | 'compliance' | 'custom';
}
