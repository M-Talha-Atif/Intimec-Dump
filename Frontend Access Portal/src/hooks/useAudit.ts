import { useCallback } from "react";
import { getCurrentUser } from "@/lib/rbac";

export interface AuditLog {
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  reason?: string;
  before?: any;
  after?: any;
  requestId?: string;
  timestamp: string;
}

export const useAudit = () => {
  const user = getCurrentUser();

  const logAction = useCallback(async (log: Omit<AuditLog, "actor" | "timestamp">) => {
    const auditEntry: AuditLog = {
      ...log,
      actor: user.id,
      timestamp: new Date().toISOString(),
    };

    // In production, send to audit service
    // await fetch('/api/audit/log', { method: 'POST', body: JSON.stringify(auditEntry) });
    
    console.log('[AUDIT]', auditEntry);
    return auditEntry;
  }, [user.id]);

  return { logAction };
};
