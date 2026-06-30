export const failurePatterns = [
  { pattern: 'Connection Timeout', count: 12, percentage: 35 },
  { pattern: 'Authentication Failed', count: 8, percentage: 24 },
  { pattern: 'Rate Limit Exceeded', count: 7, percentage: 21 },
  { pattern: 'Invalid Payload', count: 5, percentage: 15 },
  { pattern: 'Other', count: 2, percentage: 5 }
];

export const peakHours = [
  { hour: '02:00-04:00', taskCount: 45, avgDuration: '2.3m' },
  { hour: '08:00-10:00', taskCount: 32, avgDuration: '3.1m' },
  { hour: '14:00-16:00', taskCount: 28, avgDuration: '2.8m' },
  { hour: '20:00-22:00', taskCount: 18, avgDuration: '2.5m' }
];

export const weeklyVolumeData = [32, 45, 38, 52, 48, 55, 42];
