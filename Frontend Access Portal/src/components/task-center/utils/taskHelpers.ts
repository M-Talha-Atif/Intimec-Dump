
import { Task } from '../types';

// Types
export interface TaskFiltersState {
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

// Helpers
export const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

export const getStatusColor = (status: Task['status']) => {
  const colors = {
    pending: 'text-blue-600',
    running: 'text-orange-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    escalated: 'text-purple-600',
    cancelled: 'text-gray-500'
  };
  return colors[status];
};

export const canRetry = (task: Task) => task.status === 'failed';
export const canAbort = (task: Task) => ['pending', 'running'].includes(task.status);
export const canEscalate = (task: Task) => ['pending', 'running', 'failed'].includes(task.status);

export const getUniqueValues = (tasks: Task[], key: keyof Task) => {
  return Array.from(new Set(tasks.map(task => {
    const value = task[key];
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value as string;
  }).filter(Boolean)));
};

export const filterTasks = (tasks: Task[], filters: TaskFiltersState, searchTerm: string): Task[] => {
  return tasks.filter(task => {
    // Search term filter
    if (searchTerm && !task.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.applications?.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.affectedIdentity.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.initiatedBy.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status?.length && !filters.status.includes(task.status)) {
      return false;
    }

    // Type filter
    if (filters.type?.length && !filters.type.includes(task.type)) {
      return false;
    }

    // Applications filter
    if (filters.applications?.length && !task.applications?.some(app => filters.applications?.includes(app))) {
      return false;
    }

    // Trigger source filter
    if (filters.triggerSource?.length && !filters.triggerSource.includes(task.triggerSource)) {
      return false;
    }

    // Affected identity filter
    if (filters.affectedIdentity && !task.affectedIdentity.includes(filters.affectedIdentity)) {
      return false;
    }

    // Initiated by filter
    if (filters.initiatedBy && !task.initiatedBy.includes(filters.initiatedBy)) {
      return false;
    }

    // SLA status filter
    if (filters.slaStatus) {
      if (filters.slaStatus === 'overdue' && task.slaCountdown >= 0) return false;
      if (filters.slaStatus === 'warning' && (task.slaCountdown < 0 || task.slaCountdown > 60)) return false;
      if (filters.slaStatus === 'normal' && task.slaCountdown < 60) return false;
    }

    return true;
  });
};
