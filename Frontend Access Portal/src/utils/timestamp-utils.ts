/**
 * Comprehensive timestamp formatting utilities for handling various timestamp formats
 * throughout the application, including audit logs, user data, and other entities.
 */

export type TimestampValue = string | number | null | undefined;

/**
 * Detects if a value is a timestamp (either epoch or ISO string)
 */
export function isTimestamp(value: unknown): value is TimestampValue {
  if (value === null || value === undefined) return false;

  if (typeof value === "number") {
    // Check if it's a reasonable timestamp (between 1970 and 2100)
    return value > 0 && value < 4102444800000; // January 1, 2100
  }

  if (typeof value === "string") {
    // Check if it's a numeric string (epoch)
    if (/^\d+$/.test(value)) {
      const num = parseInt(value);
      return num > 0 && num < 4102444800000;
    }

    // Check if it's an ISO string
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(value) || !isNaN(Date.parse(value));
  }

  return false;
}

/**
 * Converts any timestamp format to a Date object
 */
export function parseTimestamp(timestamp: TimestampValue): Date | null {
  if (!timestamp) return null;

  let date: Date;

  if (typeof timestamp === "number") {
    date = new Date(timestamp);
  } else if (typeof timestamp === "string") {
    if (/^\d+$/.test(timestamp)) {
      // If it's a numeric string, treat as epoch
      date = new Date(parseInt(timestamp));
    } else {
      // Otherwise treat as ISO string
      date = new Date(timestamp);
    }
  } else {
    return null;
  }

  // Validate the date
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a timestamp to user's local time with customizable options
 */
export function formatTimestampToLocal(
  timestamp: TimestampValue,
  options?: {
    includeSeconds?: boolean;
    use12Hour?: boolean;
    dateStyle?: "short" | "medium" | "long" | "full";
    timeStyle?: "short" | "medium" | "long" | "full";
    locale?: string;
  }
): string {
  const date = parseTimestamp(timestamp);

  if (!date) return "Invalid Date";

  const defaultOptions = {
    includeSeconds: true,
    use12Hour: false,
    dateStyle: "medium" as const,
    timeStyle: "medium" as const,
    locale: undefined,
  };

  const config = { ...defaultOptions, ...options };

  if (config.dateStyle && config.timeStyle) {
    return date.toLocaleString(config.locale, {
      dateStyle: config.dateStyle,
      timeStyle: config.timeStyle,
    });
  }

  // Custom formatting
  return date.toLocaleString(config.locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(config.includeSeconds && { second: "2-digit" }),
    hour12: config.use12Hour,
  });
}

/**
 * Formats a timestamp in a compact format (for tables, lists, etc.)
 */
export function formatTimestampCompact(timestamp: TimestampValue): string {
  return formatTimestampToLocal(timestamp, {
    includeSeconds: false,
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Formats a timestamp in a detailed format (for expanded views, details, etc.)
 */
export function formatTimestampDetailed(timestamp: TimestampValue): string {
  return formatTimestampToLocal(timestamp, {
    includeSeconds: true,
    dateStyle: "full",
    timeStyle: "long",
  });
}

/**
 * Recursively processes an object and converts all timestamp fields to local time
 * This is useful for processing API responses that may contain mixed timestamp formats
 */
export function normalizeTimestampsInObject<T>(
  obj: T,
  timestampFields: string[] = [
    "timestamp",
    "createdAt",
    "updatedAt",
    "lastModified",
    "lastLoginAt",
    "lastAccess",
    "expiresAt",
    "validFrom",
    "validTo",
    "date",
    "time",
    "lastPasswordChange",
    "accountCreated",
    "lastSync",
    "provisionedAt",
    "revokedAt",
    "approvedAt",
    "rejectedAt",
    "escalatedAt",
    "deletedAt",
    "activatedAt",
    "deactivatedAt",
    "suspendedAt",
    "expiredAt",
    "issuedAt",
    "notBefore",
    "notAfter",
    "scheduledAt",
    "completedAt",
    "startedAt",
    "endedAt",
    "submittedAt",
    "reviewedAt",
    "certifiedAt",
  ]
): T {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      normalizeTimestampsInObject(item, timestampFields)
    ) as T;
  }

  if (typeof obj === "object") {
    const processed = { ...obj } as Record<string, unknown>;

    for (const [key, value] of Object.entries(processed)) {
      // Check if this field should be treated as a timestamp
      // Match exact field names or fields ending with common timestamp suffixes
      const isTimestampField =
        timestampFields.includes(key) ||
        /At$/.test(key) ||
        /Time$/.test(key) ||
        /Date$/.test(key) ||
        key === "timestamp" ||
        key === "time" ||
        key === "date";

      if (isTimestampField && isTimestamp(value)) {
        processed[key] = formatTimestampToLocal(value as TimestampValue);
      } else if (typeof value === "object") {
        // Recursively process nested objects
        processed[key] = normalizeTimestampsInObject(value, timestampFields);
      }
    }

    return processed as T;
  }

  return obj;
}

/**
 * Gets a relative time string (e.g., "2 hours ago", "Yesterday")
 */
export function getRelativeTime(timestamp: TimestampValue): string {
  const date = parseTimestamp(timestamp);

  if (!date) return "Invalid Date";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return formatTimestampToLocal(timestamp, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
}

/**
 * Formats a duration in a human-readable way (e.g., "1h 30m")
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);

  return parts.join(" ");
}
