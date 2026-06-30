export interface DataSourceConfig {
  type: 'supabase' | 'api' | 'csv' | 'json';
  name: string;
  config: Record<string, any>;
}

export interface Schema {
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
}

export const reportDataSourceService = {
  supportedSources: ['supabase', 'api', 'csv', 'json'],

  async connectDataSource(config: DataSourceConfig): Promise<boolean> {
    switch (config.type) {
      case 'supabase':
        return this.connectSupabase(config.config);
      case 'api':
        return this.connectAPI(config.config);
      case 'csv':
        return true; // CSV is always available
      case 'json':
        return true; // JSON is always available
      default:
        throw new Error(`Unsupported data source type: ${config.type}`);
    }
  },

  async testConnection(config: DataSourceConfig): Promise<boolean> {
    try {
      await this.connectDataSource(config);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  async fetchSchema(source: string): Promise<Schema> {
    // Comprehensive IGA schemas
    const schemas: Record<string, Schema> = {
      identities: {
        tables: [{
          name: 'identities',
          columns: [
            { name: 'id', type: 'uuid', nullable: false },
            { name: 'email', type: 'text', nullable: false },
            { name: 'first_name', type: 'text', nullable: true },
            { name: 'last_name', type: 'text', nullable: true },
            { name: 'department', type: 'text', nullable: true },
            { name: 'title', type: 'text', nullable: true },
            { name: 'status', type: 'text', nullable: false },
            { name: 'risk_score', type: 'integer', nullable: true },
            { name: 'manager_id', type: 'uuid', nullable: true },
            { name: 'location', type: 'text', nullable: true },
            { name: 'last_login', type: 'timestamp', nullable: true },
            { name: 'created_at', type: 'timestamp', nullable: false },
            { name: 'updated_at', type: 'timestamp', nullable: false },
            { name: 'entitlement_count', type: 'integer', nullable: true },
            { name: 'high_risk_entitlements', type: 'integer', nullable: true },
          ],
        }],
      },
      access_reviews: {
        tables: [{
          name: 'access_reviews',
          columns: [
            { name: 'id', type: 'uuid', nullable: false },
            { name: 'campaign_name', type: 'text', nullable: false },
            { name: 'reviewer_id', type: 'uuid', nullable: false },
            { name: 'reviewer_email', type: 'text', nullable: false },
            { name: 'status', type: 'text', nullable: false },
            { name: 'decision', type: 'text', nullable: true },
            { name: 'total_items', type: 'integer', nullable: false },
            { name: 'completed_items', type: 'integer', nullable: false },
            { name: 'completion_rate', type: 'integer', nullable: true },
            { name: 'avg_completion_time', type: 'text', nullable: true },
            { name: 'created_at', type: 'timestamp', nullable: false },
            { name: 'completed_at', type: 'timestamp', nullable: true },
            { name: 'due_date', type: 'timestamp', nullable: true },
          ],
        }],
      },
      entitlements: {
        tables: [{
          name: 'entitlements',
          columns: [
            { name: 'id', type: 'uuid', nullable: false },
            { name: 'name', type: 'text', nullable: false },
            { name: 'type', type: 'text', nullable: false },
            { name: 'application_id', type: 'uuid', nullable: false },
            { name: 'application_name', type: 'text', nullable: false },
            { name: 'risk_level', type: 'text', nullable: false },
            { name: 'is_privileged', type: 'boolean', nullable: false },
            { name: 'user_count', type: 'integer', nullable: true },
            { name: 'data_classification', type: 'text', nullable: true },
            { name: 'granted_at', type: 'timestamp', nullable: false },
            { name: 'last_certified', type: 'timestamp', nullable: true },
            { name: 'owner_id', type: 'uuid', nullable: true },
          ],
        }],
      },
      audit_logs: {
        tables: [{
          name: 'audit_logs',
          columns: [
            { name: 'id', type: 'uuid', nullable: false },
            { name: 'actor_id', type: 'uuid', nullable: false },
            { name: 'actor_email', type: 'text', nullable: false },
            { name: 'action', type: 'text', nullable: false },
            { name: 'resource_type', type: 'text', nullable: false },
            { name: 'resource_id', type: 'uuid', nullable: true },
            { name: 'timestamp', type: 'timestamp', nullable: false },
            { name: 'ip_address', type: 'text', nullable: true },
            { name: 'user_agent', type: 'text', nullable: true },
            { name: 'status', type: 'text', nullable: false },
            { name: 'details', type: 'text', nullable: true },
          ],
        }],
      },
      sod_violations: {
        tables: [{
          name: 'sod_violations',
          columns: [
            { name: 'id', type: 'uuid', nullable: false },
            { name: 'user_id', type: 'uuid', nullable: false },
            { name: 'user_email', type: 'text', nullable: false },
            { name: 'policy_name', type: 'text', nullable: false },
            { name: 'conflicting_entitlements', type: 'array', nullable: false },
            { name: 'risk_level', type: 'text', nullable: false },
            { name: 'status', type: 'text', nullable: false },
            { name: 'detected_at', type: 'timestamp', nullable: false },
            { name: 'remediation_deadline', type: 'timestamp', nullable: true },
          ],
        }],
      },
      roles: {
        tables: [{
          name: 'roles',
          columns: [
            { name: 'id', type: 'uuid', nullable: false },
            { name: 'name', type: 'text', nullable: false },
            { name: 'type', type: 'text', nullable: false },
            { name: 'member_count', type: 'integer', nullable: false },
            { name: 'entitlement_count', type: 'integer', nullable: false },
            { name: 'owner_id', type: 'uuid', nullable: true },
            { name: 'coverage', type: 'integer', nullable: true },
            { name: 'last_certified', type: 'timestamp', nullable: true },
            { name: 'created_at', type: 'timestamp', nullable: false },
          ],
        }],
      },
      applications: {
        tables: [{
          name: 'applications',
          columns: [
            { name: 'id', type: 'uuid', nullable: false },
            { name: 'name', type: 'text', nullable: false },
            { name: 'type', type: 'text', nullable: false },
            { name: 'owner_id', type: 'uuid', nullable: true },
            { name: 'user_count', type: 'integer', nullable: true },
            { name: 'entitlement_count', type: 'integer', nullable: true },
            { name: 'sync_status', type: 'text', nullable: false },
            { name: 'last_sync', type: 'timestamp', nullable: true },
            { name: 'risk_level', type: 'text', nullable: false },
          ],
        }],
      },
    };

    return schemas[source] || { tables: [] };
  },

  async executeQuery(source: string, query: string): Promise<any[]> {
    // This would execute actual queries in production
    console.log(`Executing query on ${source}:`, query);
    return [];
  },

  async connectSupabase(config: Record<string, any>): Promise<boolean> {
    // Supabase connection is always available in this app
    return true;
  },

  async connectAPI(config: Record<string, any>): Promise<boolean> {
    const { url, method = 'GET', headers = {} } = config;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};
