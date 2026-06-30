/**
 * Demo component to show timestamp conversion in action
 * This demonstrates how timestamps in state changes are automatically converted
 */

import { normalizeTimestampsInObject } from "@/utils/timestamp-utils";

// Example audit log data with mixed timestamp formats (like your real data)
const exampleAuditData = {
  id: "audit-demo",
  timestamp: "2025-07-31T09:34:49.432009Z",
  eventType: "update",
  description: "Login success for user: imadmin",
  
  // State changes with mixed timestamp formats
  beforeState: {
    lastLoginAt: "2025-07-31T09:34:49.432009Z",  // ISO string
    status: "inactive",
    createdAt: 1753886445879,                     // Epoch number
    metadata: {
      lastAccessTime: "1722326711789",            // Numeric string
      permissions: ["read", "write"]
    }
  },
  
  afterState: {
    lastLoginAt: "2025-07-31T09:38:09.893171700Z", // Updated ISO string  
    status: "active",
    createdAt: 1753886445879,                       // Same epoch number
    updatedAt: 1753886449999,                       // New epoch number
    metadata: {
      lastAccessTime: "2025-07-31T09:38:09.893Z",   // Updated to ISO
      permissions: ["read", "write", "admin"]
    }
  },

  // Schema field example (like your phone_number1 example)
  schemaFieldData: {
    id: "fbb287ee-d331-47af-9968-ee175536e519",
    displayName: "Phone Number1",
    createdAt: 1753886445879,                       // Epoch timestamp
    updatedAt: 1753886445879,                       // Epoch timestamp
    schemaId: "1f5b06aa-16e6-4779-bb49-f7694590b34e",
    systemKey: "phone_number1",
    description: "User's primary contact phone number"
  }
};

export function TimestampConversionDemo() {
  // Process the data (this is what happens automatically in your audit logs)
  const processedData = normalizeTimestampsInObject(exampleAuditData);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Timestamp Conversion Demo</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-red-600">Before (Raw Data)</h3>
          <pre className="bg-red-50 border border-red-200 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(exampleAuditData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-600">After (Processed for Display)</h3>
          <pre className="bg-green-50 border border-green-200 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(processedData, null, 2)}
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">What Gets Converted:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ <code>lastLoginAt</code> - ISO strings converted to local time</li>
          <li>✅ <code>createdAt</code> - Epoch numbers converted to readable format</li>
          <li>✅ <code>updatedAt</code> - New epoch timestamps converted</li>
          <li>✅ <code>lastAccessTime</code> - Numeric strings converted</li>
          <li>✅ Nested timestamps in metadata objects</li>
          <li>✅ All timestamp fields ending with &quot;At&quot;, &quot;Time&quot;, or &quot;Date&quot;</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">Expected Result in Your Audit Logs:</h4>
        <p className="text-sm text-yellow-700">
          When you view audit log state changes, timestamps like <code>1753886445879</code> 
          will display as <code>{new Date(1753886445879).toLocaleString()}</code> (your local time).
          Both ISO strings and epoch timestamps will show in the same consistent format.
        </p>
      </div>
    </div>
  );
}

export default TimestampConversionDemo;
