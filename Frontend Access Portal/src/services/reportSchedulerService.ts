export interface ScheduleConfig {
  reportId: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time?: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timezone?: string;
  enabled: boolean;
  deliveryMethod: 'email' | 'slack' | 'teams' | 'webhook' | 'download';
  recipients?: string[];
  webhookUrl?: string;
  format?: 'pdf' | 'csv' | 'xlsx' | 'json';
}

export interface Schedule extends ScheduleConfig {
  id: string;
  nextRun: string;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  scheduleId: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
  resultUrl?: string;
  rowsProcessed?: number;
  deliveryStatus?: Record<string, 'pending' | 'sent' | 'failed'>;
}

export const reportSchedulerService = {
  async createSchedule(config: ScheduleConfig): Promise<Schedule> {
    const schedule: Schedule = {
      ...config,
      id: crypto.randomUUID(),
      nextRun: this.calculateNextRun(config),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in localStorage for demo (would be Supabase in production)
    const schedules = this.getSchedules();
    schedules.push(schedule);
    localStorage.setItem('report_schedules', JSON.stringify(schedules));

    return schedule;
  },

  async updateSchedule(scheduleId: string, config: Partial<ScheduleConfig>): Promise<Schedule> {
    const schedules = this.getSchedules();
    const index = schedules.findIndex((s) => s.id === scheduleId);
    
    if (index === -1) {
      throw new Error('Schedule not found');
    }

    const updated = {
      ...schedules[index],
      ...config,
      nextRun: config.frequency ? this.calculateNextRun({ ...schedules[index], ...config } as ScheduleConfig) : schedules[index].nextRun,
      updatedAt: new Date().toISOString(),
    };

    schedules[index] = updated;
    localStorage.setItem('report_schedules', JSON.stringify(schedules));

    return updated;
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    const schedules = this.getSchedules();
    const filtered = schedules.filter((s) => s.id !== scheduleId);
    localStorage.setItem('report_schedules', JSON.stringify(filtered));
  },

  async getSchedule(scheduleId: string): Promise<Schedule | null> {
    const schedules = this.getSchedules();
    return schedules.find((s) => s.id === scheduleId) || null;
  },

  getSchedules(): Schedule[] {
    const stored = localStorage.getItem('report_schedules');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Pre-populate with sample schedules on first load
    const initialSchedules: Schedule[] = [
      {
        id: crypto.randomUUID(),
        reportId: 'high-risk-identities',
        frequency: 'daily',
        time: '08:00',
        timezone: 'America/New_York',
        enabled: true,
        deliveryMethod: 'email',
        recipients: ['admin@company.com', 'security@company.com'],
        format: 'pdf',
        nextRun: new Date(new Date().setHours(8, 0, 0, 0) + 86400000).toISOString(),
        lastRun: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        reportId: 'access-review-status',
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '09:00',
        timezone: 'America/New_York',
        enabled: true,
        deliveryMethod: 'email',
        recipients: ['compliance@company.com'],
        format: 'xlsx',
        nextRun: new Date(new Date().setHours(9, 0, 0, 0) + 7 * 86400000).toISOString(),
        lastRun: new Date(Date.now() - 7 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        reportId: 'sod-violations',
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '10:00',
        timezone: 'America/New_York',
        enabled: false,
        deliveryMethod: 'email',
        recipients: ['risk@company.com'],
        format: 'pdf',
        nextRun: new Date(new Date().setMonth(new Date().getMonth() + 1, 1)).toISOString(),
        lastRun: new Date(Date.now() - 30 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    localStorage.setItem('report_schedules', JSON.stringify(initialSchedules));
    return initialSchedules;
  },

  async executeScheduledReport(scheduleId: string): Promise<Execution> {
    const schedule = await this.getSchedule(scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const execution: Execution = {
      id: crypto.randomUUID(),
      scheduleId,
      reportId: schedule.reportId,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    // Store execution
    const executions = this.getExecutions(scheduleId);
    executions.push(execution);
    localStorage.setItem(`executions_${scheduleId}`, JSON.stringify(executions));

    // Simulate execution (would be real in production)
    setTimeout(async () => {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      execution.rowsProcessed = Math.floor(Math.random() * 1000) + 100;
      execution.deliveryStatus = {
        [schedule.deliveryMethod]: 'sent',
      };

      // Update last run
      await this.updateSchedule(scheduleId, {
        lastRun: new Date().toISOString(),
      });

      // Update execution
      const execs = this.getExecutions(scheduleId);
      const idx = execs.findIndex((e) => e.id === execution.id);
      if (idx !== -1) {
        execs[idx] = execution;
        localStorage.setItem(`executions_${scheduleId}`, JSON.stringify(execs));
      }
    }, 2000);

    return execution;
  },

  async getScheduleHistory(scheduleId: string): Promise<Execution[]> {
    return this.getExecutions(scheduleId);
  },

  getExecutions(scheduleId: string): Execution[] {
    const stored = localStorage.getItem(`executions_${scheduleId}`);
    return stored ? JSON.parse(stored) : [];
  },

  calculateNextRun(config: ScheduleConfig): string {
    const now = new Date();
    let next = new Date(now);

    switch (config.frequency) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        if (config.time) {
          const [hours, minutes] = config.time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
        }
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        if (config.dayOfMonth) {
          next.setDate(config.dayOfMonth);
        }
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
    }

    return next.toISOString();
  },
};
