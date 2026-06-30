export const eventVolumeData = [
  { time: '00:00', info: 42, warn: 8, error: 2, critical: 0 },
  { time: '02:00', info: 15, warn: 3, error: 1, critical: 0 },
  { time: '04:00', info: 8, warn: 1, error: 0, critical: 0 },
  { time: '06:00', info: 25, warn: 5, error: 1, critical: 0 },
  { time: '08:00', info: 78, warn: 12, error: 4, critical: 1 },
  { time: '10:00', info: 95, warn: 18, error: 6, critical: 0 },
  { time: '12:00', info: 88, warn: 15, error: 3, critical: 0 },
  { time: '14:00', info: 102, warn: 22, error: 8, critical: 2 },
  { time: '16:00', info: 85, warn: 14, error: 5, critical: 0 },
  { time: '18:00', info: 55, warn: 9, error: 2, critical: 0 },
  { time: '20:00', info: 35, warn: 6, error: 1, critical: 0 },
  { time: '22:00', info: 28, warn: 4, error: 1, critical: 0 },
];

export const errorRateData = [
  { time: '00:00', rate: 1.2 }, { time: '02:00', rate: 0.8 }, { time: '04:00', rate: 0.3 },
  { time: '06:00', rate: 1.5 }, { time: '08:00', rate: 3.2 }, { time: '10:00', rate: 2.8 },
  { time: '12:00', rate: 1.8 }, { time: '14:00', rate: 4.1 }, { time: '16:00', rate: 2.5 },
  { time: '18:00', rate: 1.6 }, { time: '20:00', rate: 0.9 }, { time: '22:00', rate: 0.7 },
];

export const connectorLatencyData = [
  { time: '00:00', ad: 1.1, sap: 2.8, sf: 4.2, wd: 2.5 },
  { time: '02:00', ad: 1.0, sap: 2.9, sf: 4.5, wd: 2.6 },
  { time: '04:00', ad: 0.9, sap: 2.7, sf: 4.0, wd: 2.4 },
  { time: '06:00', ad: 1.2, sap: 3.0, sf: 5.1, wd: 2.7 },
  { time: '08:00', ad: 1.4, sap: 3.5, sf: 7.2, wd: 2.9 },
  { time: '10:00', ad: 1.3, sap: 3.2, sf: 8.1, wd: 2.8 },
  { time: '12:00', ad: 1.1, sap: 3.0, sf: 6.5, wd: 2.6 },
  { time: '14:00', ad: 1.2, sap: 3.1, sf: 8.7, wd: 2.8 },
  { time: '16:00', ad: 1.3, sap: 3.3, sf: 7.8, wd: 2.9 },
  { time: '18:00', ad: 1.1, sap: 2.9, sf: 5.5, wd: 2.5 },
  { time: '20:00', ad: 1.0, sap: 2.8, sf: 4.8, wd: 2.4 },
  { time: '22:00', ad: 1.0, sap: 2.7, sf: 4.3, wd: 2.5 },
];

export const provisioningThroughputData = [
  { time: '00:00', created: 5, updated: 12, deleted: 2, failed: 0 },
  { time: '02:00', created: 2, updated: 5, deleted: 1, failed: 0 },
  { time: '04:00', created: 1, updated: 3, deleted: 0, failed: 0 },
  { time: '06:00', created: 8, updated: 15, deleted: 3, failed: 1 },
  { time: '08:00', created: 25, updated: 45, deleted: 8, failed: 2 },
  { time: '10:00', created: 32, updated: 58, deleted: 12, failed: 3 },
  { time: '12:00', created: 28, updated: 42, deleted: 6, failed: 1 },
  { time: '14:00', created: 35, updated: 62, deleted: 15, failed: 4 },
  { time: '16:00', created: 22, updated: 38, deleted: 9, failed: 2 },
  { time: '18:00', created: 12, updated: 22, deleted: 4, failed: 1 },
  { time: '20:00', created: 6, updated: 15, deleted: 2, failed: 0 },
  { time: '22:00', created: 4, updated: 10, deleted: 1, failed: 0 },
];

export const complianceScoreTrendData = [
  { date: 'Jan', sox: 96, gdpr: 92, hipaa: 85, pci: 90 },
  { date: 'Feb', sox: 97, gdpr: 93, hipaa: 84, pci: 91 },
  { date: 'Mar', sox: 96, gdpr: 94, hipaa: 86, pci: 89 },
  { date: 'Apr', sox: 98, gdpr: 94, hipaa: 85, pci: 91 },
  { date: 'May', sox: 97, gdpr: 95, hipaa: 87, pci: 92 },
  { date: 'Jun', sox: 98, gdpr: 95, hipaa: 87, pci: 92 },
];

export const jobSuccessFailureData = [
  { time: '00:00', success: 18, failed: 1 },
  { time: '02:00', success: 8, failed: 0 },
  { time: '04:00', success: 4, failed: 0 },
  { time: '06:00', success: 15, failed: 1 },
  { time: '08:00', success: 42, failed: 3 },
  { time: '10:00', success: 55, failed: 4 },
  { time: '12:00', success: 48, failed: 2 },
  { time: '14:00', success: 62, failed: 5 },
  { time: '16:00', success: 38, failed: 3 },
  { time: '18:00', success: 22, failed: 1 },
  { time: '20:00', success: 12, failed: 0 },
  { time: '22:00', success: 8, failed: 1 },
];

export const slaComplianceTrendData = [
  { date: 'Mon', accessRequest: 95, provisioning: 98, certification: 88, incident: 72 },
  { date: 'Tue', accessRequest: 93, provisioning: 97, certification: 86, incident: 68 },
  { date: 'Wed', accessRequest: 96, provisioning: 96, certification: 84, incident: 75 },
  { date: 'Thu', accessRequest: 97, provisioning: 99, certification: 87, incident: 70 },
  { date: 'Fri', accessRequest: 94, provisioning: 95, certification: 85, incident: 65 },
  { date: 'Sat', accessRequest: 99, provisioning: 100, certification: 90, incident: 88 },
  { date: 'Sun', accessRequest: 100, provisioning: 100, certification: 92, incident: 90 },
];
