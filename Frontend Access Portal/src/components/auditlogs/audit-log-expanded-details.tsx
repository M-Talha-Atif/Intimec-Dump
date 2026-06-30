"use client";

import type { TransformedAuditLog } from "@/types/audit-logs";
import { AuditLogDiffView } from "./AuditLogDiffView";
import { normalizeTimestampsInObject } from "@/utils/timestamp-utils";

interface AuditLogExpandedDetailsProps {
  log: TransformedAuditLog;
}

export function AuditLogExpandedDetails({ log }: AuditLogExpandedDetailsProps) {
  // Process metadata to convert any timestamp fields
  const processedMetadata = normalizeTimestampsInObject(log.metadata);
  console.log("processedMetadata" , processedMetadata);
  console.log("log" , log);
  return (
    <div className="p-4 space-y-4 dark:bg-black">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">Event Details</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">Description:</span>{" "}
              <span className="break-words">{log.description}</span>
            </div>
            {log.sessionId && (
              <div>
                <span className="font-medium">Session ID:</span> <span className="break-all">{log.sessionId}</span>
              </div>
            )}
            {log.ipAddress && (
              <div>
                <span className="font-medium">IP Address:</span> {log.ipAddress}
              </div>
            )}
            {log.location && log.location !== 'null' && (
              <div>
                <span className="font-medium">Location:</span> {log.location}
              </div>
            )}
            {log.userAgent && (
              <div>
                <span className="font-medium">User agent:</span> <span className="break-all">{log.userAgent}</span>
              </div>
            )}
            {log.correlationId && (
              <div>
                <span className="font-medium">Correlation ID:</span>{" "}
                <span className="break-all">{log.correlationId}</span>
              </div>
            )}
          </div>
        </div>

        {log.target && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Target Object</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Name:</span> <span className="break-words">{log.target.name}</span>
              </div>
              <div>
                <span className="font-medium">Type:</span> {log.target.type}
              </div>
              {log.target.id && (
                <div>
                  <span className="font-medium">ID:</span> <span className="break-all font-mono text-xs">{log.target.id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-sm mb-2">Governance</h4>
          <div className="space-y-1 text-sm">
            {log.resourceOwner && (
              <div>
                <span className="font-medium">Owner:</span> {log.resourceOwner}
              </div>
            )}
            {log.department && (
              <div>
                <span className="font-medium">Department:</span>{" "}
                {log.department}
              </div>
            )}
            <div>
              <span className="font-medium">Risk Level:</span> {log.riskLevel}
            </div>
          </div>
        </div>
      </div>

      {(log.beforeState || log.afterState) && (
        <div>
          <h4 className="font-semibold text-sm mb-2">State Changes</h4>
          <div className="flex">
            {(log.beforeState || log.afterState) && (
              <AuditLogDiffView
                beforeState={log.beforeState}
                afterState={log.afterState}
              />
            )}
          </div>
        </div>
      )}

      {log.errorMessage && (
        <div>
          <h4 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">
            Error Details
          </h4>
          <div className="bg-red-50 dark:bg-red-800 border border-red-200 p-3 rounded text-sm text-black dark:text-white whitespace-pre-wrap">
            {log.errorMessage}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-sm mb-2">Full Metadata</h4>
        <pre className="bg-secondary p-3 rounded text-xs overflow-auto max-h-32">
          {JSON.stringify(processedMetadata, null, 2)}
        </pre>
      </div>
    </div>
  );
}
