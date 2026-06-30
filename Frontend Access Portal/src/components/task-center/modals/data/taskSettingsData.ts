
export interface TaskSettings {
  // SLA Settings
  defaultSlaMinutes: string;
  escalationThresholdMinutes: string;
  autoEscalate: boolean;
  escalationEmail: string;
  
  // Notification Settings
  emailNotifications: boolean;
  webhookNotifications: boolean;
  webhookUrl: string;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notifyOnEscalation: boolean;
  
  // Retention Settings
  retainCompletedDays: string;
  retainFailedDays: string;
  autoArchive: boolean;
  
  // Retry Settings
  autoRetryEnabled: boolean;
  maxRetryAttempts: string;
  retryIntervalMinutes: string;
  exponentialBackoff: boolean;
  
  // Display Settings
  refreshInterval: string;
  autoRefresh: boolean;
  defaultView: string;
  rowsPerPage: string;
  showCompletedTasks: boolean;
  
  // Integration Settings
  prometheusEndpoint: string;
  datadogApiKey: string;
  splunkHecUrl: string;
}

export const initialTaskSettings: TaskSettings = {
  // SLA Settings
  defaultSlaMinutes: '60',
  escalationThresholdMinutes: '30',
  autoEscalate: true,
  escalationEmail: 'ops-team@company.com',
  
  // Notification Settings
  emailNotifications: true,
  webhookNotifications: false,
  webhookUrl: '',
  notifyOnSuccess: false,
  notifyOnFailure: true,
  notifyOnEscalation: true,
  
  // Retention Settings
  retainCompletedDays: '30',
  retainFailedDays: '90',
  autoArchive: true,
  
  // Retry Settings
  autoRetryEnabled: true,
  maxRetryAttempts: '3',
  retryIntervalMinutes: '5',
  exponentialBackoff: true,
  
  // Display Settings
  refreshInterval: '30',
  autoRefresh: true,
  defaultView: 'all',
  rowsPerPage: '25',
  showCompletedTasks: true,
  
  // Integration Settings
  prometheusEndpoint: '',
  datadogApiKey: '',
  splunkHecUrl: ''
};
