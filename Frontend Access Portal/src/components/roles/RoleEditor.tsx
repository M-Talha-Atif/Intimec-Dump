import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { Role } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Save, X, Eye, AlertTriangle, Zap,
  LayoutDashboard, ShieldCheck, Link, Code,
  Users, UserCheck, UserX, Clock, Mail, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import RoleOverviewEditor from './editor/RoleOverviewEditor';
import RoleEntitlementsEditor from './editor/RoleEntitlementsEditor';
import RoleRelationshipBuilder from './editor/RoleRelationshipBuilder';
import RoleMembershipRulesEditor from './editor/RoleMembershipRulesEditor';
import RoleAIAssistant from './editor/RoleAIAssistant';
import RoleImpactSimulator from './editor/RoleImpactSimulator';
import { useToast } from '@/hooks/use-toast';
import { getRoleHealthIssues } from '@/lib/role-health';
import InfoTooltip from '@/components/dashboard/InfoTooltip';

interface RoleEditorProps {
  role: Role;
  allRoles: Role[];
  onSave: (updatedRole: Role) => Promise<void>;
  onCancel: () => void;
  onSelectRole: (role: Role) => void;
}

// Mock owner history
const mockOwnerHistory = [
  { owner: "Previous Owner A", from: "2023-01-15", to: "2024-03-01", reason: "Role transfer" },
  { owner: "Previous Owner B", from: "2022-06-10", to: "2023-01-14", reason: "Department restructure" },
  { owner: "Original Creator", from: "2021-11-01", to: "2022-06-09", reason: "Initial assignment" },
];

const mockEscalationChain = [
  { name: "Direct Manager", email: "manager@company.com", level: 1 },
  { name: "Department Head", email: "dept.head@company.com", level: 2 },
  { name: "CISO Office", email: "ciso@company.com", level: 3 },
];

const RoleEditor: React.FC<RoleEditorProps> = ({
  role, allRoles, onSave, onCancel, onSelectRole
}) => {
  const [editedRole, setEditedRole] = useState<Role>(role);
  const [hasChanges, setHasChanges] = useState(false);
  const [showImpactSimulation, setShowImpactSimulation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [delegationEnabled, setDelegationEnabled] = useState(true);
  const { toast } = useToast();

  const healthScore = useMemo(() => {
    const issues = getRoleHealthIssues(editedRole);
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;
    return Math.max(0, Math.min(100, 100 - (warnings * 15) - (infos * 5)));
  }, [editedRole]);

  const handleSave = useCallback(async () => {
    const errors: string[] = [];
    if (!editedRole.name.trim()) errors.push('Role name is required');
    if (!editedRole.owner.trim()) errors.push('Role owner is required');
    if (errors.length > 0) { setValidationErrors(errors); return; }

    try {
      await onSave(editedRole);
      setHasChanges(false);
      setValidationErrors([]);
      toast({ title: "Role Updated", description: `${editedRole.name} has been successfully updated.` });
    } catch {
      toast({ title: "Save Failed", description: "Unable to save role changes. Please try again.", variant: "destructive" });
    }
  }, [editedRole, onSave, toast]);

  const handleRoleChange = useCallback((updatedRole: Partial<Role>) => {
    setEditedRole(prev => ({ ...prev, ...updatedRole }));
    setHasChanges(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="text-2xl">{editedRole.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    <Zap className="h-3 w-3 mr-1" /> Editing
                  </Badge>
                  <Badge variant="outline" className={cn(
                    editedRole.status === 'Enabled'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                      : 'border-muted bg-muted text-muted-foreground'
                  )}>
                    {editedRole.status}
                  </Badge>
                  <Badge variant="secondary" className={cn(
                    healthScore >= 80 ? "text-emerald-700" : healthScore >= 50 ? "text-amber-700" : "text-destructive"
                  )}>
                    Health: {healthScore}%
                  </Badge>
                  {hasChanges && (
                    <Badge variant="outline" className="border-destructive/50 bg-destructive/10 text-destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Unsaved Changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setShowImpactSimulation(true)} className="gap-1.5">
                <Eye className="h-4 w-4" /> Preview Impact
              </Button>
              <Button variant="outline" onClick={() => { setEditedRole(role); setHasChanges(false); setValidationErrors([]); setShowImpactSimulation(false); onCancel(); }} className="gap-1.5">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        {validationErrors.length > 0 && (
          <CardContent className="pt-0">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <RoleAIAssistant role={editedRole} allRoles={allRoles} />

      {showImpactSimulation && (
        <RoleImpactSimulator
          originalRole={role} editedRole={editedRole}
          isOpen={showImpactSimulation} onClose={() => setShowImpactSimulation(false)}
        />
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="entitlements"><ShieldCheck className="mr-2 h-4 w-4" /> Entitlements</TabsTrigger>
          <TabsTrigger value="relationships"><Link className="mr-2 h-4 w-4" /> Relationships</TabsTrigger>
          <TabsTrigger value="membership"><Code className="mr-2 h-4 w-4" /> Membership Rules</TabsTrigger>
          <TabsTrigger value="owners"><Users className="mr-2 h-4 w-4" /> Owners</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <RoleOverviewEditor role={editedRole} isEditing={true} onChange={handleRoleChange} />
        </TabsContent>
        <TabsContent value="entitlements">
          <RoleEntitlementsEditor role={editedRole} isEditing={true} onChange={handleRoleChange} />
        </TabsContent>
        <TabsContent value="relationships">
          <RoleRelationshipBuilder role={editedRole} allRoles={allRoles} isEditing={true} onChange={handleRoleChange} onSelectRole={onSelectRole} />
        </TabsContent>
        <TabsContent value="membership">
          <RoleMembershipRulesEditor role={editedRole} isEditing={true} onChange={handleRoleChange} />
        </TabsContent>

        {/* Owners Tab — Full Implementation */}
        <TabsContent value="owners">
          <div className="space-y-6">
            {/* Primary & Backup Owner */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" /> Role Ownership
                  </CardTitle>
                  <InfoTooltip text="Primary and backup owners are responsible for certifying and maintaining this role." />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      Primary Owner <InfoTooltip text="The main person accountable for this role's lifecycle and certification." />
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {editedRole.owner.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <Input
                        value={editedRole.owner}
                        onChange={e => handleRoleChange({ owner: e.target.value })}
                        className="flex-1"
                        placeholder="Enter owner name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      Backup Owner <InfoTooltip text="A secondary owner who can act when the primary is unavailable." />
                    </label>
                    <div className="flex items-center gap-2">
                      {editedRole.backupOwner ? (
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                          {editedRole.backupOwner.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <UserX className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <Input
                        value={editedRole.backupOwner ?? ""}
                        onChange={e => handleRoleChange({ backupOwner: e.target.value || undefined })}
                        className="flex-1"
                        placeholder="Enter backup owner"
                      />
                    </div>
                    {!editedRole.backupOwner && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> No backup owner assigned — governance risk
                      </p>
                    )}
                  </div>
                </div>

                {/* Last review info */}
                <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Last reviewed on <span className="font-medium text-foreground">{editedRole.lastReviewed}</span>
                      {editedRole.lastReviewedBy && <> by <span className="font-medium text-foreground">{editedRole.lastReviewedBy}</span></>}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(editedRole.lastReviewed) > new Date(Date.now() - 180 * 86400000) ? "Current" : "Stale"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Delegation Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Delegation Settings</CardTitle>
                  <InfoTooltip text="Configure whether the role owner can delegate certification reviews." />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Allow owner to delegate reviews</p>
                    <p className="text-xs text-muted-foreground">Owner can assign certification tasks to team members.</p>
                  </div>
                  <Switch checked={delegationEnabled} onCheckedChange={setDelegationEnabled} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto-escalate on missed deadline</p>
                    <p className="text-xs text-muted-foreground">Escalate to backup owner if review is overdue by 7+ days.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Require justification for changes</p>
                    <p className="text-xs text-muted-foreground">Owner must provide reason when modifying entitlements.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Escalation Chain */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Escalation Chain</CardTitle>
                  <InfoTooltip text="Ordered list of contacts for escalating unresolved ownership or certification issues." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockEscalationChain.map((contact, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center rounded-full p-0">
                        {contact.level}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {contact.email}
                        </p>
                      </div>
                      {i === 0 && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Owner History */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Ownership History
                  </CardTitle>
                  <InfoTooltip text="Historical record of all ownership changes for this role." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Current owner */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-primary/5">
                    <div>
                      <p className="text-sm font-medium">{editedRole.owner}</p>
                      <p className="text-xs text-muted-foreground">
                        Since {mockOwnerHistory[0]?.to ?? editedRole.lastReviewed} — Present
                      </p>
                    </div>
                    <Badge className="text-xs">Current</Badge>
                  </div>
                  {mockOwnerHistory.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{entry.owner}</p>
                        <p className="text-xs text-muted-foreground">{entry.from} — {entry.to}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{entry.reason}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleEditor;
