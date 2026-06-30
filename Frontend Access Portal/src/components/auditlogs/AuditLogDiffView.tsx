"use client";

import { normalizeTimestampsInObject } from "@/utils/timestamp-utils";

interface AuditLogDiffViewProps {
  beforeState: unknown;
  afterState: unknown;
}

type DiffEntry =
  | { key: string; type: "changed"; before: unknown; after: unknown }
  | { key: string; type: "added"; after: unknown }
  | { key: string; type: "removed"; before: unknown };

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function computeFieldDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const inBefore = key in before;
    const inAfter = key in after;

    if (inBefore && inAfter) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        entries.push({ key, type: "changed", before: before[key], after: after[key] });
      }
      // identical — skip
    } else if (!inBefore && inAfter) {
      entries.push({ key, type: "added", after: after[key] });
    } else if (inBefore && !inAfter) {
      entries.push({ key, type: "removed", before: before[key] });
    }
  }

  return entries;
}

export function AuditLogDiffView({ beforeState, afterState }: AuditLogDiffViewProps) {
  if (!beforeState && !afterState) return null;

  const before = normalizeTimestampsInObject(beforeState ?? {}) as Record<string, unknown>;
  const after = normalizeTimestampsInObject(afterState ?? {}) as Record<string, unknown>;
  const entries = computeFieldDiff(before, after);

  if (entries.length === 0) {
    return (
      <div className="rounded border bg-gray-50 dark:bg-black overflow-hidden w-full">
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b">
          <h5 className="font-medium text-sm">Changes</h5>
        </div>
        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
          No field changes detected.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded border bg-gray-50 dark:bg-black overflow-hidden w-full">
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 border-b">
        <h5 className="font-medium text-sm">
          Changes ({entries.length} field{entries.length !== 1 ? "s" : ""})
        </h5>
      </div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-1.5 text-left font-medium w-1/4">Field</th>
              <th className="px-3 py-1.5 text-left font-medium w-[37.5%]">Before</th>
              <th className="px-3 py-1.5 text-left font-medium w-[37.5%]">After</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-3 py-1.5 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap align-top">
                  {entry.key}
                </td>
                <td className="px-3 py-1.5 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 break-all align-top">
                  {entry.type === "added"
                    ? <span className="italic text-gray-400">—</span>
                    : formatValue((entry as { before: unknown }).before)}
                </td>
                <td className="px-3 py-1.5 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 break-all align-top">
                  {entry.type === "removed"
                    ? <span className="italic text-gray-400">—</span>
                    : formatValue((entry as { after: unknown }).after)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
