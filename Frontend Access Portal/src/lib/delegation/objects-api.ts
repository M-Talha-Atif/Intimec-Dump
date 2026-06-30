
// Mock API for managing objects assigned to delegation nodes
interface ObjectStore {
  applications: Record<string, string[]>; // nodeId -> applicationIds
  users: Record<string, string[]>;
  roles: Record<string, string[]>;
  entitlements: Record<string, string[]>;
}

export type ObjectKind = 'application' | 'user' | 'role' | 'entitlement';

class ObjectsAPI {
  private store: ObjectStore = {
    applications: {},
    users: {},
    roles: {},
    entitlements: {}
  };

  // Mock data for search results
  private mockData = {
    application: [
      'Salesforce', 'Microsoft 365', 'Slack', 'Jira', 'Confluence', 'GitHub',
      'AWS Console', 'Azure Portal', 'Google Workspace', 'Zoom', 'Tableau',
      'ServiceNow', 'Workday', 'Okta', 'Splunk'
    ],
    user: [
      'john.doe@company.com', 'jane.smith@company.com', 'mike.johnson@company.com',
      'sarah.wilson@company.com', 'david.brown@company.com', 'lisa.davis@company.com',
      'tom.miller@company.com', 'emma.garcia@company.com', 'alex.martinez@company.com',
      'olivia.rodriguez@company.com', 'james.anderson@company.com', 'sophia.lopez@company.com'
    ],
    role: [
      'Admin', 'Editor', 'Viewer', 'Manager', 'Developer', 'Analyst',
      'HR Manager', 'Finance Lead', 'Sales Rep', 'Marketing Manager',
      'IT Support', 'Security Officer'
    ],
    entitlement: [
      'Read Access', 'Write Access', 'Delete Access', 'Admin Access',
      'Billing Access', 'User Management', 'Report Generation', 'API Access',
      'Export Data', 'Approve Requests', 'Audit Logs', 'System Config'
    ]
  };

  async getAssignedObjects(nodeId: string, kind: ObjectKind): Promise<string[]> {
    await this.delay(100); // Simulate API call
    return this.store[kind][nodeId] || [];
  }

  async searchObjects(kind: ObjectKind, query: string, page: number = 1): Promise<string[]> {
    await this.delay(200); // Simulate API call
    
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    
    let results = this.mockData[kind];
    
    if (query) {
      results = results.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return results.slice(startIndex, startIndex + pageSize);
  }

  async assignObjects(nodeId: string, kind: ObjectKind, ids: string[]): Promise<void> {
    await this.delay(300); // Simulate API call
    
    if (!this.store[kind][nodeId]) {
      this.store[kind][nodeId] = [];
    }
    
    // Add new IDs, avoiding duplicates
    const existing = new Set(this.store[kind][nodeId]);
    ids.forEach(id => existing.add(id));
    this.store[kind][nodeId] = Array.from(existing);
  }

  async unassignObjects(nodeId: string, kind: ObjectKind, ids: string[]): Promise<void> {
    await this.delay(300); // Simulate API call
    
    if (this.store[kind][nodeId]) {
      this.store[kind][nodeId] = this.store[kind][nodeId].filter(
        id => !ids.includes(id)
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const objectsAPI = new ObjectsAPI();
