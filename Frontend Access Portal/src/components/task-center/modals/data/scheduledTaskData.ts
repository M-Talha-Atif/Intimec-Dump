export interface ScheduledTaskForm {
  name: string;
  description: string;
  type: string;
  frequency: string;
  time: string;
  timezone: string;
  date: string;
  cronExpression: string;
  runImmediately: boolean;
  targetApplication: string;
  targetIdentities: string;
  slaMinutes: string;
  retryAttempts: string;
  notificationEmails: string;
  enabled: boolean;
}

export const initialScheduledTaskForm: ScheduledTaskForm = {
  name: '',
  description: '',
  type: 'provisioning',
  frequency: 'daily',
  time: '02:00',
  timezone: 'UTC',
  date: '',
  cronExpression: '',
  runImmediately: false,
  targetApplication: '',
  targetIdentities: '',
  slaMinutes: '60',
  retryAttempts: '3',
  notificationEmails: '',
  enabled: true
};

export const taskTypes = [
  { value: 'provisioning', label: 'Provisioning' },
  { value: 'deprovisioning', label: 'Deprovisioning' },
  { value: 'review', label: 'Access Review' },
  { value: 'certification', label: 'Certification' },
  { value: 'sync', label: 'Data Sync' },
  { value: 'data-import', label: 'Data Import' },
  { value: 'ai-analysis', label: 'AI Analysis' },
  { value: 'workflow', label: 'Workflow' }
];

export const frequencies = [
  { value: 'one-time', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom (Cron)' }
];

export const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'GMT (London)' },
  { value: 'Europe/Paris', label: 'CET (Paris)' }
];
