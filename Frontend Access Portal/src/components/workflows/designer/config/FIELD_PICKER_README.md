# Field Picker - Production-Ready Implementation

## Overview
The Field Picker is a workflow-aware component that allows users to browse and select fields from previous workflow nodes when configuring condition nodes. This eliminates the need for users to know backend code or guess field names.

## Features

### 1. Workflow-Aware Context
- **Upstream Node Detection**: Automatically identifies all nodes that execute before the current condition node
- **Graph Traversal**: Uses workflow edges to build a proper dependency graph
- **Smart Filtering**: Only shows fields from nodes that will have executed by the time the condition runs

### 2. Rich Field Schema
- **Type Information**: Shows data type for each field (string, number, boolean, object, array)
- **Descriptions**: Clear explanations of what each field contains
- **Examples**: Sample values to help users understand the data format
- **Icons**: Visual indicators for different node types

### 3. Search & Discovery
- **Real-time Search**: Filter fields by name, description, or source node
- **Grouped Display**: Fields organized by source node for easy navigation
- **Current Value Indicator**: Shows the currently selected field for reference

### 4. Node Output Schemas
Pre-defined schemas for all node types:

#### Trigger Nodes
- `trigger.manual`: roleId, userId, tenantId, requestedBy

#### Approval Nodes
- `approval.user`: approvalDecision, approvedBy, comment, approvedAt
- `approval.role`: approvalDecision, approvedBy, approverRole, comment, approvedAt

#### Action Nodes
- `action.http`: httpResponse, httpStatusCode, httpSuccess, httpHeaders

#### Condition Nodes
- `condition.if`: conditionMet, evaluatedValue, evaluatedField
- `condition.switch`: selectedBranch, evaluatedValue

#### Delay Nodes
- `delay.wait`: delayStarted, delayCompleted, delayDuration

## Implementation

### Architecture
```
CanvasDesigner.tsx
    ↓ (passes nodes & edges)
NodePropertiesPanel.tsx
    ↓ (passes nodes, edges, currentNodeId)
NodeConfigPanels.tsx (ConditionIfConfig)
    ↓ (analyzes workflow graph)
FieldPicker.tsx
    ↓ (reads schemas)
node-schemas.ts
```

### Files Created
1. **node-schemas.ts**: Schema definitions for all node output types
2. **FieldPicker.tsx**: React component for field selection UI
3. **NodeConfigPanels.tsx**: Updated to use FieldPicker

### Files Modified
1. **NodePropertiesPanel.tsx**: Added nodes/edges props
2. **CanvasDesigner.tsx**: Pass nodes/edges to properties panel

## Usage

### For Workflow Users

1. **Open Condition Node Configuration**
   - Drag an "If/Else Branch" node onto the canvas
   - Click the node to open configuration panel

2. **Browse Available Fields**
   - In the "Field to Check" section, click the "Browse" button
   - A modal opens showing all fields from previous nodes

3. **Search & Select**
   - Use the search bar to filter fields by name
   - Click any field to insert it into the condition
   - The modal closes automatically

4. **Complete Configuration**
   - Select an operator (equals, contains, greaterThan, etc.)
   - Enter the value to compare against
   - Configure branch labels

### For Developers

#### Adding New Node Types
Edit `node-schemas.ts`:

```typescript
export const NODE_OUTPUT_SCHEMAS: NodeOutputSchema[] = [
  // ... existing schemas
  {
    nodeType: 'action.custom',
    displayName: 'Custom Action',
    icon: '⚡',
    fields: [
      { 
        name: 'customField', 
        type: 'string', 
        description: 'Description of field',
        example: 'sample-value'
      },
    ],
  },
];
```

#### Extending the Field Picker
The `FieldPicker` component accepts these props:

```typescript
interface FieldPickerProps {
  open: boolean;                    // Modal open state
  onOpenChange: (open: boolean) => void;  // Open state handler
  onSelectField: (fieldPath: string) => void;  // Field selection callback
  upstreamNodes: Array<{           // Nodes that execute before current
    id: string;
    type: string;
    label: string;
  }>;
  currentValue?: string;            // Currently selected field
}
```

## Industry Comparison

### Zapier
- ✅ Dynamic content dropdown
- ✅ Grouped by step
- ✅ Search functionality
- ❌ No type information

### n8n
- ✅ Expression editor with autocomplete
- ✅ Real-time value preview (requires test execution)
- ✅ Nested field support
- ❌ Steeper learning curve

### Microsoft Power Automate
- ✅ "Dynamic Content" sidebar
- ✅ Grouped by action
- ✅ Click to insert
- ❌ Clutters UI

### Our Implementation
- ✅ Modal-based (clean UI)
- ✅ Workflow-aware (only upstream nodes)
- ✅ Type information
- ✅ Search & filter
- ✅ Examples & descriptions
- ✅ Supports nested fields (dot notation)

## Benefits

### User Experience
- **No Guesswork**: Users see exactly what fields are available
- **Self-Documenting**: Descriptions and examples provide context
- **Error Prevention**: Type information helps users make correct choices
- **Fast Discovery**: Search finds fields quickly in complex workflows

### Developer Experience
- **Easy Extension**: Add new node types by updating one file
- **Type-Safe**: TypeScript interfaces ensure schema correctness
- **Maintainable**: Clear separation between schemas and UI
- **Reusable**: Field picker can be used in other components (HTTP body, notifications, etc.)

### Production Readiness
- **Scalable**: Handles workflows with many nodes efficiently
- **Performant**: useMemo prevents unnecessary recalculations
- **Accessible**: Keyboard navigation and screen reader support
- **Error Handling**: Gracefully handles missing schemas

## Future Enhancements

1. **Value Preview**: Show actual values when workflow is tested
2. **Autocomplete**: Inline autocomplete instead of modal
3. **Smart Suggestions**: Suggest fields based on operator type
4. **Nested Field Builder**: Visual UI for complex dot notation paths
5. **Custom Field Registry**: Allow users to document custom context fields
6. **Expression Builder**: Support for complex expressions like `{{user.firstName}} {{user.lastName}}`

## Testing

### Manual Testing Steps
1. Create workflow with approval node followed by condition node
2. Configure condition and click "Browse" button
3. Verify approval node fields appear (approvalDecision, approvedBy, etc.)
4. Search for "approval" and verify filtering works
5. Click a field and verify it populates the input
6. Add HTTP node before condition
7. Verify both approval and HTTP fields appear

### Test Cases
- Empty workflow (no upstream nodes)
- Single upstream node
- Multiple upstream nodes
- Branching workflow (parallel paths)
- Nested fields with dot notation
- Search with no results
- Search with multiple matches

## Documentation

See also:
- [Node Output Schemas](./node-schemas.ts) - Complete schema definitions
- [Condition Node Guide](../../docs/WORKFLOW_TEMPLATES.md) - Using conditions in workflows
- [Variable Substitution](../../docs/WORKFLOW_TEMPLATES.md#variable-substitution) - Template syntax
