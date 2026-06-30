'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransformedAuditLog, AuditLogFilters, AuditLogResponse, ApiAuditLog } from '@/types/audit-logs';

// Client-side API service
class ClientAuditLogsService {
  private apiUrl = '/api'; // Use Next.js API routes instead of direct backend calls

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    return fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers,
    });
  }

  private buildQueryString(filters: AuditLogFilters): string {
    const params = new URLSearchParams();
    
    if (filters.event && filters.event !== 'all') {
      params.append('event', filters.event);
    }
    
    if (filters.objectType && filters.objectType !== 'all') {
      params.append('objectType', filters.objectType);
    }

    if (filters.excludeObjectType) {
      params.append('excludeObjectType', filters.excludeObjectType);
    }
    
    if (filters.risk && filters.risk !== 'all') {
      params.append('risk', filters.risk);
    }
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    if (filters.dateFrom) {
      // For dateFrom, set to beginning of the day if only date is provided
      const fromDate = new Date(filters.dateFrom);
      if (filters.dateFrom.length === 10) { // Only date provided (YYYY-MM-DD)
        fromDate.setHours(0, 0, 0, 0);
      }
      params.append('dateFrom', fromDate.toISOString());
    }
    
    if (filters.dateTo) {
      // For dateTo, set to end of the day if only date is provided
      const toDate = new Date(filters.dateTo);
      if (filters.dateTo.length === 10) { // Only date provided (YYYY-MM-DD)
        toDate.setHours(23, 59, 59, 999);
      }
      params.append('dateTo', toDate.toISOString());
    }
    
    if (filters.page !== undefined) {
      params.append('page', filters.page.toString());
    }
    
    if (filters.size !== undefined) {
      params.append('size', filters.size.toString());
    }

    return params.toString();
  }

  private transformAuditLog(apiLog: ApiAuditLog): TransformedAuditLog {
    return {
      id: apiLog.id,
      timestamp: apiLog.timestamp,
      eventType: apiLog.event,
      objectType: apiLog.objectType,
      objectId: apiLog.objectId,
      objectName: apiLog.targetObject?.objectName || apiLog.actorName || `${apiLog.objectType}-${apiLog.objectId || 'unknown'}`,
      actor: {
        id: apiLog.actorId,
        name: apiLog.actorName || 'System',
        type: apiLog.actorType,
      },
      target: apiLog.targetObject ? {
        id: apiLog.objectId,
        name: apiLog.targetObject.objectName || apiLog.targetObject.type || 'Unknown',
        type: apiLog.targetObject.type,
      } : undefined,
      description: apiLog.details?.message || `${apiLog.event} ${apiLog.objectType}`,
      riskLevel: apiLog.risk as 'low' | 'medium' | 'high' | 'critical',
      ipAddress: apiLog.details?.ipAddress,
      location: apiLog.details?.location as string | undefined,
      userAgent: apiLog.details?.userAgent,
      sessionId: undefined,
      correlationId: undefined,
      complianceFlags: [],
      metadata: apiLog.metadata || {},
      beforeState: apiLog.stateBefore && Object.keys(apiLog.stateBefore).length > 0 ? 
        apiLog.stateBefore : undefined,
      afterState: apiLog.stateAfter && Object.keys(apiLog.stateAfter).length > 0 ? 
        apiLog.stateAfter : undefined,
      outcome: apiLog.status as 'success' | 'failure' | 'pending',
      errorMessage: apiLog.errorDetails || undefined,
      resourceOwner: apiLog.governance?.owner || undefined,
      department: apiLog.governance?.department || undefined,
    };
  }

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{ 
    logs: TransformedAuditLog[], 
    pagination: { totalPages: number, totalElements: number, currentPage: number, pageSize: number },
    availableEvents: string[],
    availableObjectTypes: string[],
    availableRisks: string[],
    availableStatuses: string[]
  }> {
    const queryString = this.buildQueryString(filters);
    const endpoint = `/audit-logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest(endpoint);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch audit logs: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: AuditLogResponse = await response.json();
    
    return {
      logs: data.logs.content.map((log) => this.transformAuditLog(log)),
      pagination: {
        totalPages: data.logs.totalPages,
        totalElements: data.logs.totalElements,
        currentPage: data.logs.number,
        pageSize: data.logs.size
      },
      availableEvents: data.availableEvents,
      availableObjectTypes: data.availableObjectTypes,
      availableRisks: data.availableRisks,
      availableStatuses: data.availableStatuses || []
    };
  }

  async exportAuditLogs(filters: AuditLogFilters = {}, format: 'csv' | 'json' = 'json'): Promise<Blob> {
    if (format === 'json') {
      // For JSON export, get CURRENT PAGE data only (keep pagination)
      const currentPageResponse = await this.getAuditLogs(filters);
      const jsonData = JSON.stringify(currentPageResponse.logs, null, 2);
      return new Blob([jsonData], { type: 'application/json' });
    } else {
      // For CSV, use the existing export endpoint with current filters
      const queryString = this.buildQueryString(filters);
      const endpoint = `/audit-logs/export?format=${format}${queryString ? `&${queryString}` : ''}`;
      
      const response = await this.makeRequest(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to export audit logs: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    }
  }

  async exportSingleAuditLog(log: TransformedAuditLog, format: 'csv' | 'json' = 'json'): Promise<Blob> {
    if (format === 'json') {
      const jsonData = JSON.stringify(log, null, 2);
      return new Blob([jsonData], { type: 'application/json' });
    } else {
      // For CSV, convert single log to CSV format
      const headers = Object.keys(log).join(',');
      const values = Object.values(log).map(value => {
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
      
      const csvData = `${headers}\n${values}`;
      return new Blob([csvData], { type: 'text/csv' });
    }
  }

  async exportMultipleAuditLogs(logs: TransformedAuditLog[], format: 'csv' | 'json' = 'json'): Promise<Blob> {
    if (format === 'json') {
      const jsonData = JSON.stringify(logs, null, 2);
      return new Blob([jsonData], { type: 'application/json' });
    } else {
      // For CSV, convert logs array to CSV format
      if (logs.length === 0) {
        return new Blob([''], { type: 'text/csv' });
      }
      
      const headers = Object.keys(logs[0]).join(',');
      const rows = logs.map(log => 
        Object.values(log).map(value => {
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      );
      
      const csvData = `${headers}\n${rows.join('\n')}`;
      return new Blob([csvData], { type: 'text/csv' });
    }
  }
}

const clientAuditLogsService = new ClientAuditLogsService();

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const [logs, setLogs] = useState<TransformedAuditLog[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalElements: 0,
    currentPage: 0,
    pageSize: 25
  });
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [availableObjectTypes, setAvailableObjectTypes] = useState<string[]>([]);
  const [availableRisks, setAvailableRisks] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientAuditLogsService.getAuditLogs(filters);
      setLogs(result.logs);
      setPagination(result.pagination);
      setAvailableEvents(result.availableEvents);
      setAvailableObjectTypes(result.availableObjectTypes);
      setAvailableRisks(result.availableRisks);
      setAvailableStatuses(result.availableStatuses || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(errorMessage);
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportLogs = useCallback(async (format: 'csv' | 'json') => {
    try {
      const blob = await clientAuditLogsService.exportAuditLogs(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-page-${pagination?.currentPage || 1}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to export audit logs');
    }
  }, [filters, pagination?.currentPage]);

  const exportSingleLog = useCallback(async (log: TransformedAuditLog, format: 'csv' | 'json') => {
    try {
      const blob = await clientAuditLogsService.exportSingleAuditLog(log, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${log.id}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting single audit log:', err);
      setError(err instanceof Error ? err.message : 'Failed to export audit log');
    }
  }, []);

  const exportSelectedLogs = useCallback(async (selectedLogs: TransformedAuditLog[], format: 'csv' | 'json') => {
    try {
      const blob = await clientAuditLogsService.exportMultipleAuditLogs(selectedLogs, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-selected-${selectedLogs.length}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting selected audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to export selected audit logs');
    }
  }, []);

  const refetch = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    pagination,
    availableEvents,
    availableObjectTypes,
    availableRisks,
    availableStatuses,
    loading,
    error,
    refetch,
    exportLogs,
    exportSingleLog,
    exportSelectedLogs,
  };
}
