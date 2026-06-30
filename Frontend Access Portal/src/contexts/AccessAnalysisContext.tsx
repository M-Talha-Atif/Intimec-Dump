import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FilterConfig {
  departments: string[];
  riskLevels: ('critical' | 'high' | 'medium' | 'low')[];
  dateRange: { start: Date; end: Date } | null;
  searchQuery: string;
}

export interface Task {
  id: string;
  type: 'remediation' | 'review' | 'approval';
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  assignedTo: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  entityId: string;
  entityName: string;
}

export interface Activity {
  id: string;
  type: 'role_created' | 'access_granted' | 'violation_detected' | 'recommendation_applied';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface AccessAnalysisContextType {
  selectedUsers: string[];
  activeFilters: FilterConfig;
  pendingTasks: Task[];
  recentActivity: Activity[];
  notifications: Notification[];
  addToSelection: (userId: string) => void;
  removeFromSelection: (userId: string) => void;
  clearSelection: () => void;
  updateFilters: (filters: Partial<FilterConfig>) => void;
  resetFilters: () => void;
  createTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
}

const AccessAnalysisContext = createContext<AccessAnalysisContextType | undefined>(undefined);

const defaultFilters: FilterConfig = {
  departments: [],
  riskLevels: [],
  dateRange: null,
  searchQuery: '',
};

export const AccessAnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterConfig>(defaultFilters);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addToSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
  }, []);

  const removeFromSelection = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const updateFilters = useCallback((filters: Partial<FilterConfig>) => {
    setActiveFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const resetFilters = useCallback(() => {
    setActiveFilters(defaultFilters);
  }, []);

  const createTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setPendingTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: Task['status']) => {
    setPendingTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, status } : task))
    );
  }, []);

  const addActivity = useCallback((activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
    };
    setRecentActivity(prev => [newActivity, ...prev].slice(0, 50));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  return (
    <AccessAnalysisContext.Provider
      value={{
        selectedUsers,
        activeFilters,
        pendingTasks,
        recentActivity,
        notifications,
        addToSelection,
        removeFromSelection,
        clearSelection,
        updateFilters,
        resetFilters,
        createTask,
        updateTaskStatus,
        addActivity,
        addNotification,
        markNotificationRead,
        dismissNotification,
      }}
    >
      {children}
    </AccessAnalysisContext.Provider>
  );
};

export const useAccessAnalysis = () => {
  const context = useContext(AccessAnalysisContext);
  if (context === undefined) {
    throw new Error('useAccessAnalysis must be used within an AccessAnalysisProvider');
  }
  return context;
};
