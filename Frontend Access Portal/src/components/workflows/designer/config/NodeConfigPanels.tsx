import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Info, AlertCircle, Clock, User, Mail, Code, GitBranch, Zap, Loader2, Database, Shield, Users, Key, Settings, ArrowUpCircle, Timer, Bell, Plus, Trash2, ChevronUp, ChevronDown, X, HelpCircle } from 'lucide-react';
import { API_CONFIG, authFetch, handleApiResponse } from '@/config/api';
import { FieldPicker } from './FieldPicker';
import { NODE_OUTPUT_SCHEMAS, FieldDefinition, getEventPayloadSchema, getEventArrayFields, getArrayItemFields, EVENT_PAYLOAD_SCHEMAS } from './node-schemas';

interface ConfigPanelProps {
  data: any;
  onUpdate: (updates: any) => void;
  workflowMetadata?: {
    triggerType?: 'manual' | 'event-based' | 'time-based';
    eventConfig?: {
      services?: string[];
      eventTypes?: string[];
    };
  };
  nodes?: Array<{ id: string; type: string; data: any }>;
  edges?: Array<{ source: string; target: string }>;
  currentNodeId?: string;
}

// API Service for fetching real data
const fetchUsers = async (tenantId?: string): Promise<Array<{ id: string; username: string; email: string; fullName: string; department?: string }>> => {
  try {
    console.log('[fetchUsers] Starting user fetch...');
    // Use Next.js API proxy to avoid CORS issues
    const response = await fetch('/api/users/tenant', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('[fetchUsers] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('[fetchUsers] Failed to fetch users:', response.status, response.statusText);
      const errorText = await response.text().catch(() => 'No error text');
      console.error('[fetchUsers] Error body:', errorText);
      return [];
    }
    
    const data = await response.json() as { 
      users: any[]; 
      totalCount?: number;
      count?: number; 
      tenantId: string;
      success?: boolean;
      message?: string;
    };
    console.log('[fetchUsers] Received data:', data);
    
    // Check if request was successful
    if (data.success === false) {
      console.error('[fetchUsers] API returned error:', data.message);
      return [];
    }
    
    // Handle UsersResponse format from backend
    if (data.users && Array.isArray(data.users)) {
      const mappedUsers = data.users.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        // Backend uses displayName, fallback to firstName + lastName
        fullName: user.displayName || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        department: user.department
      }));
      console.log('[fetchUsers] Successfully mapped', mappedUsers.length, 'users:', mappedUsers);
      return mappedUsers;
    }
    
    console.warn('[fetchUsers] Unexpected response format, no users array found. Data:', data);
    return [];
  } catch (error) {
    console.error('[fetchUsers] Error fetching users:', error);
    if (error instanceof Error) {
      console.error('[fetchUsers] Error details:', error.message, error.stack);
    }
    return [];
  }
};

const fetchIdentities = async (tenantId?: string): Promise<Array<{ id: string; username: string; email: string; fullName: string; type: string }>> => {
  try {
    console.log('[fetchIdentities] Starting identities fetch...');
    // Use Next.js API proxy to avoid CORS issues
    const response = await fetch('/api/users/tenant', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('[fetchIdentities] Failed to fetch identities:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json() as { 
      users: any[]; 
      totalCount?: number;
      count?: number; 
      tenantId: string;
      success?: boolean;
      message?: string;
    };
    console.log('[fetchIdentities] Received data:', data);
    
    // Check if request was successful
    if (data.success === false) {
      console.error('[fetchIdentities] API returned error:', data.message);
      return [];
    }
    
    // Handle UsersResponse format from backend
    if (data.users && Array.isArray(data.users)) {
      const mappedIdentities = data.users.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.displayName || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        type: 'user'
      }));
      console.log('[fetchIdentities] Successfully mapped', mappedIdentities.length, 'identities');
      return mappedIdentities;
    }
    
    console.warn('[fetchIdentities] Unexpected response format');
    return [];
  } catch (error) {
    console.error('[fetchIdentities] Error fetching identities:', error);
    return [];
  }
};

// ==================== TRIGGER NODES ====================

export const TriggerStartConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Trigger Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Employee Onboarding Request"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="What initiates this workflow?"
          rows={3}
        />
      </div>
    </div>
  );
};

export const TriggerEndConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">End Label *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Request Completed"
        />
      </div>
    </div>
  );
};

// ==================== APPROVAL NODES ====================

export const ApprovalSingleConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, workflowMetadata, nodes }) => {
  const [users, setUsers] = React.useState<Array<{ id: string; username: string; email: string; fullName: string; department?: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Trigger type detection
  const isEventTriggered = workflowMetadata?.triggerType === 'event-based';
  
  // Approver source
  const approverSource = data.approverSource || (isEventTriggered ? 'role_owner' : 'static');

  // Get available context variables from ForEach nodes
  const availableContextVars = useMemo(() => {
    if (!nodes) return [];
    const vars: Array<{ name: string; source: string }> = [];
    
    // Get variables from ForEach nodes
    nodes.forEach(node => {
      if (node.data?.stepType === 'control.foreach' && node.data?.itemPropertyMappings) {
        Object.entries(node.data.itemPropertyMappings).forEach(([varName, sourceProp]) => {
          vars.push({
            name: varName,
            source: `${node.data.label || 'ForEach'}: ${sourceProp}`
          });
        });
      }
    });
    
    // Add event payload fields if event-triggered
    if (isEventTriggered) {
      const eventType = workflowMetadata?.eventConfig?.eventTypes?.[0];
      const schema = eventType ? getEventPayloadSchema(eventType) : null;
      if (schema) {
        schema.fields.forEach(f => {
          if (f.name.toLowerCase().includes('id') && !f.name.toLowerCase().includes('tenant')) {
            vars.push({
              name: f.name,
              source: `Event: ${f.description || f.name}`
            });
          }
        });
      }
    }
    
    return vars;
  }, [nodes, isEventTriggered, workflowMetadata]);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
        setLoading(false);
      } catch (error) {
        console.error('[ApprovalSingleConfig] Error in loadUsers:', error);
        setLoading(false);
      }
    };
    loadUsers();
  }, []);
  
  const updateApproverSource = (source: string) => {
    const updates: any = { approverSource: source };
    
    // Clear source-specific fields
    updates.approverResolution = undefined;
    updates.approverType = undefined;
    updates.approverId = undefined;
    updates.approverContextKey = undefined;
    
    switch (source) {
      case 'static':
        break;
      case 'role_owner':
        updates.approverType = 'role_owner';
        break;
      case 'context':
        updates.approverResolution = { strategy: 'context', contextKey: '' };
        break;
      case 'hierarchy':
        updates.approverResolution = { strategy: 'hierarchy', hierarchyType: 'manager', contextKey: 'userId' };
        break;
    }
    
    onUpdate(updates);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Step Name</Label>
        <Input
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Manager Approval"
        />
      </div>

      {/* Approver Source */}
      <div className="space-y-2">
        <Label>Approver Source *</Label>
        <Select
          value={approverSource}
          onValueChange={updateApproverSource}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Specific User</SelectItem>
            <SelectItem value="role_owner">Role Owner (from event)</SelectItem>
            <SelectItem value="context">From Context Variable</SelectItem>
            <SelectItem value="hierarchy">User's Manager (hierarchy)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Static: Select user */}
      {approverSource === 'static' && (
        <div className="space-y-2">
          <Label>Select Approver *</Label>
          {loading ? (
            <div className="flex items-center gap-2 p-2 border rounded">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading users...</span>
            </div>
          ) : (
            <Select
              value={data.approverId || ''}
              onValueChange={(value) => onUpdate({ approverId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select approver" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName} <span className="text-muted-foreground text-xs">({user.email})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      
      {/* Context: Select from available variables */}
      {approverSource === 'context' && (
        <div className="space-y-2">
          <Label>Context Variable *</Label>
          {availableContextVars.length > 0 ? (
            <Select
              value={data.approverContextKey || data.approverResolution?.contextKey || ''}
              onValueChange={(value) => {
                onUpdate({ 
                  approverContextKey: value,
                  approverResolution: { strategy: 'context', contextKey: value }
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                {availableContextVars.map((v) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name} <span className="text-muted-foreground text-xs">({v.source})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={data.approverContextKey || data.approverResolution?.contextKey || ''}
              onChange={(e) => onUpdate({ 
                approverContextKey: e.target.value,
                approverResolution: { strategy: 'context', contextKey: e.target.value }
              })}
              placeholder="Variable name (e.g., managerId)"
            />
          )}
          <p className="text-xs text-muted-foreground">
            Select which variable contains the approver ID
          </p>
        </div>
      )}
      
      {/* Hierarchy: Select type */}
      {approverSource === 'hierarchy' && (
        <div className="space-y-2">
          <Label>Hierarchy Type *</Label>
          <Select
            value={data.approverResolution?.hierarchyType || 'manager'}
            onValueChange={(value) => onUpdate({ 
              approverResolution: { ...data.approverResolution, strategy: 'hierarchy', hierarchyType: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Direct Manager</SelectItem>
              <SelectItem value="department_head">Department Head</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Response deadline */}
      <div className="space-y-2">
        <Label>Response Deadline</Label>
        <Select
          value={String(data.timeoutMinutes || 1440)}
          onValueChange={(value) => onUpdate({ timeoutMinutes: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="240">4 hours</SelectItem>
            <SelectItem value="480">8 hours</SelectItem>
            <SelectItem value="1440">24 hours</SelectItem>
            <SelectItem value="2880">48 hours</SelectItem>
            <SelectItem value="10080">1 week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Email notification */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Email Notification</Label>
          <p className="text-xs text-muted-foreground">Notify approver by email</p>
        </div>
        <Switch
          checked={data.sendEmail === true}
          onCheckedChange={(checked) => onUpdate({ sendEmail: checked })}
        />
      </div>

      {data.sendEmail && (
        <div className="space-y-3 p-3 bg-muted/30 rounded-md">
          <div className="space-y-2">
            <Label className="text-sm">Email Subject</Label>
            <Input
              value={data.emailSubject || ''}
              onChange={(e) => onUpdate({ emailSubject: e.target.value })}
              placeholder="Approval Required: {{workflowName}}"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Email Body</Label>
            <Textarea
              value={data.emailBody || ''}
              onChange={(e) => onUpdate({ emailBody: e.target.value })}
              placeholder="Dear {{approverName}},&#10;&#10;Please review..."
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Escalation */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Auto-Escalation</Label>
          <p className="text-xs text-muted-foreground">Escalate if no response</p>
        </div>
        <Switch
          checked={data.escalation?.enabled === true}
          onCheckedChange={(checked) => onUpdate({ 
            escalation: { 
              ...data.escalation, 
              enabled: checked,
              afterMinutes: data.escalation?.afterMinutes || 720,
              strategy: data.escalation?.strategy || 'hierarchy',
              maxLevels: data.escalation?.maxLevels || 2
            } 
          })}
        />
      </div>

      {data.escalation?.enabled && (
        <div className="space-y-3 p-3 bg-muted/30 rounded-md">
          <div className="space-y-2">
            <Label className="text-sm">Escalate After</Label>
            <Select
              value={String(data.escalation?.afterMinutes || 720)}
              onValueChange={(value) => onUpdate({ 
                escalation: { ...data.escalation, afterMinutes: parseInt(value) }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
                <SelectItem value="720">12 hours</SelectItem>
                <SelectItem value="1440">24 hours</SelectItem>
                <SelectItem value="2880">48 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Escalate To</Label>
            <Select
              value={data.escalation?.strategy || 'hierarchy'}
              onValueChange={(value) => onUpdate({ 
                escalation: { ...data.escalation, strategy: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hierarchy">Approver's Manager</SelectItem>
                <SelectItem value="skip_level">Skip-Level Manager</SelectItem>
                <SelectItem value="department_head">Department Head</SelectItem>
                <SelectItem value="static">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Static escalation - select specific user */}
          {data.escalation?.strategy === 'static' && (
            <div className="space-y-2">
              <Label className="text-sm">Escalation User</Label>
              <Select
                value={data.escalation?.escalateToUserId || ''}
                onValueChange={(value) => onUpdate({ 
                  escalation: { ...data.escalation, escalateToUserId: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user to escalate to" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} <span className="text-muted-foreground text-xs">({user.email})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Max escalation levels for hierarchy */}
          {(data.escalation?.strategy === 'hierarchy' || !data.escalation?.strategy) && (
            <div className="space-y-2">
              <Label className="text-sm">Max Escalation Levels</Label>
              <Select
                value={String(data.escalation?.maxLevels || 2)}
                onValueChange={(value) => onUpdate({ 
                  escalation: { ...data.escalation, maxLevels: parseInt(value) }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 level (direct manager only)</SelectItem>
                  <SelectItem value="2">2 levels</SelectItem>
                  <SelectItem value="3">3 levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ApprovalMultiConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, workflowMetadata }) => {
  const [users, setUsers] = React.useState<Array<{ id: string; username: string; email: string; fullName: string; department?: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const selectedApprovers = data.approvers || [];
  
  // Trigger type detection
  const isEventTriggered = workflowMetadata?.triggerType === 'event-based';
  
  // Approver source: 'static', 'role_owner', 'user_manager_pairs', 'context'
  const approverSource = data.approverSource || (isEventTriggered ? 'role_owner' : 'static');
  const approvalPolicy = data.approvalPolicy || 'ALL';

  React.useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    };
    loadUsers();
  }, []);

  const toggleApprover = (userId: string) => {
    const newApprovers = selectedApprovers.includes(userId)
      ? selectedApprovers.filter((id: string) => id !== userId)
      : [...selectedApprovers, userId];
    onUpdate({ approvers: newApprovers });
  };
  
  // Update approver source
  const updateApproverSource = (source: string) => {
    const updates: any = { 
      approverSource: source,
      approverResolution: undefined,
      approverType: undefined,
      structuredApproversKey: undefined
    };
    
    if (source === 'role_owner') {
      updates.approverType = 'role_owner';
    } else if (source === 'user_manager_pairs') {
      updates.structuredApproversKey = 'managers'; // Default key from access-portal payload
    } else if (source === 'context') {
      updates.approverResolution = { strategy: 'context', contextKey: '' };
    }
    
    onUpdate(updates);
  };

  return (
    <div className="space-y-4">
      {/* Step Name */}
      <div className="space-y-2">
        <Label htmlFor="label">Approval Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Manager Approval"
        />
      </div>
      
      {/* Approver Source */}
      <div className="space-y-2">
        <Label htmlFor="approverSource">Who Should Approve? *</Label>
        <Select value={approverSource} onValueChange={updateApproverSource}>
          <SelectTrigger id="approverSource">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Specific People</SelectItem>
            <SelectItem value="role_owner">Role Owners (from event)</SelectItem>
            <SelectItem value="user_manager_pairs">User-Manager Pairs</SelectItem>
            <SelectItem value="context">Dynamic (from context key)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {approverSource === 'static' && "Select specific users as approvers"}
          {approverSource === 'role_owner' && "Owners from the role event will approve"}
          {approverSource === 'user_manager_pairs' && "Each manager approves for their assigned user - all requests sent at once"}
          {approverSource === 'context' && "Approver IDs from workflow context"}
        </p>
      </div>

      {/* Static: User Selection */}
      {approverSource === 'static' && (
        <div className="space-y-2">
          <Label>Select Approvers *</Label>
          {loading ? (
            <div className="flex items-center gap-2 p-2 border rounded">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`approver-${user.id}`}
                    checked={selectedApprovers.includes(user.id)}
                    onChange={() => toggleApprover(user.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`approver-${user.id}`} className="flex-1 cursor-pointer text-sm">
                    {user.fullName} <span className="text-muted-foreground">({user.email})</span>
                  </label>
                </div>
              ))}
            </div>
          )}
          {selectedApprovers.length > 0 && (
            <p className="text-sm text-muted-foreground">{selectedApprovers.length} selected</p>
          )}
        </div>
      )}
      
      {/* Role Owner Info */}
      {approverSource === 'role_owner' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Approvers will be resolved from role owners in the event payload (ownerIds field).
          </AlertDescription>
        </Alert>
      )}
      
      {/* User-Manager Pairs */}
      {approverSource === 'user_manager_pairs' && (
        <div className="space-y-2">
          <Label htmlFor="structuredApproversKey">Context Key *</Label>
          <Input
            id="structuredApproversKey"
            value={data.structuredApproversKey || 'managers'}
            onChange={(e) => onUpdate({ structuredApproversKey: e.target.value })}
            placeholder="managers"
          />
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <p className="font-medium mb-1">Expected format in event payload:</p>
              <code className="text-xs bg-muted p-1 rounded block">
                {`[{userId, managerId, userName}, ...]`}
              </code>
              <p className="mt-2">Each manager receives an approval request for their specific user. <strong>All requests are sent simultaneously.</strong></p>
              <p className="mt-1">After completion, outputs: <code>approvedUserIds</code> and <code>rejectedUserIds</code></p>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Dynamic Context Key */}
      {approverSource === 'context' && (
        <div className="space-y-2">
          <Label htmlFor="contextKey">Context Key *</Label>
          <Input
            id="contextKey"
            value={data.approverResolution?.contextKey || ''}
            onChange={(e) => onUpdate({ 
              approverResolution: { strategy: 'context', contextKey: e.target.value }
            })}
            placeholder="e.g., approverIds"
          />
          <p className="text-xs text-muted-foreground">
            Key containing array of approver IDs in workflow context
          </p>
        </div>
      )}

      {/* Approval Policy */}
      <div className="space-y-2">
        <Label htmlFor="approvalPolicy">Approval Policy *</Label>
        <Select
          value={approvalPolicy}
          onValueChange={(policy) => {
            const updates: any = { approvalPolicy: policy };
            if (policy === 'THRESHOLD') {
              updates.requiredApprovals = data.requiredApprovals || 2;
            }
            onUpdate(updates);
          }}
        >
          <SelectTrigger id="approvalPolicy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All must approve</SelectItem>
            <SelectItem value="ANY">Any one can approve</SelectItem>
            <SelectItem value="THRESHOLD">N of M required</SelectItem>
            <SelectItem value="FAIL_FAST">First rejection blocks</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {approvalPolicy === 'THRESHOLD' && (
        <div className="space-y-2">
          <Label htmlFor="requiredApprovals">Required Approvals *</Label>
          <Input
            id="requiredApprovals"
            type="number"
            min="1"
            value={data.requiredApprovals || ''}
            onChange={(e) => onUpdate({ requiredApprovals: parseInt(e.target.value) })}
            placeholder="e.g., 2"
          />
        </div>
      )}

      {/* Timeout */}
      <div className="space-y-2">
        <Label htmlFor="timeoutMinutes">Response Deadline</Label>
        <Select
          value={String(data.timeoutMinutes || 1440)}
          onValueChange={(value) => onUpdate({ timeoutMinutes: parseInt(value) })}
        >
          <SelectTrigger id="timeoutMinutes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1440">24 hours</SelectItem>
            <SelectItem value="2880">48 hours</SelectItem>
            <SelectItem value="4320">72 hours</SelectItem>
            <SelectItem value="10080">1 week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Email Notification */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sendEmail">Email Notification</Label>
            <p className="text-xs text-muted-foreground">Send email to approvers</p>
          </div>
          <Switch
            id="sendEmail"
            checked={data.sendEmail === true}
            onCheckedChange={(checked) => onUpdate({ sendEmail: checked })}
          />
        </div>

        {data.sendEmail && (
          <>
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                value={data.emailSubject || ''}
                onChange={(e) => onUpdate({ emailSubject: e.target.value })}
                placeholder="Approval Required: {{workflowName}}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailBody">Body</Label>
              <Textarea
                id="emailBody"
                value={data.emailBody || ''}
                onChange={(e) => onUpdate({ emailBody: e.target.value })}
                placeholder="Please review and approve..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Variables: {'{{workflowName}}, {{requestedBy}}, {{approverName}}, {{targetUserName}}'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Escalation */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-orange-500" />
              Auto-Escalation
            </Label>
            <p className="text-xs text-muted-foreground">Escalate if no response</p>
          </div>
          <Switch
            checked={data.escalation?.enabled === true}
            onCheckedChange={(checked) => onUpdate({ 
              escalation: { 
                enabled: checked,
                afterMinutes: 720,
                strategy: 'hierarchy',
                maxEscalationLevels: 2
              } 
            })}
          />
        </div>

        {data.escalation?.enabled && (
          <div className="space-y-3 pl-4 border-l-2 border-orange-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Escalate After</Label>
                <Select
                  value={String(data.escalation?.afterMinutes || 720)}
                  onValueChange={(value) => onUpdate({ 
                    escalation: { ...data.escalation, afterMinutes: parseInt(value) }
                  })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="720">12 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Levels</Label>
                <Select
                  value={String(data.escalation?.maxEscalationLevels || 2)}
                  onValueChange={(value) => onUpdate({ 
                    escalation: { ...data.escalation, maxEscalationLevels: parseInt(value) }
                  })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ApprovalDynamicConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Approval Step Name</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Dynamic Manager Approval"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resolutionStrategy">Who Should Approve?</Label>
        <Select
          value={data.resolutionStrategy || ''}
          onValueChange={(value) => onUpdate({ resolutionStrategy: value })}
        >
          <SelectTrigger id="resolutionStrategy">
            <SelectValue placeholder="Select approval route..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Employee's Direct Manager</SelectItem>
            <SelectItem value="department-head">Department Head</SelectItem>
            <SelectItem value="skip-level-manager">Skip-Level Manager</SelectItem>
            <SelectItem value="custom-rule">Custom Rule</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeoutMinutes">Response Deadline</Label>
        <Select
          value={String(data.timeoutMinutes || 1440)}
          onValueChange={(value) => onUpdate({ timeoutMinutes: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1440">24 hours</SelectItem>
            <SelectItem value="2880">48 hours</SelectItem>
            <SelectItem value="10080">1 week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sendEmail">Email Notification</Label>
            <p className="text-xs text-muted-foreground">Send custom email to resolved approver</p>
          </div>
          <Switch
            id="sendEmail"
            checked={data.sendEmail === true}
            onCheckedChange={(checked) => onUpdate({ sendEmail: checked })}
          />
        </div>

        {data.sendEmail && (
          <>
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Email Subject *</Label>
              <Input
                id="emailSubject"
                value={data.emailSubject || ''}
                onChange={(e) => onUpdate({ emailSubject: e.target.value })}
                placeholder="e.g., Direct Report Access Request"
              />
              <p className="text-xs text-muted-foreground">
                Variables: {'{{workflowName}}'}, {'{{requestedBy}}'}, {'{{approverName}}'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailBody">Email Body *</Label>
              <Textarea
                id="emailBody"
                value={data.emailBody || ''}
                onChange={(e) => onUpdate({ emailBody: e.target.value })}
                placeholder="Hello,&#10;&#10;Your team member {{requestedBy}} has submitted an access request that requires your approval.&#10;&#10;Workflow: {{workflowName}}&#10;&#10;Please review and take action."
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{{workflowName}}'}, {'{{requestedBy}}'}, {'{{approverName}}'}, {'{{executionId}}'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== CONDITION NODES ====================

// Helper component to show field value dropdown or text input
const FieldValueInput: React.FC<{
  fieldName: string | undefined;
  value: string;
  onChange: (value: string) => void;
}> = ({ fieldName, value, onChange }) => {
  // Get possible values for the selected field
  const fieldInfo = useMemo(() => {
    if (!fieldName) return null;

    // Find the field in all node schemas
    for (const schema of NODE_OUTPUT_SCHEMAS) {
      const field = schema.fields.find(f => f.name === fieldName);
      if (field) {
        return field;
      }
    }
    return null;
  }, [fieldName]);

  // Determine possible values based on field type and examples
  const possibleValues = useMemo(() => {
    if (!fieldInfo) return null;

    // 1. Check if example contains multiple values separated by |
    if (fieldInfo.example && fieldInfo.example.includes('|')) {
      const values = fieldInfo.example.split('|').map(v => v.trim());
      return values.map(v => ({ value: v, label: v }));
    }

    // 2. For boolean type fields - always show True/False
    if (fieldInfo.type === 'boolean') {
      return [
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
      ];
    }

    // 3. Special handling for HTTP status codes (common use case)
    if (fieldInfo.name === 'httpStatusCode') {
      return [
        { value: '200', label: '200 - OK' },
        { value: '201', label: '201 - Created' },
        { value: '204', label: '204 - No Content' },
        { value: '400', label: '400 - Bad Request' },
        { value: '401', label: '401 - Unauthorized' },
        { value: '403', label: '403 - Forbidden' },
        { value: '404', label: '404 - Not Found' },
        { value: '500', label: '500 - Internal Server Error' },
        { value: '502', label: '502 - Bad Gateway' },
        { value: '503', label: '503 - Service Unavailable' },
      ];
    }

    // 4. For fields with "Id" suffix, suggest it's a text input (user IDs, execution IDs, etc.)
    if (fieldInfo.name.endsWith('Id') || fieldInfo.name.endsWith('ID')) {
      return null; // Use text input
    }

    // 5. Check if example looks like an enum (single uppercase word)
    if (fieldInfo.example && /^[A-Z_]+$/.test(fieldInfo.example)) {
      // This might be an enum, but we only have one example
      // Still show as text input so user can type other values
      return null;
    }

    // No predefined values - use text input
    return null;
  }, [fieldInfo]);

  // If we have possible values, show a dropdown
  if (possibleValues) {
    return (
      <div className="space-y-2">
        <Label htmlFor="value">Value to Compare *</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a value..." />
          </SelectTrigger>
          <SelectContent>
            {possibleValues.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Select the expected value for {fieldInfo?.name || 'this field'}
        </p>
      </div>
    );
  }

  // Otherwise, show a text input
  return (
    <div className="space-y-2">
      <Label htmlFor="value">Value to Compare *</Label>
      <Input
        id="value"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fieldInfo?.example || "e.g., APPROVED or 5 or high"}
      />
      <p className="text-xs text-muted-foreground">
        {fieldInfo 
          ? `Enter the expected value for ${fieldInfo.name} (type: ${fieldInfo.type})`
          : "Enter the expected value. Use exact text for strings, numbers for numeric comparison."}
      </p>
    </div>
  );
};

export const ConditionIfConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes, edges, currentNodeId }) => {
  const [fieldPickerOpen, setFieldPickerOpen] = React.useState(false);

  // Initialize operator with default value if not set
  React.useEffect(() => {
    if (!data.operator) {
      onUpdate({ operator: 'equals' });
    }
  }, []);

  // Get upstream nodes (nodes that execute before this condition)
  const upstreamNodes = React.useMemo(() => {
    if (!nodes || !edges || !currentNodeId) return [];

    // Find all nodes that have a path to the current node
    const visited = new Set<string>();
    const upstream: Array<{ id: string; type: string; label: string }> = [];

    const findUpstream = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Find edges that target this node
      const incomingEdges = edges.filter(edge => edge.target === nodeId);
      
      incomingEdges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode && sourceNode.id !== currentNodeId) {
          const nodeType = sourceNode.data?.stepType || sourceNode.type;
          upstream.push({
            id: sourceNode.id,
            type: nodeType,
            label: sourceNode.data?.label || sourceNode.id,
          });
          findUpstream(sourceNode.id);
        }
      });
    };

    findUpstream(currentNodeId);
    return upstream;
  }, [nodes, edges, currentNodeId]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Condition Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Check Approval Decision"
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Use fields from previous nodes (e.g., <code>approvalDecision</code>, <code>httpStatusCode</code>)
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="field">Field to Check *</Label>
        <div className="flex gap-2">
          <Input
            id="field"
            value={data.field || ''}
            onChange={(e) => onUpdate({ field: e.target.value })}
            placeholder="e.g., approvalDecision or approval.status"
            className="font-mono text-sm flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFieldPickerOpen(true)}
            className="flex-shrink-0"
          >
            <Database className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use dot notation for nested fields: <code>approval.decision</code>, <code>user.role</code>
        </p>
      </div>

      <FieldPicker
        open={fieldPickerOpen}
        onOpenChange={setFieldPickerOpen}
        onSelectField={(field) => onUpdate({ field })}
        upstreamNodes={upstreamNodes}
        currentValue={data.field}
      />

      <div className="space-y-2">
        <Label htmlFor="operator">Operator *</Label>
        <Select
          value={data.operator || 'equals'}
          onValueChange={(value) => onUpdate({ operator: value })}
        >
          <SelectTrigger id="operator">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals (==)</SelectItem>
            <SelectItem value="notEquals">Not Equals (!=)</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="notContains">Does Not Contain</SelectItem>
            <SelectItem value="startsWith">Starts With</SelectItem>
            <SelectItem value="endsWith">Ends With</SelectItem>
            <SelectItem value="greaterThan">Greater Than (&gt;)</SelectItem>
            <SelectItem value="lessThan">Less Than (&lt;)</SelectItem>
            <SelectItem value="greaterOrEqual">Greater or Equal (&gt;=)</SelectItem>
            <SelectItem value="lessOrEqual">Less or Equal (&lt;=)</SelectItem>
            <SelectItem value="exists">Exists</SelectItem>
            <SelectItem value="notExists">Does Not Exist</SelectItem>
            <SelectItem value="isEmpty">Is Empty</SelectItem>
            <SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!['exists', 'notExists', 'isEmpty', 'isNotEmpty'].includes(data.operator || 'equals') && (
        <FieldValueInput
          fieldName={data.field}
          value={data.value || ''}
          onChange={(value) => onUpdate({ value })}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trueLabel">True Branch Label</Label>
          <Input
            id="trueLabel"
            value={data.trueLabel || 'Yes'}
            onChange={(e) => onUpdate({ trueLabel: e.target.value })}
            placeholder="e.g., Approved"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="falseLabel">False Branch Label</Label>
          <Input
            id="falseLabel"
            value={data.falseLabel || 'No'}
            onChange={(e) => onUpdate({ falseLabel: e.target.value })}
            placeholder="e.g., Rejected"
          />
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Example: <code>approvalDecision</code> equals <code>APPROVED</code>
        </AlertDescription>
      </Alert>
    </div>
  );
};

// =====================================================
// Condition Switch Config (Switch/Case)
// =====================================================
interface ConditionSwitchCase {
  id: string;
  label: string;
  value: string;
  operator: string;
}

export const ConditionSwitchConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  // Initialize cases from data or empty array
  const cases: ConditionSwitchCase[] = data.cases || [];
  const defaultCase: string = data.defaultCase || 'default';
  
  // Operators available for switch case matching
  const switchOperators = [
    { value: 'equals', label: 'Equals (==)' },
    { value: 'notEquals', label: 'Not Equals (!=)' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'regex', label: 'Regex Match' },
    { value: 'in', label: 'In List (comma-separated)' },
    { value: 'range', label: 'In Range (min-max)' },
    { value: 'greaterThan', label: 'Greater Than (>)' },
    { value: 'lessThan', label: 'Less Than (<)' },
  ];
  
  // Add a new case
  const addCase = () => {
    const newCases: ConditionSwitchCase[] = [
      ...cases,
      {
        id: `case_${Date.now()}`,
        label: `case${cases.length + 1}`,
        value: '',
        operator: 'equals',
      },
    ];
    onUpdate({ cases: newCases });
  };
  
  // Remove a case
  const removeCase = (index: number) => {
    const newCases = cases.filter((_, i) => i !== index);
    onUpdate({ cases: newCases });
  };
  
  // Update a case field
  const updateCase = (index: number, field: keyof ConditionSwitchCase, value: string) => {
    const newCases = [...cases];
    newCases[index] = { ...newCases[index], [field]: value };
    onUpdate({ cases: newCases });
  };
  
  // Move case up/down for priority ordering
  const moveCase = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === cases.length - 1)
    ) {
      return;
    }
    const newCases = [...cases];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newCases[index], newCases[newIndex]] = [newCases[newIndex], newCases[index]];
    onUpdate({ cases: newCases });
  };

  return (
    <div className="space-y-4">
      {/* Node Label */}
      <div className="space-y-2">
        <Label htmlFor="label">Switch Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Route by Department"
        />
      </div>
      
      {/* Switch Expression */}
      
      {/* Switch Expression */}
      <div className="space-y-2">
        <Label htmlFor="switchExpression">
          Switch Expression *
          <span className="text-xs text-muted-foreground ml-2">
            (Path to value in context)
          </span>
        </Label>
        <Label htmlFor="switchExpression">
          Switch Expression *
          <span className="text-xs text-muted-foreground ml-2">
            (Path to value in context)
          </span>
        </Label>
        <Input
          id="switchExpression"
          value={data.switchExpression || ''}
          onChange={(e) => onUpdate({ switchExpression: e.target.value })}
          placeholder="e.g., user.department, request.type, order.status"
        />
        <p className="text-xs text-muted-foreground">
          Use dot notation for nested values. Example: <code className="bg-muted px-1 rounded">user.role</code>, <code className="bg-muted px-1 rounded">payload.category</code>
        </p>
      </div>
      
      {/* Case Sensitivity */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={data.caseSensitive || false}
          onChange={(e) => onUpdate({ caseSensitive: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
          placeholder="e.g., user.department, request.type, order.status"
        />
        <p className="text-xs text-muted-foreground">
          Use dot notation for nested values. Example: <code className="bg-muted px-1 rounded">user.role</code>, <code className="bg-muted px-1 rounded">payload.category</code>
        </p>
      </div>
      
      {/* Case Sensitivity */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={data.caseSensitive || false}
          onChange={(e) => onUpdate({ caseSensitive: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="caseSensitive" className="text-sm font-normal">
          Case-sensitive matching
        </Label>
      </div>
      
      <Separator />
      
      {/* Switch Cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Switch Cases</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCase}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Add Case
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Cases are evaluated in order. Connect edges from each case using the case label as the source handle.
        </p>
        
        {cases.length === 0 ? (
          <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center text-muted-foreground">
            <p className="text-sm">No cases defined</p>
            <p className="text-xs mt-1">Click &quot;Add Case&quot; to create switch cases</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((switchCase, index) => (
              <div
                key={switchCase.id}
                className="border rounded-lg p-3 space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Case {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCase(index, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCase(index, 'down')}
                      disabled={index === cases.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCase(index)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Case Label (Branch Name) */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    Case Label (Branch Name) *
                    <span className="text-muted-foreground ml-1">(Used for edge connection)</span>
                  </Label>
                  <Input
                    value={switchCase.label}
                    onChange={(e) => updateCase(index, 'label', e.target.value)}
                    placeholder="e.g., engineering, sales, approved"
                    className="h-8"
                  />
                </div>
                
                {/* Operator */}
                <div className="space-y-1">
                  <Label className="text-xs">Match Operator</Label>
                  <Select
                    value={switchCase.operator || 'equals'}
                    onValueChange={(value) => updateCase(index, 'operator', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {switchOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Case Value */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    Match Value
                    {switchCase.operator === 'in' && (
                      <span className="text-muted-foreground ml-1">(comma-separated)</span>
                    )}
                    {switchCase.operator === 'range' && (
                      <span className="text-muted-foreground ml-1">(format: min-max)</span>
                    )}
                    {switchCase.operator === 'regex' && (
                      <span className="text-muted-foreground ml-1">(regular expression)</span>
                    )}
                  </Label>
                  <Input
                    value={switchCase.value}
                    onChange={(e) => updateCase(index, 'value', e.target.value)}
                    placeholder={
                      switchCase.operator === 'in' ? 'e.g., value1, value2, value3' :
                      switchCase.operator === 'range' ? 'e.g., 0-100' :
                      switchCase.operator === 'regex' ? 'e.g., ^[A-Z]{3}$' :
                      'Value to match'
                    }
                    className="h-8"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Default Case */}
      <div className="space-y-2">
        <Label htmlFor="defaultCase">
          Default Branch
          <span className="text-xs text-muted-foreground ml-2">
            (Used when no case matches)
          </span>
        </Label>
        <Input
          id="defaultCase"
          value={defaultCase}
          onChange={(e) => onUpdate({ defaultCase: e.target.value })}
          placeholder="default"
        />
        <p className="text-xs text-muted-foreground">
          Create an edge from this switch node with source handle &quot;<code className="bg-muted px-1 rounded">{defaultCase}</code>&quot; for the default path.
        </p>
      </div>
      
      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          How Switch/Case Works
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• The switch expression is evaluated against each case in order</li>
          <li>• First matching case wins - order matters!</li>
          <li>• Connect edges using the case label as the <strong>sourceHandle</strong></li>
          <li>• Use &quot;{defaultCase}&quot; as sourceHandle for the default path</li>
          <li>• Available in context: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">switchValue</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">matchedValue</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">selectedBranch</code></li>
        </ul>
        <Label htmlFor="caseSensitive" className="text-sm font-normal">
          Case-sensitive matching
        </Label>
      </div>
      
      <Separator />
      
      {/* Switch Cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Switch Cases</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCase}
            className="gap-1"
          >
            <Plus className="h-3 w-3" /> Add Case
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Cases are evaluated in order. Connect edges from each case using the case label as the source handle.
        </p>
        
        {cases.length === 0 ? (
          <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center text-muted-foreground">
            <p className="text-sm">No cases defined</p>
            <p className="text-xs mt-1">Click &quot;Add Case&quot; to create switch cases</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((switchCase, index) => (
              <div
                key={switchCase.id}
                className="border rounded-lg p-3 space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Case {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCase(index, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveCase(index, 'down')}
                      disabled={index === cases.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCase(index)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Case Label (Branch Name) */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    Case Label (Branch Name) *
                    <span className="text-muted-foreground ml-1">(Used for edge connection)</span>
                  </Label>
                  <Input
                    value={switchCase.label}
                    onChange={(e) => updateCase(index, 'label', e.target.value)}
                    placeholder="e.g., engineering, sales, approved"
                    className="h-8"
                  />
                </div>
                
                {/* Operator */}
                <div className="space-y-1">
                  <Label className="text-xs">Match Operator</Label>
                  <Select
                    value={switchCase.operator || 'equals'}
                    onValueChange={(value) => updateCase(index, 'operator', value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {switchOperators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Case Value */}
                <div className="space-y-1">
                  <Label className="text-xs">
                    Match Value
                    {switchCase.operator === 'in' && (
                      <span className="text-muted-foreground ml-1">(comma-separated)</span>
                    )}
                    {switchCase.operator === 'range' && (
                      <span className="text-muted-foreground ml-1">(format: min-max)</span>
                    )}
                    {switchCase.operator === 'regex' && (
                      <span className="text-muted-foreground ml-1">(regular expression)</span>
                    )}
                  </Label>
                  <Input
                    value={switchCase.value}
                    onChange={(e) => updateCase(index, 'value', e.target.value)}
                    placeholder={
                      switchCase.operator === 'in' ? 'e.g., value1, value2, value3' :
                      switchCase.operator === 'range' ? 'e.g., 0-100' :
                      switchCase.operator === 'regex' ? 'e.g., ^[A-Z]{3}$' :
                      'Value to match'
                    }
                    className="h-8"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* Default Case */}
      <div className="space-y-2">
        <Label htmlFor="defaultCase">
          Default Branch
          <span className="text-xs text-muted-foreground ml-2">
            (Used when no case matches)
          </span>
        </Label>
        <Input
          id="defaultCase"
          value={defaultCase}
          onChange={(e) => onUpdate({ defaultCase: e.target.value })}
          placeholder="default"
        />
        <p className="text-xs text-muted-foreground">
          Create an edge from this switch node with source handle &quot;<code className="bg-muted px-1 rounded">{defaultCase}</code>&quot; for the default path.
        </p>
      </div>
      
      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          How Switch/Case Works
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• The switch expression is evaluated against each case in order</li>
          <li>• First matching case wins - order matters!</li>
          <li>• Connect edges using the case label as the <strong>sourceHandle</strong></li>
          <li>• Use &quot;{defaultCase}&quot; as sourceHandle for the default path</li>
          <li>• Available in context: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">switchValue</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">matchedValue</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">selectedBranch</code></li>
        </ul>
      </div>
    </div>
  );
};

// ==================== PARALLEL NODES ====================

export const ParallelSplitConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Parallel App Provisioning"
        />
      </div>
    </div>
  );
};

export const ParallelJoinConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Join App Provisioning"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="failurePolicy">Failure Policy</Label>
        <Select
          value={data.failurePolicy || 'FAIL_FAST'}
          onValueChange={(value) => onUpdate({ failurePolicy: value })}
        >
          <SelectTrigger id="failurePolicy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FAIL_FAST">Fail Fast</SelectItem>
            <SelectItem value="FAIL_SAFE">Fail Safe</SelectItem>
            <SelectItem value="THRESHOLD">Threshold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.failurePolicy === 'THRESHOLD' && (
        <div className="space-y-2">
          <Label htmlFor="failureThreshold">Failure Threshold (0.0 - 1.0)</Label>
          <Input
            id="failureThreshold"
            type="number"
            step="0.1"
            value={data.failureThreshold || 0.5}
            onChange={(e) => onUpdate({ failureThreshold: parseFloat(e.target.value) })}
            min={0}
            max={1}
          />
        </div>
      )}
    </div>
  );
};

// ==================== FOREACH LOOP NODES ====================

export const ForEachConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes, currentNodeId, workflowMetadata }) => {
  // Find ForEach-End nodes for linking
  const forEachEndNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter(n => n.data?.stepType === 'control.foreach-end');
  }, [nodes]);

  // Get event type and available array fields from payload
  const eventType = workflowMetadata?.eventConfig?.eventTypes?.[0];
  const arrayFields = eventType ? getEventArrayFields(eventType) : [];
  
  // Get item fields for selected collection
  const selectedArrayField = arrayFields.find(f => f.name === data.collectionPath);
  const itemFields = selectedArrayField?.itemFields || (
    eventType && data.collectionPath ? getArrayItemFields(eventType, data.collectionPath) : []
  );

  // Helper to generate smart variable name from field name
  const generateVarName = (fieldName: string) => {
    // userId -> currentUserId, managerId -> currentManagerId, etc.
    if (fieldName.endsWith('Id')) {
      return `current${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
    }
    return `current${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
  };

  // Get already used fields to filter dropdown
  const usedFields = Object.values(data.itemPropertyMappings || {}) as string[];
  const availableFields = itemFields.filter(f => !usedFields.includes(f.name));

  // Add a new mapping with smart defaults
  const addMapping = (fieldName: string) => {
    const varName = generateVarName(fieldName);
    const newMappings = { ...(data.itemPropertyMappings || {}), [varName]: fieldName };
    onUpdate({ itemPropertyMappings: newMappings });
  };
  
  return (
    <div className="space-y-4">
      {/* Collection to iterate */}
      <div className="space-y-2">
        <Label>Collection to Loop Through *</Label>
        {arrayFields.length > 0 ? (
          <Select
            value={data.collectionPath || ''}
            onValueChange={(value) => onUpdate({ collectionPath: value, iterationType: 'collection', itemPropertyMappings: undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a list from the payload" />
            </SelectTrigger>
            <SelectContent>
              {arrayFields.map((field) => (
                <SelectItem key={field.name} value={field.name}>
                  {field.description || field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={data.collectionPath || ''}
            onChange={(e) => onUpdate({ collectionPath: e.target.value, iterationType: 'collection' })}
            placeholder="e.g., selectedUsers"
          />
        )}
      </div>

      {/* Variable Mappings - Simplified: just pick fields to extract */}
      {data.collectionPath && itemFields.length > 0 && (
        <div className="space-y-3">
          <Label>Extract from each item</Label>
          <p className="text-xs text-muted-foreground">
            Select which values to use in the loop steps
          </p>
          
          {/* Show selected mappings */}
          {data.itemPropertyMappings && Object.keys(data.itemPropertyMappings).length > 0 && (
            <div className="space-y-2">
              {Object.entries(data.itemPropertyMappings).map(([varName, itemProp]) => (
                <div key={varName} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{itemProp as string}</span>
                    <span className="text-muted-foreground text-xs">→</span>
                    <code className="text-xs bg-muted px-1 rounded">{varName}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      const newMappings = { ...data.itemPropertyMappings };
                      delete newMappings[varName];
                      onUpdate({ itemPropertyMappings: Object.keys(newMappings).length > 0 ? newMappings : undefined });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new mapping - dropdown with available fields */}
          {availableFields.length > 0 && (
            <Select
              value=""
              onValueChange={(value) => {
                if (value) addMapping(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="+ Add field to extract" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    {field.name} <span className="text-muted-foreground text-xs">({field.type})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {availableFields.length === 0 && Object.keys(data.itemPropertyMappings || {}).length > 0 && (
            <p className="text-xs text-muted-foreground">All available fields have been added</p>
          )}
        </div>
      )}

      {/* Link to ForEach End */}
      <div className="space-y-2">
        <Label>Loop End Node *</Label>
        <Select
          value={data.loopEndNode || ''}
          onValueChange={(value) => onUpdate({ loopEndNode: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select the ForEach End node" />
          </SelectTrigger>
          <SelectContent>
            {forEachEndNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data?.label || 'ForEach End'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {forEachEndNodes.length === 0 && (
          <p className="text-xs text-amber-600">Add a ForEach End node first</p>
        )}
      </div>

      {/* Max iterations */}
      <div className="space-y-2">
        <Label>Max Iterations</Label>
        <Input
          type="number"
          value={data.maxIterations || 1000}
          onChange={(e) => onUpdate({ maxIterations: parseInt(e.target.value) || 1000 })}
          placeholder="1000"
        />
        <p className="text-xs text-muted-foreground">Safety limit to prevent infinite loops</p>
      </div>
    </div>
  );
};

export const ForEachEndConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes, currentNodeId }) => {
  // Find ForEach nodes for linking
  const forEachNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter(n => n.data?.stepType === 'control.foreach');
  }, [nodes]);
  
  // Get available variables from linked ForEach node
  const linkedForEachNode = useMemo(() => {
    if (!nodes || !data.loopStartNode) return null;
    return nodes.find(n => n.id === data.loopStartNode);
  }, [nodes, data.loopStartNode]);
  
  const availableLoopVars = useMemo(() => {
    const vars: Array<{ name: string; source: string }> = [];
    if (linkedForEachNode?.data?.itemPropertyMappings) {
      Object.entries(linkedForEachNode.data.itemPropertyMappings).forEach(([varName, sourceProp]) => {
        vars.push({
          name: varName,
          source: sourceProp as string
        });
      });
    }
    return vars;
  }, [linkedForEachNode]);

  // Check if there's an approval node in the workflow
  const hasApprovalInLoop = useMemo(() => {
    if (!nodes) return false;
    return nodes.some(n => n.data?.stepType?.includes('approval'));
  }, [nodes]);

  // Helper to generate smart output names from variable name
  // currentUserId -> approvedUserIds, rejectedUserIds
  // currentRoleId -> approvedRoleIds, rejectedRoleIds
  const generateOutputNames = (varName: string) => {
    // Remove "current" prefix if exists
    let baseName = varName.replace(/^current/i, '');
    // Capitalize first letter
    baseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    // Make plural if not already (simple pluralization)
    if (!baseName.endsWith('s')) {
      baseName = baseName + 's';
    }
    return {
      approved: `approved${baseName}`,
      rejected: `rejected${baseName}`
    };
  };

  // Handle variable selection - auto-generate output names
  const handleVariableSelect = (varName: string) => {
    const outputNames = generateOutputNames(varName);
    onUpdate({ 
      collectApprovedKey: varName,
      approvedOutputKey: outputNames.approved,
      rejectedOutputKey: outputNames.rejected
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Link to ForEach Start */}
      <div className="space-y-2">
        <Label>Link to ForEach Start *</Label>
        <Select
          value={data.loopStartNode || ''}
          onValueChange={(value) => onUpdate({ loopStartNode: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select the ForEach node" />
          </SelectTrigger>
          <SelectContent>
            {forEachNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data?.label || 'ForEach Loop'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {forEachNodes.length === 0 && (
          <p className="text-xs text-amber-600">Add a ForEach node first</p>
        )}
      </div>

      {/* Approval Tracking - only show if there's an approval node */}
      {hasApprovalInLoop && data.loopStartNode && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Track Approval Results</Label>
              <Switch
                checked={!!data.collectApprovedKey}
                onCheckedChange={(checked) => {
                  if (checked && availableLoopVars.length > 0) {
                    // Auto-select first variable and generate output names
                    handleVariableSelect(availableLoopVars[0].name);
                  } else {
                    onUpdate({ 
                      collectApprovedKey: undefined,
                      approvedOutputKey: undefined,
                      rejectedOutputKey: undefined
                    });
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Separate approved and rejected items after the loop
            </p>
          </div>

          {data.collectApprovedKey !== undefined && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-md">
              {/* Variable to track */}
              <div className="space-y-2">
                <Label className="text-sm">Variable to Track</Label>
                {availableLoopVars.length > 0 ? (
                  <Select
                    value={data.collectApprovedKey || ''}
                    onValueChange={handleVariableSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLoopVars.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name} <span className="text-muted-foreground text-xs">(from {v.source})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-amber-600">
                    Add variable mappings in the ForEach node first
                  </p>
                )}
              </div>

              {/* Show auto-generated output names (read-only display) */}
              {data.collectApprovedKey && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-sm text-muted-foreground">Output Lists</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <code className="text-sm bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">{data.approvedOutputKey}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">✗</span>
                      <code className="text-sm bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">{data.rejectedOutputKey}</code>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    These lists will be available in the next steps
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 This node marks where the loop ends. After all iterations, the workflow continues.
        </p>
      </div>
    </div>
  );
};

// ==================== DYNAMIC SWITCH NODES ====================

interface SwitchCase {
  id: string;
  name: string;
  condition: string;
  branchId: string;
}

export const DynamicSwitchConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes, currentNodeId }) => {
  const [cases, setCases] = React.useState<SwitchCase[]>(data.cases || []);
  
  // Find nodes that can be branches (excluding triggers, joins, and current node)
  const availableBranchNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter(n => 
      n.id !== currentNodeId && 
      !['trigger.start', 'trigger.end', 'gateway.switch-join', 'gateway.parallel-join'].includes(n.data?.stepType || '')
    );
  }, [nodes, currentNodeId]);
  
  // Find switch-join nodes
  const switchJoinNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter(n => n.data?.stepType === 'gateway.switch-join');
  }, [nodes]);
  
  const addCase = () => {
    const newCase: SwitchCase = {
      id: `case-${Date.now()}`,
      name: `Case ${cases.length + 1}`,
      condition: '',
      branchId: ''
    };
    const updatedCases = [...cases, newCase];
    setCases(updatedCases);
    onUpdate({ cases: updatedCases });
  };
  
  const updateCase = (index: number, updates: Partial<SwitchCase>) => {
    const updatedCases = [...cases];
    updatedCases[index] = { ...updatedCases[index], ...updates };
    setCases(updatedCases);
    onUpdate({ cases: updatedCases });
  };
  
  const removeCase = (index: number) => {
    const updatedCases = cases.filter((_, i) => i !== index);
    setCases(updatedCases);
    onUpdate({ cases: updatedCases });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Route by Role Type"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemsPath">Items Collection Path *</Label>
        <Input
          id="itemsPath"
          value={data.itemsPath || ''}
          onChange={(e) => onUpdate({ itemsPath: e.target.value })}
          placeholder="e.g., selectedRoles, users.approved"
        />
        <p className="text-xs text-muted-foreground">
          Path to the collection of items to route through the switch
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="executionMode">Execution Mode</Label>
        <Select
          value={data.executionMode || 'sequential'}
          onValueChange={(value) => onUpdate({ executionMode: value })}
        >
          <SelectTrigger id="executionMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sequential">Sequential - Process items one by one</SelectItem>
            <SelectItem value="parallel">Parallel - Process items concurrently</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="joinNode">Switch Join Node *</Label>
        <Select
          value={data.joinNode || '__none__'}
          onValueChange={(value) => onUpdate({ joinNode: value === '__none__' ? '' : value })}
        >
          <SelectTrigger id="joinNode">
            <SelectValue placeholder="Select Switch Join node" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Select Switch Join node...</SelectItem>
            {switchJoinNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data?.label || node.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {switchJoinNodes.length === 0 && (
          <p className="text-xs text-amber-600">
            Add a Switch Join node to the canvas first
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Switch Cases</Label>
          <Button variant="outline" size="sm" onClick={addCase}>
            Add Case
          </Button>
        </div>
        
        {cases.map((switchCase, index) => (
          <div key={switchCase.id} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Case {index + 1}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeCase(index)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <Input
              value={switchCase.name}
              onChange={(e) => updateCase(index, { name: e.target.value })}
              placeholder="Case name"
            />
            
            <Input
              value={switchCase.condition}
              onChange={(e) => updateCase(index, { condition: e.target.value })}
              placeholder="Condition (e.g., item.type == 'admin')"
            />
            
            <Select
              value={switchCase.branchId || '__none__'}
              onValueChange={(value) => updateCase(index, { branchId: value === '__none__' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select target branch...</SelectItem>
                {availableBranchNodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.data?.label || node.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        
        {cases.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No cases defined. Click "Add Case" to create routing rules.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultBranch">Default Branch (Optional)</Label>
        <Select
          value={data.defaultBranch || '__skip__'}
          onValueChange={(value) => onUpdate({ defaultBranch: value === '__skip__' ? '' : value })}
        >
          <SelectTrigger id="defaultBranch">
            <SelectValue placeholder="Select default branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__skip__">No default (skip unmatched items)</SelectItem>
            {availableBranchNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data?.label || node.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Items that don't match any case will be routed here
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Available in branches:</strong><br />
          • <code>switchItem</code> - Current item being processed<br />
          • <code>switchItemIndex</code> - Item's index in collection<br />
          • <code>switchCase</code> - Name of matched case
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const DynamicSwitchJoinConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes }) => {
  // Find switch nodes for linking
  const switchNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter(n => n.data?.stepType === 'gateway.switch');
  }, [nodes]);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Collect Role Results"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="switchNode">Corresponding Switch Node</Label>
        <Select
          value={data.switchNode || '__none__'}
          onValueChange={(value) => onUpdate({ switchNode: value === '__none__' ? '' : value })}
        >
          <SelectTrigger id="switchNode">
            <SelectValue placeholder="Select Switch node" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Select Switch node...</SelectItem>
            {switchNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data?.label || node.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {switchNodes.length === 0 && (
          <p className="text-xs text-amber-600">
            Add a Dynamic Switch node to the canvas first
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="failurePolicy">Failure Policy</Label>
        <Select
          value={data.failurePolicy || 'FAIL_FAST'}
          onValueChange={(value) => onUpdate({ failurePolicy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FAIL_FAST">Fail Fast - Stop on first error</SelectItem>
            <SelectItem value="FAIL_SAFE">Fail Safe - Continue despite errors</SelectItem>
            <SelectItem value="THRESHOLD">Threshold - Fail if too many errors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.failurePolicy === 'THRESHOLD' && (
        <div className="space-y-2">
          <Label htmlFor="failureThreshold">Failure Threshold (0.0 - 1.0)</Label>
          <Input
            id="failureThreshold"
            type="number"
            step="0.1"
            value={data.failureThreshold || 0.5}
            onChange={(e) => onUpdate({ failureThreshold: parseFloat(e.target.value) })}
            min={0}
            max={1}
          />
        </div>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>After completion:</strong><br />
          • <code>switchResults</code> - Array of all branch results<br />
          • Each result contains: item, itemIndex, caseName, branchOutput
        </AlertDescription>
      </Alert>
    </div>
  );
};

// ==================== DYNAMIC PARALLEL SPLIT NODES ====================

export const DynamicParallelSplitConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes, currentNodeId }) => {
  // Find dynamic-join nodes for linking
  const dynamicJoinNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter(n => n.data?.stepType === 'gateway.dynamic-join');
  }, [nodes]);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Process Each Role in Parallel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemsPath">Items Collection Path *</Label>
        <Input
          id="itemsPath"
          value={data.itemsPath || ''}
          onChange={(e) => onUpdate({ itemsPath: e.target.value })}
          placeholder="e.g., selectedRoles, approval.approvedUsers"
        />
        <p className="text-xs text-muted-foreground">
          Path to the collection of items to process in parallel
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="itemVariable">Item Variable Name</Label>
          <Input
            id="itemVariable"
            value={data.itemVariable || 'dynamicItem'}
            onChange={(e) => onUpdate({ itemVariable: e.target.value })}
            placeholder="dynamicItem"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="indexVariable">Index Variable Name</Label>
          <Input
            id="indexVariable"
            value={data.indexVariable || 'dynamicItemIndex'}
            onChange={(e) => onUpdate({ indexVariable: e.target.value })}
            placeholder="dynamicItemIndex"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="joinNode">Dynamic Join Node *</Label>
        <Select
          value={data.joinNode || '__none__'}
          onValueChange={(value) => onUpdate({ joinNode: value === '__none__' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Dynamic Join node" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Select Dynamic Join node...</SelectItem>
            {dynamicJoinNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data?.label || node.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dynamicJoinNodes.length === 0 && (
          <p className="text-xs text-amber-600">
            Add a Dynamic Join node to the canvas first
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Link to the Dynamic Join node that collects all parallel results
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxParallel">Max Concurrent Branches (Optional)</Label>
        <Input
          id="maxParallel"
          type="number"
          value={data.maxParallel || ''}
          onChange={(e) => onUpdate({ maxParallel: e.target.value ? parseInt(e.target.value) : undefined })}
          placeholder="Unlimited"
        />
        <p className="text-xs text-muted-foreground">
          Limit concurrent executions for large collections (leave empty for unlimited)
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Difference from ForEach Loop:</strong><br />
          ForEach processes items <em>sequentially</em> (one at a time).<br />
          Dynamic Split processes items <em>in parallel</em> (all at once).<br /><br />
          <strong>Available in each branch:</strong><br />
          • <code>{data.itemVariable || 'dynamicItem'}</code> - Current item<br />
          • <code>{data.indexVariable || 'dynamicItemIndex'}</code> - Item index
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const DynamicParallelJoinConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes }) => {
  // Find dynamic-split nodes for linking
  const dynamicSplitNodes = useMemo(() => {
    if (!nodes) return [];
    return nodes.filter(n => n.data?.stepType === 'gateway.dynamic-split');
  }, [nodes]);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Collect Parallel Results"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="splitNode">Corresponding Split Node</Label>
        <Select
          value={data.splitNode || '__none__'}
          onValueChange={(value) => onUpdate({ splitNode: value === '__none__' ? '' : value })}
        >
          <SelectTrigger id="splitNode">
            <SelectValue placeholder="Select Dynamic Split node" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Select Dynamic Split node...</SelectItem>
            {dynamicSplitNodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.data?.label || node.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dynamicSplitNodes.length === 0 && (
          <p className="text-xs text-amber-600">
            Add a Dynamic Split node to the canvas first
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="failurePolicy">Failure Policy</Label>
        <Select
          value={data.failurePolicy || 'FAIL_FAST'}
          onValueChange={(value) => onUpdate({ failurePolicy: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FAIL_FAST">Fail Fast - Stop on first error</SelectItem>
            <SelectItem value="FAIL_SAFE">Fail Safe - Continue despite errors</SelectItem>
            <SelectItem value="THRESHOLD">Threshold - Fail if too many errors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.failurePolicy === 'THRESHOLD' && (
        <div className="space-y-2">
          <Label htmlFor="failureThreshold">Failure Threshold (0.0 - 1.0)</Label>
          <Input
            id="failureThreshold"
            type="number"
            step="0.1"
            value={data.failureThreshold || 0.5}
            onChange={(e) => onUpdate({ failureThreshold: parseFloat(e.target.value) })}
            min={0}
            max={1}
          />
        </div>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>After completion:</strong><br />
          • <code>dynamicResults</code> - Array of all branch results<br />
          • Each result: {"{"} branchIndex, item, output, isSuccessful {"}"}<br />
          • Merged context from all successful branches
        </AlertDescription>
      </Alert>
    </div>
  );
};

// ==================== ACTION NODES ====================

export const ActionProvisionConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Create Employee Account"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="action">Identity Type *</Label>
        <Select
          value={data.action || 'create_employee'}
          onValueChange={(value) => onUpdate({ action: value })}
        >
          <SelectTrigger id="action">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create_employee">Employee</SelectItem>
            <SelectItem value="create_user">User (Non-Employee)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="${context.email}"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.firstName || ''}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            placeholder="${context.firstName}"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input
          id="lastName"
          value={data.lastName || ''}
          onChange={(e) => onUpdate({ lastName: e.target.value })}
          placeholder="${context.lastName}"
        />
      </div>
    </div>
  );
};

export const ActionDeprovisionConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  const [identities, setIdentities] = React.useState<Array<{ id: string; username: string; email: string; fullName: string; type: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadIdentities = async () => {
      setLoading(true);
      const fetchedIdentities = await fetchIdentities();
      setIdentities(fetchedIdentities);
      setLoading(false);
    };
    loadIdentities();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Revoke All Access"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="identityId">Select Identity to Remove *</Label>
        {loading ? (
          <div className="flex items-center gap-2 p-2 border rounded">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading identities...</span>
          </div>
        ) : (
          <Select
            value={data.identityId || ''}
            onValueChange={(value) => onUpdate({ identityId: value })}
          >
            <SelectTrigger id="identityId">
              <SelectValue placeholder="Select identity..." />
            </SelectTrigger>
            <SelectContent>
              {identities.map(identity => (
                <SelectItem key={identity.id} value={identity.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{identity.fullName}</span>
                    <span className="text-xs text-muted-foreground">{identity.username} • {identity.email}</span>
                    <span className="text-xs text-muted-foreground">{identity.type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export const ActionNotifyConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  const [users, setUsers] = React.useState<Array<{ id: string; username: string; email: string; fullName: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    };
    loadUsers();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Step Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Notify Requester"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notificationType">Notification Type</Label>
        <Select
          value={data.notificationType || 'workflow-update'}
          onValueChange={(value) => onUpdate({ notificationType: value })}
        >
          <SelectTrigger id="notificationType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="workflow-update">Workflow Update</SelectItem>
            <SelectItem value="approval-request">Approval Request</SelectItem>
            <SelectItem value="workflow-completed">Workflow Completed</SelectItem>
            <SelectItem value="workflow-failed">Workflow Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipientUserId">Recipient *</Label>
        {loading ? (
          <div className="flex items-center gap-2 p-2 border rounded">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading users...</span>
          </div>
        ) : (
          <Select
            value={data.recipientUserId || ''}
            onValueChange={(value) => {
              const selectedUser = users.find(u => u.id === value);
              onUpdate({ 
                recipientUserId: value,
                recipientEmail: selectedUser?.email || '',
                recipientName: selectedUser?.fullName || ''
              });
            }}
          >
            <SelectTrigger id="recipientUserId">
              <SelectValue placeholder="Select recipient..." />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.fullName}</span>
                    <span className="text-xs text-muted-foreground">{user.username} • {user.email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Message</Label>
        <Textarea
          id="description"
          value={data.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Notification message content"
          rows={3}
        />
      </div>
    </div>
  );
};

export const ActionScriptConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Script Action Name</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Custom SoD Check"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scriptType">Script Language</Label>
        <Select
          value={data.scriptType || 'javascript'}
          onValueChange={(value) => onUpdate({ scriptType: value })}
        >
          <SelectTrigger id="scriptType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="groovy">Groovy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="script">Script Content</Label>
        <Textarea
          id="script"
          value={data.script || ''}
          onChange={(e) => onUpdate({ script: e.target.value })}
          placeholder="// Your custom logic here"
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeout">Timeout</Label>
        <Select
          value={String(data.timeout || 30)}
          onValueChange={(value) => onUpdate({ timeout: parseInt(value) })}
        >
          <SelectTrigger id="timeout">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 seconds</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
            <SelectItem value="300">5 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const ActionHttpConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate, nodes, workflowMetadata }) => {
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(true);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  const [showMappings, setShowMappings] = React.useState(!!data.contextMappings && Object.keys(data.contextMappings).length > 0);

  // Get available context variables - Multi-Approval outputs (user-manager pairs OR role owners)
  const availableContextVars = useMemo(() => {
    const vars: Array<{ name: string; label: string }> = [];
    
    if (!nodes) return vars;
    
    // Check if workflow is event-triggered
    const isEventTriggered = workflowMetadata?.triggerType === 'event-based';
    
    // DEBUG: Log all multi-approval nodes to see what data they have
    const multiApprovalNodes = nodes.filter(node => node.data?.stepType === 'approval.multi');
    console.log('[ActionHttpConfig] Multi-Approval nodes found:', multiApprovalNodes.map(n => ({
      id: n.id,
      stepType: n.data?.stepType,
      approverSource: n.data?.approverSource,
      approverType: n.data?.approverType,
      structuredApproversKey: n.data?.structuredApproversKey,
    })));
    console.log('[ActionHttpConfig] Workflow is event-triggered:', isEventTriggered);
    
    // Check if there's a Multi-Approval node with:
    // 1. User-Manager Pairs (structuredApproversKey)
    // 2. Role Owners (approverSource = 'role_owner' OR approverType = 'role_owner')
    // 3. Event-triggered workflow with no explicit approverSource (defaults to role_owner)
    const hasMultiApproval = nodes.some(node => {
      if (node.data?.stepType !== 'approval.multi') return false;
      
      // Has structured approvers (user-manager pairs)
      if (node.data?.structuredApproversKey) return true;
      
      // Has explicit role owner approvers
      if (node.data?.approverSource === 'role_owner') return true;
      if (node.data?.approverType === 'role_owner') return true;
      
      // Event-triggered workflow with multi-approval but no explicit approverSource
      // (defaults to role_owner in UI)
      if (isEventTriggered && !node.data?.approverSource && !node.data?.structuredApproversKey) {
        return true;
      }
      
      return false;
    });
    
    console.log('[ActionHttpConfig] Has Multi-Approval with outputs:', hasMultiApproval);
    
    if (hasMultiApproval) {
      // Add user IDs for structured approvers (user-manager pairs)
      vars.push({
        name: 'approvedUserIds',
        label: 'Approved User IDs (from Multi-Approval)'
      });
      vars.push({
        name: 'rejectedUserIds',
        label: 'Rejected User IDs (from Multi-Approval)'
      });
      
      // Add owner IDs for role owner approvals (separate list for separation of concerns)
      vars.push({
        name: 'approvedOwnerIds',
        label: 'Approved Owner IDs (from Role Owner Approval)'
      });
      vars.push({
        name: 'rejectedOwnerIds',
        label: 'Rejected Owner IDs (from Role Owner Approval)'
      });
    }
    
    return vars;
  }, [nodes, workflowMetadata]);

  // Fetch action templates
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/v1/action-templates');
        if (response.ok) {
          const templateData = await response.json();
          setTemplates(templateData);
        }
      } catch (error) {
        console.error('[ActionHttpConfig] Failed to load templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  React.useEffect(() => {
    if (data.template && templates.length > 0) {
      const template = templates.find(t => t.type === data.template);
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
    }
  }, [data.template, templates]);

  const handleTemplateChange = (templateType: string) => {
    const template = templates.find(t => t.type === templateType);
    if (template) {
      onUpdate({
        template: template.type,
        method: template.template.method,
        url: template.template.urlTemplate,
        headers: template.template.headersTemplate || '',
        body: template.template.bodyTemplate || '',
        timeout: template.template.timeout || 30000,
        retries: template.template.retries || 3,
        contextMappings: undefined
      });
      setShowMappings(false);
    }
  };

  // Group templates by category
  const groupedTemplates = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    templates.forEach(template => {
      const category = template.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
    });
    return groups;
  }, [templates]);

  const categoryConfig: Record<string, { label: string; icon: any }> = {
    'application permissions': { label: '🔐 App Permissions', icon: Key },
    'identity management': { label: '👤 Identity Management', icon: Users },
    roles: { label: '🛡️ Roles', icon: Shield },
    users: { label: '👥 Users', icon: Users },
    permissions: { label: '🔑 Permissions', icon: Key },
    other: { label: '⚙️ Other', icon: Settings }
  };

  return (
    <div className="space-y-4">
      {/* API Action Selection */}
      <div className="space-y-2">
        <Label>Select API Action *</Label>
        <Select
          value={data.template || ''}
          onValueChange={handleTemplateChange}
          disabled={loadingTemplates}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingTemplates ? "Loading..." : "Choose an action"} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
              const config = categoryConfig[category] || categoryConfig.other;
              return (
                <React.Fragment key={category}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    {config.label}
                  </div>
                  {categoryTemplates.map((template) => (
                    <SelectItem key={template.type} value={template.type} className="pl-4">
                      {template.name}
                    </SelectItem>
                  ))}
                </React.Fragment>
              );
            })}
          </SelectContent>
        </Select>
        {loadingTemplates && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading...
          </div>
        )}
      </div>

      {/* Template Description */}
      {selectedTemplate && (
        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-sm font-medium">{selectedTemplate.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{selectedTemplate.description}</p>
        </div>
      )}

      {/* Context Mappings - Show appropriate field based on selected template */}
      {selectedTemplate && availableContextVars.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Context Mappings</Label>
              <p className="text-xs text-muted-foreground">
                {selectedTemplate.type === 'action.role.create' 
                  ? 'Map ownerIds to approved role owners'
                  : 'Map userIds to approval results'}
              </p>
            </div>
            <Switch
              checked={showMappings}
              onCheckedChange={(checked) => {
                setShowMappings(checked);
                if (!checked) {
                  onUpdate({ contextMappings: undefined });
                }
              }}
            />
          </div>

          {showMappings && (
            <div className="p-3 bg-muted/30 rounded-md space-y-3">
              <div className="flex gap-2 items-center">
                <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm">
                  {selectedTemplate.type === 'action.role.create' ? 'Owner IDs' : 'User IDs'}
                </div>
                <span className="text-muted-foreground text-sm">←</span>
                <Select
                  value={
                    selectedTemplate.type === 'action.role.create' 
                      ? (data.contextMappings?.ownerIds || '')
                      : (data.contextMappings?.userIds || '')
                  }
                  onValueChange={(value) => {
                    if (selectedTemplate.type === 'action.role.create') {
                      onUpdate({ contextMappings: value ? { ownerIds: value } : undefined });
                    } else {
                      onUpdate({ contextMappings: value ? { userIds: value } : undefined });
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContextVars.map((v) => (
                      <SelectItem key={v.name} value={v.name}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {selectedTemplate.type === 'action.role.create' 
                  ? <>Map <code className="bg-muted px-1 rounded">ownerIds</code> to <code className="bg-muted px-1 rounded">approvedOwnerIds</code> to assign only approved owners to the role.</>
                  : <>Use <code className="bg-muted px-1 rounded">approvedUserIds</code> for users whose managers approved, or <code className="bg-muted px-1 rounded">rejectedUserIds</code> for rejected ones.</>
                }
              </p>
            </div>
          )}

          {/* Show summary of mapping */}
          {showMappings && (
            selectedTemplate.type === 'action.role.create' && data.contextMappings?.ownerIds ? (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-md">
                <p className="text-xs font-medium text-green-700 dark:text-green-300">📤 Mapping:</p>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <code className="bg-green-100 dark:bg-green-900 px-1 rounded">ownerIds</code>
                  <span className="text-green-600">←</span>
                  <span className="text-green-700 dark:text-green-300">{data.contextMappings.ownerIds}</span>
                </div>
              </div>
            ) : data.contextMappings?.userIds ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">📤 Mapping:</p>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">userIds</code>
                  <span className="text-blue-600">←</span>
                  <span className="text-blue-700 dark:text-blue-300">{data.contextMappings.userIds}</span>
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

// ==================== DELAY NODES ====================

export const DelayWaitConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Delay Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Wait for System Sync"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="delaySeconds">Delay Duration (seconds)</Label>
        <Input
          id="delaySeconds"
          type="number"
          value={data.delaySeconds || 60}
          onChange={(e) => onUpdate({ delaySeconds: parseInt(e.target.value) })}
          min={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="delayUnit">Unit (for display)</Label>
        <Select
          value={data.delayUnit || 'seconds'}
          onValueChange={(value) => onUpdate({ delayUnit: value })}
        >
          <SelectTrigger id="delayUnit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Seconds</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const DelayScheduleConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Schedule Name *</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Wait Until Start Date"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduledTime">Scheduled Time</Label>
        <Input
          id="scheduledTime"
          type="datetime-local"
          value={data.scheduledTime || ''}
          onChange={(e) => onUpdate({ scheduledTime: e.target.value })}
        />
      </div>
    </div>
  );
};

// ==================== SIMPLIFIED ROLE ACTIONS ====================

export const ActionRoleActivateConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Simplified Action:</strong> This node automatically activates the role using the roleId from workflow context.
          No configuration needed - everything is handled automatically!
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="label">Action Name</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Activate Role After Approval"
        />
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="text-sm font-semibold">Auto-Configured:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>✅ URL: PUT /api/v1/roles/{'{roleId}'}/activate</li>
          <li>✅ Headers: Content-Type, X-Tenant-ID (from context)</li>
          <li>✅ Body: activatedBy, activatedAt (from context)</li>
          <li>✅ Authentication: Automatically handled</li>
        </ul>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Required in context:</strong> roleId<br />
          <strong>Optional in context:</strong> tenantId, approver
        </AlertDescription>
      </Alert>
    </div>
  );
};

export const ActionRoleDeleteConfig: React.FC<ConfigPanelProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Simplified Action:</strong> This node automatically deletes the role using the roleId from workflow context.
          No configuration needed - everything is handled automatically!
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="label">Action Name</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="e.g., Delete Role After Rejection"
        />
      </div>

      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="text-sm font-semibold">Auto-Configured:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>✅ URL: DELETE /api/v1/roles/{'{roleId}'}</li>
          <li>✅ Headers: Content-Type, X-Tenant-ID (from context)</li>
          <li>✅ Authentication: Automatically handled</li>
        </ul>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Required in context:</strong> roleId<br />
          <strong>Optional in context:</strong> tenantId, rejectedBy
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Export all panels as a map for easy lookup
export const NODE_CONFIG_PANELS = {
  'trigger.start': TriggerStartConfig,
  'trigger.end': TriggerEndConfig,
  'approval.single': ApprovalSingleConfig,
  'approval.multi': ApprovalMultiConfig,
  'approval.dynamic': ApprovalDynamicConfig,
  'condition.if': ConditionIfConfig,
  'condition.switch': ConditionSwitchConfig,
  'gateway.parallel-split': ParallelSplitConfig,
  'gateway.parallel-join': ParallelJoinConfig,
  'gateway.switch': DynamicSwitchConfig,
  'gateway.switch-join': DynamicSwitchJoinConfig,
  'gateway.dynamic-split': DynamicParallelSplitConfig,
  'gateway.dynamic-join': DynamicParallelJoinConfig,
  'control.foreach': ForEachConfig,
  'control.foreach-end': ForEachEndConfig,
  'action.provision': ActionProvisionConfig,
  'action.deprovision': ActionDeprovisionConfig,
  'action.notify': ActionNotifyConfig,
  'action.script': ActionScriptConfig,
  'action.http': ActionHttpConfig,
  'delay.wait': DelayWaitConfig,
  'delay.schedule': DelayScheduleConfig,
};
