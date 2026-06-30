
export interface Task {
  id: string;
  name: string;
  type: 'data-import' | 'ai-analysis' | 'global-import' | 'provisioning' | 'review' | 'sync' | 'api_trigger' | 'workflow' | 'deprovisioning';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'escalated';
  createdAt: string;
  updatedAt: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  progress?: number;
  
  // Identity and ownership
  affectedIdentity: string;
  initiatedBy: string;
  
  // Application context
  application: string;
  applications?: string[];
  
  // Task metadata
  triggerSource: 'ui' | 'api' | 'scheduled' | 'workflow';
  retryCount?: number;
  slaCountdown: number;
  
  // Task data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
  logs?: string[];
  
  // Task tracking
  history?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
  }>;
  
  // Related objects
  linkedObjects?: {
    userId?: string;
    applicationId?: string;
    entitlementId?: string;
    requestId?: string;
    reviewId?: string;
  };
  
  // User annotations
  notes?: Array<{
    id: string;
    text: string;
    author: string;
    timestamp: string;
  }>;
  tags?: string[];
  
  // Execution results
  result?: {
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  };
  objects?: string[];
}

export interface TaskFilters {
  status?: string[];
  type?: string[];
  applications?: string[];
  triggerSource?: string[];
  affectedIdentity?: string;
  initiatedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  slaStatus?: 'overdue' | 'warning' | 'normal';
}
