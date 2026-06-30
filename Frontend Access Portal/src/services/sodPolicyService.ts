import { 
  SoDPolicy, 
  ViolationDetail, 
  PolicyException, 
  SoDAnalytics,
  AIRecommendation,
  SimulationResult,
  SimulationScenario,
  ConflictMatrixCell,
  BulkOperation,
  NotificationRule
} from '@/types/sodPolicies';

// Mock Database Service - Replace with real API calls in production
class SoDPolicyService {
  private policies: SoDPolicy[] = [];
  private violations: ViolationDetail[] = [];
  private exceptions: PolicyException[] = [];
  
  constructor() {
    this.initializeMockData();
  }

  // Policies
  async getPolicies(filters?: any): Promise<SoDPolicy[]> {
    await this.delay(300);
    let filtered = [...this.policies];
    
    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }
    if (filters?.riskLevel?.length > 0) {
      filtered = filtered.filter(p => filters.riskLevel.includes(p.riskLevel));
    }
    
    return filtered;
  }

  async getPolicyById(id: string): Promise<SoDPolicy | null> {
    await this.delay(200);
    return this.policies.find(p => p.id === id) || null;
  }

  async createPolicy(policy: Partial<SoDPolicy>): Promise<SoDPolicy> {
    await this.delay(500);
    const newPolicy: SoDPolicy = {
      ...policy,
      id: `POL-${Date.now()}`,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: 1,
      versions: [],
      approvals: [],
      violationCount: 0,
      exceptionCount: 0,
      affectedUsers: 0,
    } as SoDPolicy;
    
    this.policies.push(newPolicy);
    return newPolicy;
  }

  async updatePolicy(id: string, updates: Partial<SoDPolicy>): Promise<SoDPolicy> {
    await this.delay(400);
    const index = this.policies.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Policy not found');
    
    const policy = this.policies[index];
    const updatedPolicy = {
      ...policy,
      ...updates,
      lastModified: new Date().toISOString(),
      version: policy.version + 1,
    };
    
    this.policies[index] = updatedPolicy;
    return updatedPolicy;
  }

  async deletePolicy(id: string): Promise<void> {
    await this.delay(300);
    this.policies = this.policies.filter(p => p.id !== id);
  }

  async clonePolicy(id: string): Promise<SoDPolicy> {
    const original = await this.getPolicyById(id);
    if (!original) throw new Error('Policy not found');
    
    return this.createPolicy({
      ...original,
      name: `${original.name} (Copy)`,
      status: 'draft',
      id: undefined,
    });
  }

  // Violations
  async getViolations(filters?: any): Promise<ViolationDetail[]> {
    await this.delay(300);
    let filtered = [...this.violations];
    
    if (filters?.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    if (filters?.severity?.length > 0) {
      filtered = filtered.filter(v => filters.severity.includes(v.severity));
    }
    if (filters?.policyId) {
      filtered = filtered.filter(v => v.policyId === filters.policyId);
    }
    
    return filtered;
  }

  async getViolationById(id: string): Promise<ViolationDetail | null> {
    await this.delay(200);
    return this.violations.find(v => v.id === id) || null;
  }

  async remediateViolation(id: string, action: string, details: string): Promise<void> {
    await this.delay(500);
    const violation = this.violations.find(v => v.id === id);
    if (violation) {
      violation.status = 'in_remediation';
      violation.history.push({
        id: `HIST-${Date.now()}`,
        action: 'remediation_started',
        performedBy: 'Current User',
        timestamp: new Date().toISOString(),
        details: `${action}: ${details}`,
      });
    }
  }

  async resolveViolation(id: string, resolution: string): Promise<void> {
    await this.delay(400);
    const violation = this.violations.find(v => v.id === id);
    if (violation) {
      violation.status = 'resolved';
      violation.history.push({
        id: `HIST-${Date.now()}`,
        action: 'resolved',
        performedBy: 'Current User',
        timestamp: new Date().toISOString(),
        details: resolution,
      });
    }
  }

  // Exceptions
  async getExceptions(filters?: any): Promise<PolicyException[]> {
    await this.delay(300);
    let filtered = [...this.exceptions];
    
    if (filters?.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    if (filters?.expiringWithin) {
      const daysFromNow = new Date();
      daysFromNow.setDate(daysFromNow.getDate() + filters.expiringWithin);
      filtered = filtered.filter(e => new Date(e.expiryDate) <= daysFromNow);
    }
    
    return filtered;
  }

  async requestException(data: Partial<PolicyException>): Promise<PolicyException> {
    await this.delay(500);
    const newException: PolicyException = {
      ...data,
      id: `EXC-${Date.now()}`,
      status: 'pending',
      requestedDate: new Date().toISOString(),
      renewalCount: 0,
      comments: [],
    } as PolicyException;
    
    this.exceptions.push(newException);
    return newException;
  }

  async approveException(id: string, approver: string): Promise<void> {
    await this.delay(400);
    const exception = this.exceptions.find(e => e.id === id);
    if (exception) {
      exception.status = 'approved';
      exception.approvedBy = approver;
      exception.approvedDate = new Date().toISOString();
    }
  }

  async revokeException(id: string): Promise<void> {
    await this.delay(300);
    const exception = this.exceptions.find(e => e.id === id);
    if (exception) {
      exception.status = 'revoked';
    }
  }

  // Analytics
  async getAnalytics(): Promise<SoDAnalytics> {
    await this.delay(400);
    return {
      totalPolicies: this.policies.length,
      activePolicies: this.policies.filter(p => p.status === 'active').length,
      totalViolations: this.violations.length,
      activeViolations: this.violations.filter(v => v.status !== 'resolved').length,
      resolvedViolations: this.violations.filter(v => v.status === 'resolved').length,
      totalExceptions: this.exceptions.length,
      activeExceptions: this.exceptions.filter(e => e.status === 'approved').length,
      criticalViolations: this.violations.filter(v => v.severity === 'critical').length,
      highRiskViolations: this.violations.filter(v => v.severity === 'high').length,
      averageRiskScore: 65,
      riskTrend: 'improving',
      averageResolutionTime: 3.5,
      violationsResolvedThisMonth: 12,
      violationDetectionRate: 95,
      complianceScore: 87,
      violationTrend: [
        { period: 'Jan', count: 15, resolved: 12 },
        { period: 'Feb', count: 12, resolved: 10 },
        { period: 'Mar', count: 18, resolved: 15 },
        { period: 'Apr', count: 10, resolved: 9 },
        { period: 'May', count: 14, resolved: 13 },
        { period: 'Jun', count: 11, resolved: 10 },
      ],
      policyEffectiveness: [],
      topViolatedPolicies: [],
      topConflictedRoles: [],
      topRiskyUsers: [],
    };
  }

  // AI Recommendations
  async getAIRecommendations(): Promise<AIRecommendation[]> {
    await this.delay(600);
    return [
      {
        id: 'AI-001',
        type: 'policy_suggestion',
        title: 'Suggested Policy: Finance & IT Admin Separation',
        description: 'AI detected 5 users with both Finance Manager and IT Admin roles. Creating a policy would prevent future violations.',
        confidence: 92,
        priority: 'high',
        suggestedAction: 'Create new SoD policy for Finance-IT separation',
        impact: 'Would detect 5 current violations and prevent future access conflicts',
        timestamp: new Date().toISOString(),
        status: 'new',
      },
      {
        id: 'AI-002',
        type: 'violation_prediction',
        title: 'Predicted Violation Risk',
        description: '3 users are likely to receive conflicting roles based on recent access request patterns',
        confidence: 78,
        priority: 'medium',
        suggestedAction: 'Review pending access requests for Sarah Johnson, Mike Chen, and Lisa Wang',
        impact: 'Prevents potential SOX compliance violations',
        timestamp: new Date().toISOString(),
        status: 'new',
      },
    ];
  }

  // Simulation
  async runSimulation(scenario: SimulationScenario): Promise<SimulationResult> {
    await this.delay(800);
    
    const hasConflict = scenario.rolesToAdd.some(role => 
      role.includes('Finance') && scenario.rolesToAdd.some(r => r.includes('IT'))
    );
    
    return {
      scenarioId: scenario.id,
      status: hasConflict ? 'conflict' : 'safe',
      conflictCount: hasConflict ? 2 : 0,
      conflicts: hasConflict ? [{
        policyId: 'POL-001',
        policyName: 'SOX Financial Controls',
        severity: 'high',
        description: 'Finance and IT administration roles create segregation conflict',
        conflictingItems: ['Finance Manager', 'IT Administrator'],
      }] : [],
      riskScore: hasConflict ? 85 : 15,
      recommendations: hasConflict ? [
        'Remove IT Administrator role',
        'Request temporary exception with justification',
        'Implement compensating controls',
      ] : ['Access can be safely granted'],
      alternativePaths: [],
    };
  }

  // Bulk Operations
  async executeBulkOperation(operation: BulkOperation): Promise<BulkOperation> {
    await this.delay(1000);
    
    return {
      ...operation,
      status: 'completed',
      completedDate: new Date().toISOString(),
      results: {
        successful: operation.items.length,
        failed: 0,
      },
    };
  }

  // Conflict Matrix
  async getConflictMatrix(): Promise<ConflictMatrixCell[]> {
    await this.delay(500);
    const roles = ['Finance Manager', 'IT Admin', 'HR Partner', 'Sales Director', 'Audit Manager'];
    const entitlements = ['Approve Invoices', 'Create Users', 'View Payroll', 'Access Vault', 'Generate Reports'];
    
    const matrix: ConflictMatrixCell[] = [];
    
    roles.forEach(role => {
      entitlements.forEach(ent => {
        const hasConflict = Math.random() > 0.7;
        matrix.push({
          row: role,
          column: ent,
          status: hasConflict ? 'conflict' : 'no_conflict',
          violationCount: hasConflict ? Math.floor(Math.random() * 5) : 0,
          exceptionCount: hasConflict ? Math.floor(Math.random() * 2) : 0,
          policyIds: hasConflict ? ['POL-001'] : [],
        });
      });
    });
    
    return matrix;
  }

  // Utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initializeMockData(): void {
    // Initialize with comprehensive mock data
    this.policies = this.generateMockPolicies();
    this.violations = this.generateMockViolations();
    this.exceptions = this.generateMockExceptions();
  }

  private generateMockPolicies(): SoDPolicy[] {
    return [
      {
        id: 'POL-001',
        name: 'SOX Financial Controls - Create & Approve',
        description: 'Prevents users from both creating and approving purchase orders to maintain SOX compliance',
        businessJustification: 'Required by Sarbanes-Oxley Act Section 404',
        status: 'active',
        conflictType: 'role-entitlement',
        conditions: [
          { id: 'C1', type: 'role', operator: 'AND', value: 'Finance Manager', negation: false },
          { id: 'C2', type: 'entitlement', operator: 'AND', value: 'Approve Purchase Orders', negation: false },
        ],
        enforcementMode: 'preventive',
        riskLevel: 'critical',
        complianceFrameworks: [
          { framework: 'SOX', controlId: '404', description: 'Internal Controls', required: true },
        ],
        tags: ['finance', 'sox', 'critical'],
        category: 'Financial Controls',
        createdBy: 'admin@company.com',
        createdDate: '2024-01-15T10:00:00Z',
        lastModifiedBy: 'admin@company.com',
        lastModified: '2024-11-01T15:30:00Z',
        lastReviewed: '2024-10-15T09:00:00Z',
        nextReviewDate: '2025-01-15T09:00:00Z',
        version: 3,
        versions: [
          {
            version: 1,
            timestamp: '2024-01-15T10:00:00Z',
            changes: ['Initial creation'],
            changedBy: 'admin@company.com',
            rollbackable: false,
            snapshotData: {},
          },
        ],
        requiresApproval: true,
        approvals: [],
        violationCount: 5,
        exceptionCount: 2,
        affectedUsers: 3,
        lastViolationDate: '2024-10-28T14:20:00Z',
        autoResolution: false,
        notificationEnabled: true,
        escalationPath: ['manager', 'cfo', 'compliance_officer'],
      },
      // ... more policies
    ];
  }

  private generateMockViolations(): ViolationDetail[] {
    return [
      {
        id: 'VIO-001',
        policyId: 'POL-001',
        policyName: 'SOX Financial Controls - Create & Approve',
        userId: 'user-001',
        userName: 'John Smith',
        userEmail: 'john.smith@company.com',
        userDepartment: 'Finance',
        userManager: 'Sarah Johnson',
        conflictingRoles: ['Finance Manager', 'Purchase Approver'],
        conflictingEntitlements: ['Create PO', 'Approve PO'],
        conflictingApplications: ['SAP ERP'],
        conflictPath: ['Finance Manager', 'Purchase Approver Role', 'Approve PO Permission'],
        status: 'open',
        severity: 'critical',
        riskScore: 95,
        priority: 1,
        detectedDate: '2024-10-28T14:20:00Z',
        detectedBy: 'Automated Scanner',
        firstDetectedDate: '2024-10-28T14:20:00Z',
        lastCheckedDate: new Date().toISOString(),
        sla: {
          target: 7,
          remaining: 3,
          breached: false,
        },
        remediationActions: [],
        comments: [],
        history: [
          {
            id: 'HIST-001',
            action: 'detected',
            performedBy: 'System',
            timestamp: '2024-10-28T14:20:00Z',
            details: 'Violation detected during scheduled scan',
          },
        ],
        businessImpact: 'High - SOX compliance violation could result in audit findings',
        affectedSystems: ['SAP ERP', 'Financial Module'],
        dataClassification: ['Financial Data', 'PII'],
        hasException: false,
      },
      // ... more violations
    ];
  }

  private generateMockExceptions(): PolicyException[] {
    return [
      {
        id: 'EXC-001',
        violationId: 'VIO-005',
        policyId: 'POL-001',
        policyName: 'SOX Financial Controls - Create & Approve',
        userId: 'user-010',
        userName: 'Alice Williams',
        userEmail: 'alice.w@company.com',
        userDepartment: 'Finance',
        status: 'approved',
        justification: 'Temporary role during system migration project',
        businessReason: 'Critical system migration requires dual access for 3 months',
        compensatingControls: ['Manager approval required for all POs', 'Daily audit log review'],
        requestedBy: 'alice.w@company.com',
        requestedDate: '2024-10-01T10:00:00Z',
        approvedBy: 'cfo@company.com',
        approvedDate: '2024-10-02T14:30:00Z',
        effectiveDate: '2024-10-05T00:00:00Z',
        expiryDate: '2025-01-05T23:59:59Z',
        autoRenew: false,
        renewalCount: 0,
        nextReviewDate: '2024-12-01T00:00:00Z',
        reviewFrequency: 30,
        riskLevel: 'high',
        mitigationPlan: 'All transactions will be audited weekly by compliance team',
        monitoringRequired: true,
        comments: [],
      },
      // ... more exceptions
    ];
  }
}

export const sodPolicyService = new SoDPolicyService();
