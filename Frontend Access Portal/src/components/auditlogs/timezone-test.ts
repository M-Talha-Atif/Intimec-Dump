/**
 * Simple Timezone Conversion Test
 * 
 * This demonstrates how timestamps are automatically converted to the user's local timezone.
 * 
 * Example:
 * - UTC timestamp from server: "2024-07-21T14:30:45.123Z"
 * - User in New York (UTC-4): displays as "07/21/2024, 10:30:45"
 * - User in London (UTC+1): displays as "07/21/2024, 15:30:45"  
 * - User in Tokyo (UTC+9): displays as "07/21/2024, 23:30:45"
 * 
 * The browser automatically handles the timezone conversion using toLocaleString()
 * with the user's system timezone settings.
 */

import { formatTimestamp } from "./audit-log-utils";

// Test function to demonstrate timezone conversion
export function testTimezoneConversion() {
  const utcTimestamp = "2024-07-21T14:30:45.123Z";
  
  console.log("=== Simple Timezone Conversion Test ===");
  console.log("UTC Timestamp:", utcTimestamp);
  console.log("User's Local Time:", formatTimestamp(utcTimestamp));
  console.log("User's Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Show what happens with different timestamps
  const timestamps = [
    "2024-07-21T00:00:00.000Z", // Midnight UTC
    "2024-07-21T12:00:00.000Z", // Noon UTC  
    "2024-07-21T23:59:59.999Z", // End of day UTC
  ];
  
  console.log("\n=== Sample Conversions ===");
  timestamps.forEach(ts => {
    console.log(`${ts} -> ${formatTimestamp(ts)}`);
  });
}

// Uncomment the line below to run the test in browser console
// testTimezoneConversion();
