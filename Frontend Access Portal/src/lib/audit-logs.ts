import {cookies} from 'next/headers';
import {ApiAuditLog, AuditLogFilters, AuditLogResponse, TransformedAuditLog} from '@/types/audit-logs';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8089/api/v1';

class AuditLogsService {
    private async getAuthToken(): Promise<string | null> {
        try {
            const cookieStore = await cookies();
            return cookieStore.get('auth_token')?.value || null;
        } catch {
            return null;
        }
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = await this.getAuthToken();


        return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    }

    private buildQueryString(filters: AuditLogFilters): string {
        const params = new URLSearchParams();

        if (filters.eventType && filters.eventType !== 'all') {
            params.append('event', filters.eventType);
        }

        if (filters.objectType && filters.objectType !== 'all') {
            params.append('objectType', filters.objectType);
        }

        if (filters.riskLevel && filters.riskLevel !== 'all') {
            params.append('risk', filters.riskLevel);
        }

        if (filters.searchTerm) {
            params.append('search', filters.searchTerm);
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
            objectName: apiLog.targetObject?.username || apiLog.targetObject?.objectName || (apiLog.targetObject as Record<string, unknown>)?.name as string || `${apiLog.objectType}-${apiLog.objectId || 'unknown'}`,
            actor: {
                id: apiLog.actorId,
                name: apiLog.actorName || apiLog.actorId || 'System',
                type: apiLog.actorType,
            },
            target: apiLog.targetObject ? {
                id: apiLog.objectId,
                name: apiLog.targetObject.username || apiLog.targetObject.objectName || (apiLog.targetObject as Record<string, unknown>)?.name as string || apiLog.targetObject.type,
                type: apiLog.targetObject.type,
            } : undefined,
            description: apiLog.details.message || `${apiLog.event} ${apiLog.objectType}`,
            riskLevel: apiLog.risk,
            ipAddress: apiLog.details.ipAddress,
            location: apiLog.details.location,
            userAgent: apiLog.details.userAgent,
            sessionId: undefined, // Not provided in API
            correlationId: undefined, // Not provided in API
            complianceFlags: [], // Not provided in API, could be derived from metadata
            metadata: apiLog.metadata,
            beforeState: Object.keys(apiLog.stateBefore).length > 0 ? apiLog.stateBefore : undefined,
            afterState: Object.keys(apiLog.stateAfter).length > 0 ? apiLog.stateAfter : undefined,
            outcome: apiLog.status,
            errorMessage: apiLog.errorDetails,
            resourceOwner: apiLog.governance.owner,
            department: apiLog.governance.department,
        };
    }

    async getAuditLogs(filters: AuditLogFilters = {}): Promise<TransformedAuditLog[]> {
        try {
            const queryString = this.buildQueryString(filters);
            const endpoint = `/audit-logs${queryString ? `?${queryString}` : ''}`;

            const response = await this.makeRequest(endpoint);

            if (!response.ok) {
                throw new Error(`Failed to fetch audit logs: ${response.status} ${response.statusText}`);
            }

            const data: ApiAuditLog[] = await response.json();

            // Transform the API response to match the UI expectations
            return data.map(log => this.transformAuditLog(log));
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }
    }

    async getAuditLogsPaginated(filters: AuditLogFilters = {}): Promise<{
        logs: TransformedAuditLog[];
        pagination: {
            total: number;
            totalPages: number;
            currentPage: number;
            size: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }> {
        try {
            const queryString = this.buildQueryString(filters);
            const endpoint = `/audit-logs/paginated${queryString ? `?${queryString}` : ''}`;

            const response = await this.makeRequest(endpoint);

            if (!response.ok) {
                throw new Error(`Failed to fetch paginated audit logs: ${response.status} ${response.statusText}`);
            }

            const data: AuditLogResponse = await response.json();

            return {
                logs: data.content.map(log => this.transformAuditLog(log)),
                pagination: {
                    total: data.totalElements,
                    totalPages: data.totalPages,
                    currentPage: data.number,
                    size: data.size,
                    hasNext: !data.last,
                    hasPrev: !data.first,
                },
            };
        } catch (error) {
            console.error('Error fetching paginated audit logs:', error);
            throw error;
        }
    }

    async exportAuditLogs(filters: AuditLogFilters = {}, format: 'csv' | 'json' = 'json'): Promise<Blob> {
        try {
            const queryString = this.buildQueryString({...filters, size: 10000}); // Large size for export
            const endpoint = `/audit-logs/export?format=${format}${queryString ? `&${queryString}` : ''}`;

            const response = await this.makeRequest(endpoint);

            if (!response.ok) {
                throw new Error(`Failed to export audit logs: ${response.status} ${response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error('Error exporting audit logs:', error);
            throw error;
        }
    }
}

export const auditLogsService = new AuditLogsService();
