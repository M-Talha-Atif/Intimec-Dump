import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { IdentityType } from "../data/identity-mapping";
import { AuditEntry, RawAuditLog, MappingDetail, CorrelationCondition } from "../data/audit-trail";
import {
  filterAuditEntries,
  getUniqueUsers,
  exportToCSV,
} from "../utils/audit-trail-utils";
import { fetchApplications } from "../utils/mappingUtils";

// ─── helpers to extract meaning from stateAfter payloads ──────────────────────

/**
 * Flat AttributeMappingDTO shape — what IdentityMappingPolicyDTO.attributeMappings[] actually contains.
 * { id, sourceResourceId, sourceAttributeName, targetAttributeName, mode, script }
 */
interface AttrMappingDto {
  id?: string;
  sourceResourceId?: string;
  sourceAttributeName?: string;
  targetAttributeName?: string;
  mode?: string;
  script?: { data?: string; lang?: string };
}

/** CorrelationRuleDTO shape from backend */
interface CorrelationRuleDto {
  id?: string;
  resourceId?: string;
  mode?: string;
  ruleGroup?: {
    combinator?: string;
    rules?: Array<{ field?: string; operator?: string; value?: string }>;
  };
}

function extractAttributeMappingDetails(payload: unknown): MappingDetail[] {
  if (!payload || !Array.isArray(payload)) return [];
  const dtos = payload as AttrMappingDto[];
  return dtos.map((d) => {
    const modeUpper = d.mode?.toUpperCase();
    // Treat "DIRECT", "DEFAULT", or absent as no transformation (show as plain "Direct" text)
    const hasTransformation = modeUpper && modeUpper !== "DIRECT" && modeUpper !== "DEFAULT" && modeUpper !== "NONE";
    return {
      identity: d.targetAttributeName || "—",
      source: d.sourceAttributeName || "—",
      transformation: hasTransformation ? d.mode : undefined,
      sourceApp: d.sourceResourceId,
    };
  });
}

function extractCorrelationDetails(payload: unknown): CorrelationCondition[] {
  if (!payload || !Array.isArray(payload)) return [];
  const rules = payload as CorrelationRuleDto[];
  const result: CorrelationCondition[] = [];
  for (const r of rules) {
    for (const cond of r.ruleGroup?.rules || []) {
      result.push({
        field: cond.field || "—",
        operator: cond.operator || "=",
        value: cond.value || "—",
      });
    }
  }
  return result;
}

function buildMappingSummary(objectType: string, stateAfter: unknown): string {
  const isAttr = objectType?.toLowerCase().includes("attribute");
  if (isAttr) {
    const dtos = Array.isArray(stateAfter) ? (stateAfter as AttrMappingDto[]) : [];
    const targets = [...new Set(dtos.map((d) => d.targetAttributeName).filter(Boolean))];
    if (targets.length === 0) return "Attribute Mapping";
    if (targets.length === 1) return targets[0]!;
    if (targets.length <= 3) return targets.join(", ");
    return `${targets.slice(0, 2).join(", ")} +${targets.length - 2} more`;
  } else {
    const rules = Array.isArray(stateAfter) ? (stateAfter as CorrelationRuleDto[]) : [];
    const conditions = rules.flatMap((r) => r.ruleGroup?.rules || []);
    if (conditions.length === 0) return "Correlation Rule";
    const firstCond = conditions[0];
    const label = firstCond.field ? `${firstCond.field} ${firstCond.operator || "="} ${firstCond.value}` : "Correlation Rule";
    return conditions.length > 1 ? `${label} (+${conditions.length - 1})` : label;
  }
}

function buildChangeSummary(
  objectType: string,
  stateBefore: unknown,
  stateAfter: unknown
): string {
  const isAttr = objectType?.toLowerCase().includes("attribute");

  if (isAttr) {
    const before = Array.isArray(stateBefore) ? (stateBefore as AttrMappingDto[]) : [];
    const after = Array.isArray(stateAfter) ? (stateAfter as AttrMappingDto[]) : [];

    if (before.length === 0 && after.length > 0) {
      const targets = [...new Set(after.map((d) => d.targetAttributeName).filter(Boolean))];
      return `Configured ${after.length} attribute mapping${after.length > 1 ? "s" : ""}${targets.length > 0 ? `: ${targets.slice(0, 3).join(", ")}${targets.length > 3 ? ` +${targets.length - 3} more` : ""}` : ""}`;
    }

    const changes: string[] = [];
    for (const afterDto of after) {
      const beforeDto = before.find(
        (b) => b.targetAttributeName === afterDto.targetAttributeName &&
               b.sourceResourceId === afterDto.sourceResourceId
      );
      if (!beforeDto) {
        changes.push(`Added mapping for "${afterDto.targetAttributeName}"`);
      } else if (beforeDto.mode !== afterDto.mode) {
        changes.push(`"${afterDto.targetAttributeName}" transformation: ${beforeDto.mode?.toLowerCase() || "direct"} → ${afterDto.mode?.toLowerCase() || "direct"}`);
      } else if (beforeDto.sourceAttributeName !== afterDto.sourceAttributeName) {
        changes.push(`"${afterDto.targetAttributeName}" source: ${beforeDto.sourceAttributeName} → ${afterDto.sourceAttributeName}`);
      }
    }
    const removed = before.filter(
      (b) => !after.find(
        (a) => a.targetAttributeName === b.targetAttributeName && a.sourceResourceId === b.sourceResourceId
      )
    );
    for (const r of removed) changes.push(`Removed mapping for "${r.targetAttributeName}"`);

    if (changes.length === 0) {
      const withTransforms = after.filter((d) => d.mode && d.mode.toUpperCase() !== "DIRECT").length;
      return `Saved ${after.length} attribute mapping${after.length !== 1 ? "s" : ""}${withTransforms > 0 ? `, ${withTransforms} with transformation${withTransforms !== 1 ? "s" : ""}` : ""}`;
    }
    return changes.slice(0, 3).join("; ") + (changes.length > 3 ? ` +${changes.length - 3} more` : "");
  } else {
    const before = Array.isArray(stateBefore) ? (stateBefore as CorrelationRuleDto[]) : [];
    const after = Array.isArray(stateAfter) ? (stateAfter as CorrelationRuleDto[]) : [];
    const afterConditions = after.flatMap((r) => r.ruleGroup?.rules || []);
    const beforeConditions = before.flatMap((r) => r.ruleGroup?.rules || []);

    if (before.length === 0) {
      return `Defined ${afterConditions.length} correlation condition${afterConditions.length !== 1 ? "s" : ""} across ${after.length} rule${after.length !== 1 ? "s" : ""}`;
    }
    if (afterConditions.length !== beforeConditions.length) {
      const delta = afterConditions.length - beforeConditions.length;
      return `${delta > 0 ? "Added" : "Removed"} ${Math.abs(delta)} correlation condition${Math.abs(delta) !== 1 ? "s" : ""}`;
    }
    return `Updated ${afterConditions.length} correlation condition${afterConditions.length !== 1 ? "s" : ""}`;
  }
}

const mapEventToAction = (event?: string): AuditEntry["action"] => {
  if (!event) return "UPDATE";
  const e = event.toUpperCase();
  if (e.includes("CREATE") || e.includes("ADD")) return "CREATE";
  if (e.includes("DELETE") || e.includes("REMOVE")) return "DELETE";
  if (e.includes("SYNC")) return "SYNC";
  if (e.includes("BULK")) return "BULK_UPDATE";
  return "UPDATE";
};

const transformAuditLog = (log: RawAuditLog, identityType: IdentityType, appNameMap: Map<string, string>): AuditEntry => {
  const isAttr = (log.objectType || "").toLowerCase().includes("attribute");
  const afterPayload = log.stateAfter;
  const beforePayload = log.stateBefore;

  const mappingSummary = buildMappingSummary(log.objectType || "", afterPayload);
  const changeSummary = buildChangeSummary(log.objectType || "", beforePayload, afterPayload);

  const afterDetails = isAttr
    ? extractAttributeMappingDetails(afterPayload)
    : extractCorrelationDetails(afterPayload);
  const beforeDetails = isAttr
    ? extractAttributeMappingDetails(beforePayload)
    : extractCorrelationDetails(beforePayload);

  // Impact = number of distinct attributes/conditions saved
  const impact = isAttr
    ? (Array.isArray(afterPayload) ? (afterPayload as AttrMappingDto[]).length : 0)
    : (Array.isArray(afterPayload) ? (afterPayload as CorrelationRuleDto[]).flatMap((r) => r.ruleGroup?.rules || []).length : 0);

  // Source system: resolve the UUID to a human-readable app name when available
  const firstSource = isAttr
    ? (Array.isArray(afterPayload) ? (afterPayload as AttrMappingDto[])[0]?.sourceResourceId : undefined)
    : (Array.isArray(afterPayload) ? (afterPayload as CorrelationRuleDto[])[0]?.resourceId : undefined);
  const sourceSystem = (firstSource && appNameMap.get(firstSource))
    || firstSource
    || (log.metadata as Record<string, string>)?.sourceSystem
    || "System";

  return {
    id: log.id,
    timestamp: log.timestamp || new Date().toISOString(),
    action: mapEventToAction(log.event),
    user: log.actorName || "System",
    userRole: log.actorType === "system" ? "Automated Process" : (log.actorType || "IAM Administrator"),
    mapping: mappingSummary,
    changes: changeSummary,
    sourceSystem,
    identityType,
    impact,
    details: changeSummary,
    rawEntry: log,
    stateBefore: beforeDetails,
    stateAfter: afterDetails,
    entryType: log.objectType || "Identity Mapping",
  };
};

export const useAuditTrail = (identityType: IdentityType) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  // Map of applicationId (UUID) → display name for source column
  const [appNameMap, setAppNameMap] = useState<Map<string, string>>(new Map());

  // Load app names once on mount so source UUIDs are replaced with human-readable names
  useEffect(() => {
    fetchApplications()
      .then((apps) => setAppNameMap(new Map(apps.map((a) => [a.id, a.name]))))
      .catch(() => { /* silently ignore — UUIDs are still shown as fallback */ });
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("size", "100");
      params.set("objectType", "Identity Mapping,Attribute Mapping,Correlation Rule");

      if (timeFilter !== "all") {
        const now = new Date();
        const hoursMap: Record<string, number> = { "1h": 1, "24h": 24, "7d": 168, "30d": 720 };
        const hours = hoursMap[timeFilter];
        if (hours) {
          const from = new Date(now.getTime() - hours * 60 * 60 * 1000);
          params.set("dateFrom", from.toISOString());
        }
      }

      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!response.ok) throw new Error(`Failed to fetch audit logs: ${response.status}`);

      const data = await response.json();
      const logs: RawAuditLog[] = data.logs?.content || data.content || (Array.isArray(data) ? data : []);
      const entries = logs.map((log) => transformAuditLog(log, identityType, appNameMap));
      setAuditEntries(entries);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      toast.error("Failed to load audit trail", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setAuditEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [identityType, timeFilter, appNameMap]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredEntries = filterAuditEntries(
    auditEntries,
    searchTerm,
    actionFilter,
    userFilter
  );

  const uniqueUsers = getUniqueUsers(auditEntries);

  const viewDetails = (entry: AuditEntry) => {
    setSelectedEntry(entry);
  };

  const closeDetails = () => setSelectedEntry(null);

  const handleExport = () => {
    const exportedCount = exportToCSV(filteredEntries, identityType);
    toast.success("Export Complete", {
      description: `Audit trail exported with ${exportedCount} entries.`,
    });
  };

  return {
    searchTerm,
    timeFilter,
    actionFilter,
    userFilter,
    auditEntries,
    filteredEntries,
    uniqueUsers,
    isLoading,
    selectedEntry,
    setSearchTerm,
    setTimeFilter,
    setActionFilter,
    setUserFilter,
    viewDetails,
    closeDetails,
    handleExport,
    refreshAuditLogs: fetchAuditLogs,
  };
};
