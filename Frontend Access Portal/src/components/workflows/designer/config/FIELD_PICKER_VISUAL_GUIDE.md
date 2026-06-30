# Field Picker - Visual Guide

## What It Looks Like

### Before (Old Way)
```
┌──────────────────────────────────────┐
│ Field to Check *                     │
├──────────────────────────────────────┤
│ [_________________________]          │  ← User has to guess field names!
│ Use dot notation for nested fields   │
└──────────────────────────────────────┘

❌ Problems:
- Users don't know what fields exist
- Typos cause runtime errors
- No documentation of available data
- Users need to check backend code
```

### After (New Way with Field Picker)
```
┌──────────────────────────────────────────┐
│ Field to Check *                         │
├──────────────────────────────────────────┤
│ [approvalDecision__________] [📋 Browse] │  ← Click Browse button
│ Use dot notation for nested fields       │
└──────────────────────────────────────────┘

                    ↓ Opens Modal ↓

┌─────────────────────────────────────────────────────┐
│ 📊 Select Field from Workflow                   [×] │
├─────────────────────────────────────────────────────┤
│ Choose a field from previous workflow steps         │
│                                                      │
│ 🔍 [Search fields...                            ]   │
│                                                      │
│ Current: approvalDecision                            │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ ✋ User Approval - Step 2                    │    │
│ │ approval.user                         4 fields    │
│ │ ─────────────────────────────────────────── │    │
│ │   • approvalDecision         [string] →     │ ←  │
│ │     Approval decision                       │  Click to
│ │     Example: APPROVED | REJECTED            │  insert!
│ │                                             │    │
│ │   • approvedBy              [string] →      │    │
│ │     ID of approver                          │    │
│ │     Example: user-123                       │    │
│ │                                             │    │
│ │   • comment                 [string] →      │    │
│ │     Approval comment                        │    │
│ │     Example: Looks good                     │    │
│ │                                             │    │
│ │   • approvedAt              [string] →      │    │
│ │     Timestamp of approval                   │    │
│ │     Example: 2025-12-17T10:30:00Z          │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ 🌐 HTTP Request - Step 3                     │    │
│ │ action.http                           4 fields    │
│ │ ─────────────────────────────────────────── │    │
│ │   • httpResponse            [object] →      │    │
│ │     Full HTTP response body                 │    │
│ │     Example: { "status": "success" }        │    │
│ │                                             │    │
│ │   • httpStatusCode          [number] →      │    │
│ │     HTTP status code                        │    │
│ │     Example: 200                            │    │
│ │                                             │    │
│ │   • httpSuccess             [boolean] →     │    │
│ │     Whether request succeeded               │    │
│ │     Example: true                           │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ℹ️ Tip: Fields are populated from nodes that       │
│    execute before this condition.                   │
└─────────────────────────────────────────────────────┘

✅ Benefits:
- See all available fields at a glance
- Know the data type (string, number, boolean, object)
- See example values
- No typos - click to insert
- Self-documenting - no need to check backend code
```

## How It Works (Technical Flow)

```
1. User opens Condition node configuration
                    ↓
2. ConditionIfConfig component renders
                    ↓
3. User clicks "Browse" button
                    ↓
4. Component analyzes workflow graph:
   - Finds current node ID
   - Traverses edges backward
   - Identifies all upstream nodes
                    ↓
5. For each upstream node:
   - Gets node type (e.g., "approval.user")
   - Looks up schema in node-schemas.ts
   - Extracts available fields
                    ↓
6. FieldPicker modal opens showing:
   - All upstream nodes (grouped)
   - Their fields with types/descriptions
   - Search functionality
                    ↓
7. User searches/browses and clicks a field
                    ↓
8. Field name inserted into input
                    ↓
9. Modal closes automatically
                    ↓
10. User continues configuring operator & value
```

## Workflow Graph Example

```
[Manual Trigger]
   roleId: "role-123"
   userId: "user-456"
   tenantId: "tenant-789"
        ↓
[User Approval] ← Step 2
   approvalDecision: "APPROVED"
   approvedBy: "user-101"
   comment: "Looks good"
        ↓
[Condition: If/Else] ← YOU ARE HERE (configuring this node)
        ↓ ↓
     TRUE FALSE
        ↓    ↓
[HTTP: Activate] [HTTP: Delete]

When configuring the Condition node, Field Picker shows:
✅ Manual Trigger fields (roleId, userId, tenantId)
✅ User Approval fields (approvalDecision, approvedBy, comment)
❌ HTTP Request fields (not shown - these execute AFTER the condition)
```

## Search Feature Demo

```
Initial view shows all fields:
┌─────────────────────────────┐
│ 🔍 [Search fields...       ]│
│                              │
│ • approvalDecision          │
│ • approvedBy                │
│ • comment                   │
│ • approvedAt                │
│ • httpResponse              │
│ • httpStatusCode            │
│ • httpSuccess               │
│ • httpHeaders               │
└─────────────────────────────┘

User types "status":
┌─────────────────────────────┐
│ 🔍 [status____________     ]│
│                              │
│ • httpStatusCode            │  ← Only matching fields
│ • httpSuccess               │     shown
└─────────────────────────────┘

User types "approval":
┌─────────────────────────────┐
│ 🔍 [approval___________    ]│
│                              │
│ • approvalDecision          │  ← Searches in field name
│ • approvedBy                │     and description
│ • approvedAt                │
└─────────────────────────────┘
```

## Real-World Usage Examples

### Example 1: Approval Workflow
```
Configuration:
- Field: approvalDecision (selected from picker)
- Operator: Equals (==)
- Value: APPROVED
- True Branch: "Activate Role"
- False Branch: "Reject Request"

Result: When approval decision is APPROVED, activate role.
Otherwise, reject the request.
```

### Example 2: HTTP Status Check
```
Configuration:
- Field: httpStatusCode (selected from picker)
- Operator: Equals (==)
- Value: 200
- True Branch: "Success Path"
- False Branch: "Error Handler"

Result: When HTTP returns 200, proceed with success path.
Otherwise, handle error.
```

### Example 3: Risk-Based Routing
```
Configuration:
- Field: riskScore (from risk calculation node)
- Operator: Greater Than (>)
- Value: 7
- True Branch: "Require Manager Approval"
- False Branch: "Auto-Approve"

Result: High risk (>7) requires manager approval.
Low risk is auto-approved.
```

### Example 4: Nested Fields
```
Configuration:
- Field: response.data.userId (typed or selected from nested picker)
- Operator: Exists
- True Branch: "User Found"
- False Branch: "Create New User"

Result: Check if user exists in API response.
```

## Comparison with Industry Tools

| Feature                    | Zapier | n8n | Power Automate | Our Tool |
|----------------------------|--------|-----|----------------|----------|
| Field Browser              | ✅     | ✅  | ✅             | ✅       |
| Type Information           | ❌     | ✅  | ❌             | ✅       |
| Examples                   | ❌     | ❌  | ❌             | ✅       |
| Search/Filter              | ✅     | ✅  | ✅             | ✅       |
| Workflow-Aware             | ✅     | ✅  | ✅             | ✅       |
| Descriptions               | ❌     | ⚠️  | ⚠️             | ✅       |
| Grouped by Source          | ✅     | ✅  | ✅             | ✅       |
| Click to Insert            | ✅     | ✅  | ✅             | ✅       |
| Nested Field Support       | ✅     | ✅  | ⚠️             | ✅       |
| Real-time Value Preview    | ❌     | ✅  | ❌             | 🔜       |
| Modal (Clean UI)           | ❌     | ❌  | ❌             | ✅       |

Legend: ✅ Full Support | ⚠️ Partial Support | ❌ Not Supported | 🔜 Planned

## Key Advantages

1. **Production-Ready**: Enterprise-grade UI/UX matching industry leaders
2. **Type-Safe**: TypeScript ensures schema correctness
3. **Self-Documenting**: No external documentation needed
4. **Error Prevention**: Users can't mistype field names
5. **Discoverable**: Users learn what data is available
6. **Scalable**: Works with simple and complex workflows
7. **Maintainable**: Easy to add new node types
8. **Accessible**: Keyboard navigation and screen reader support
