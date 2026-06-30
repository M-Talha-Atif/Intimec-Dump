// Mock API Service Layer for Access Review
import {
  mockCampaigns,
  mockReviewItems,
  mockReviewDecisions,
  mockReviewTemplates,
  mockComplianceReport,
  mockExecutiveMetrics,
  mockIntegrationStatus,
  mockRoleMiningResults,
  mockNotificationConfigs,
  mockUsers
} from '@/data/mock-access-review-data';
import type {
  Campaign,
  ReviewItem,
  ReviewDecision,
  ReviewTemplate,
  ComplianceReport,
  ExecutiveMetrics,
  IntegrationStatus,
  RoleMiningResult,
  NotificationConfig,
  RemediationStatus
} from '@/types/accessReview';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Campaign Services
export const campaignService = {
  async getAllCampaigns(filters?: { status?: string; search?: string }): Promise<Campaign[]> {
    await delay(300);
    let results = [...mockCampaigns];
    
    if (filters?.status) {
      results = results.filter(c => c.status === filters.status);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.description.toLowerCase().includes(search)
      );
    }
    
    return results;
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    await delay(200);
    return mockCampaigns.find(c => c.id === id) || null;
  },

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    await delay(500);
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: campaign.name || 'New Campaign',
      description: campaign.description || '',
      type: campaign.type || 'user-based',
      status: 'draft',
      riskLevel: campaign.riskLevel || 'medium',
      progress: 0,
      totalItems: 0,
      completedItems: 0,
      dueDate: campaign.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date().toISOString(),
      createdBy: 'current-user@company.com',
      complianceFrameworks: campaign.complianceFrameworks || [],
      reviewers: [],
      configuration: campaign.configuration || {
        slaHours: 168,
        notificationChannels: ['email'],
        preReviewSimulation: false,
        autoReminder: true,
        reminderFrequency: 48,
        escalationEnabled: false,
        escalationAfterHours: 72,
        requireJustification: true,
        allowBulkActions: true,
        enableAIAssist: true,
        confidenceThreshold: 75
      }
    };
    return newCampaign;
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    await delay(400);
    const campaign = mockCampaigns.find(c => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    return { ...campaign, ...updates };
  },

  async deleteCampaign(id: string): Promise<void> {
    await delay(300);
  }
};

// Review Item Services
export const reviewItemService = {
  async getReviewItems(campaignId: string, filters?: { status?: string; riskLevel?: string }): Promise<ReviewItem[]> {
    await delay(400);
    let results = mockReviewItems.filter(item => item.campaignId === campaignId);
    
    if (filters?.status) {
      results = results.filter(item => item.status === filters.status);
    }
    
    if (filters?.riskLevel) {
      results = results.filter(item => item.riskLevel === filters.riskLevel);
    }
    
    return results;
  },

  async getReviewItemById(id: string): Promise<ReviewItem | null> {
    await delay(200);
    return mockReviewItems.find(item => item.id === id) || null;
  },

  async getReviewQueue(reviewerId: string): Promise<ReviewItem[]> {
    await delay(400);
    return mockReviewItems.filter(item => item.assignedReviewer === reviewerId && item.status !== 'completed');
  },

  async submitDecision(reviewItemId: string, decision: Partial<ReviewDecision>): Promise<ReviewDecision> {
    await delay(600);
    const newDecision: ReviewDecision = {
      id: `dec-${Date.now()}`,
      reviewItemId,
      campaignId: decision.campaignId || '',
      reviewerId: decision.reviewerId || 'current-user',
      reviewerName: decision.reviewerName || 'Current User',
      decision: decision.decision || 'approve',
      justification: decision.justification || '',
      decidedAt: new Date().toISOString(),
      aiAccepted: decision.aiAccepted || false,
      remediationStatus: {
        id: `rem-${Date.now()}`,
        status: 'queued',
        actions: []
      }
    };
    return newDecision;
  },

  async bulkSubmitDecisions(itemIds: string[], decision: 'approve' | 'revoke', justification: string): Promise<ReviewDecision[]> {
    await delay(1000);
    return itemIds.map(itemId => ({
      id: `dec-${Date.now()}-${itemId}`,
      reviewItemId: itemId,
      campaignId: 'camp-001',
      reviewerId: 'current-user',
      reviewerName: 'Current User',
      decision,
      justification,
      decidedAt: new Date().toISOString(),
      aiAccepted: false,
      remediationStatus: {
        id: `rem-${Date.now()}`,
        status: 'queued',
        actions: []
      }
    }));
  }
};

// Reviewer Services
export const reviewerService = {
  async assignReviewers(campaignId: string, reviewerIds: string[], assignmentStrategy: 'load-balance' | 'manager-hierarchy' | 'custom'): Promise<void> {
    await delay(800);
    console.log(`Assigning reviewers to campaign ${campaignId} using ${assignmentStrategy} strategy`);
  },

  async delegateReviews(fromReviewerId: string, toReviewerId: string, itemIds: string[]): Promise<void> {
    await delay(500);
    console.log(`Delegating ${itemIds.length} items from ${fromReviewerId} to ${toReviewerId}`);
  },

  async getReviewerWorkload(reviewerId: string): Promise<{ assigned: number; completed: number; pending: number }> {
    await delay(200);
    const assigned = mockReviewItems.filter(item => item.assignedReviewer === reviewerId).length;
    const completed = mockReviewItems.filter(item => item.assignedReviewer === reviewerId && item.status === 'completed').length;
    return { assigned, completed, pending: assigned - completed };
  }
};

// Analytics Services
export const analyticsService = {
  async getCampaignAnalytics(campaignId: string): Promise<any> {
    await delay(500);
    return {
      completionRate: 65,
      avgDecisionTime: 4.2,
      riskDistribution: {
        low: 45,
        medium: 32,
        high: 18,
        critical: 5
      },
      decisionBreakdown: {
        approve: 72,
        revoke: 15,
        modify: 10,
        exception: 3
      },
      aiAcceptanceRate: 82,
      sodViolationsResolved: 8
    };
  },

  async getExecutiveMetrics(): Promise<ExecutiveMetrics> {
    await delay(600);
    return mockExecutiveMetrics;
  },

  async getAccessAnalytics(userId: string): Promise<any> {
    await delay(400);
    const item = mockReviewItems.find(i => i.userId === userId);
    return item?.accessAnalytics || null;
  }
};

// Peer Comparison Services
export const peerComparisonService = {
  async getPeerComparison(userId: string, criteria: { jobTitle?: boolean; department?: boolean; location?: boolean }): Promise<any> {
    await delay(700);
    const item = mockReviewItems.find(i => i.userId === userId);
    return item?.peerComparison || null;
  },

  async findSimilarUsers(userId: string, limit: number = 5): Promise<any[]> {
    await delay(500);
    return mockUsers.slice(0, limit).map((user, index) => ({
      ...user,
      matchScore: 95 - index * 5,
      entitlements: [`Access ${index + 1}`, `Access ${index + 2}`]
    }));
  }
};

// AI Services
export const aiService = {
  async analyzeReviewItem(itemId: string): Promise<any> {
    await delay(1000);
    const item = mockReviewItems.find(i => i.id === itemId);
    return item?.aiSuggestion || null;
  },

  async detectAnomalies(userId: string): Promise<string[]> {
    await delay(800);
    return [
      'Unusual login time: 3:00 AM access detected',
      'Geographic anomaly: Login from new country',
      'Access pattern change: 300% increase in API calls'
    ];
  },

  async getRoleMiningResults(): Promise<RoleMiningResult[]> {
    await delay(900);
    return mockRoleMiningResults;
  }
};

// Template Services
export const templateService = {
  async getTemplates(filters?: { decision?: string; department?: string }): Promise<ReviewTemplate[]> {
    await delay(300);
    let results = [...mockReviewTemplates];
    
    if (filters?.decision) {
      results = results.filter(t => t.decision === filters.decision);
    }
    
    return results;
  },

  async createTemplate(template: Partial<ReviewTemplate>): Promise<ReviewTemplate> {
    await delay(400);
    return {
      id: `tmpl-${Date.now()}`,
      name: template.name || 'New Template',
      description: template.description || '',
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      decision: template.decision || 'approve',
      justification: template.justification || '',
      applicableFor: template.applicableFor || {},
      usageCount: 0
    };
  },

  async applyTemplate(templateId: string, itemIds: string[]): Promise<void> {
    await delay(600);
    console.log(`Applied template ${templateId} to ${itemIds.length} items`);
  }
};

// Reporting Services
export const reportingService = {
  async generateComplianceReport(framework: string, startDate: string, endDate: string): Promise<ComplianceReport> {
    await delay(2000);
    return mockComplianceReport;
  },

  async exportReport(reportId: string, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> {
    await delay(1500);
    return new Blob(['Mock report data'], { type: 'application/pdf' });
  },

  async scheduleReport(reportConfig: any): Promise<void> {
    await delay(500);
    console.log('Report scheduled:', reportConfig);
  }
};

// Integration Services
export const integrationService = {
  async getIntegrationStatus(): Promise<IntegrationStatus[]> {
    await delay(400);
    return mockIntegrationStatus;
  },

  async testConnection(system: string): Promise<{ success: boolean; message: string }> {
    await delay(1000);
    return {
      success: Math.random() > 0.2,
      message: Math.random() > 0.2 ? 'Connection successful' : 'Connection failed: timeout'
    };
  },

  async syncSystem(system: string): Promise<void> {
    await delay(2000);
    console.log(`Syncing ${system}...`);
  }
};

// Remediation Services
export const remediationService = {
  async getRemediationQueue(): Promise<RemediationStatus[]> {
    await delay(500);
    return [
      {
        id: 'rem-001',
        status: 'in-progress',
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        actions: [
          { id: 'act-001', type: 'deprovision', target: 'SAP-User-123', status: 'pending' },
          { id: 'act-002', type: 'notify', target: 'user@company.com', status: 'completed', result: 'Email sent' }
        ]
      }
    ];
  },

  async retryRemediation(remediationId: string): Promise<void> {
    await delay(1000);
    console.log(`Retrying remediation ${remediationId}`);
  },

  async cancelRemediation(remediationId: string): Promise<void> {
    await delay(500);
    console.log(`Cancelled remediation ${remediationId}`);
  }
};

// Notification Services
export const notificationService = {
  async getNotifications(campaignId?: string): Promise<NotificationConfig[]> {
    await delay(300);
    if (campaignId) {
      return mockNotificationConfigs.filter(n => n.campaignId === campaignId);
    }
    return mockNotificationConfigs;
  },

  async sendNotification(notificationId: string): Promise<void> {
    await delay(800);
    console.log(`Sending notification ${notificationId}`);
  },

  async updateNotificationConfig(id: string, updates: Partial<NotificationConfig>): Promise<NotificationConfig> {
    await delay(400);
    const config = mockNotificationConfigs.find(n => n.id === id);
    if (!config) throw new Error('Notification config not found');
    return { ...config, ...updates };
  }
};
