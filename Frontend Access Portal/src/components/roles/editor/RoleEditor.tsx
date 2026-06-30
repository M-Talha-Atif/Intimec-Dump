import * as React from "react";
import { useState, useCallback, useMemo, useRef } from "react";
import { Role } from "@/types/roles";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ShieldCheck,
  Link,
  Code,
  Users,
  ShieldAlert,
} from "lucide-react";
import RoleEditorHeader from "./RoleEditorHeader";
import RoleOverviewEditor from "./RoleOverviewEditor";
import RoleEntitlementsEditor from "./RoleEntitlementsEditor";
import RoleRelationshipBuilder from "./RoleRelationshipBuilder";
import RoleMembershipRulesEditor from "./RoleMembershipRulesEditor";
import RoleRiskComplianceEditor from "./RoleRiskComplianceEditor";
import RoleOwnersEditor from "./RoleOwnersEditor";
import RoleAIAssistant from "./RoleAIAssistant";
import RoleImpactSimulator from "./RoleImpactSimulator";
import { getRoleHealthIssues } from "@/lib/role-health";
import IconTabs from "@/components/shared/IconTabs";
import { useRoleEditorSave } from "./hooks/useRoleEditorSave";

interface RoleEditorProps {
  role: Role;
  allRoles: Role[];
  onSave: (updatedRole: Role) => Promise<void>;
  onCancel: () => void;
  onSelectRole: (role: Role) => void;
}

const RoleEditor: React.FC<RoleEditorProps> = ({
  role,
  allRoles,
  onSave,
  onCancel,
  onSelectRole,
}) => {
  const [editedRole, setEditedRole] = useState<Role>(role);
  const [hasChanges, setHasChanges] = useState(false);
  const [showImpactSimulation, setShowImpactSimulation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const entitlementNameCache = useRef<Map<string, string>>(new Map());
  const originalEntitlementIds = useRef<string[]>([]);

  const handleOriginalEntitlementIdsLoaded = useCallback((ids: string[]) => {
    originalEntitlementIds.current = ids;
  }, []);

  const originalChildIds = useRef<string[]>([]);

  const handleOriginalChildIdsLoaded = useCallback((ids: string[]) => {
    originalChildIds.current = ids;
  }, []);

  const { save, isSaving } = useRoleEditorSave({
    allRoles,
    originalRole: role,
    originalEntitlementIdsRef: originalEntitlementIds,
    originalChildIdsRef: originalChildIds,
    setEditedRole,
    onSave,
  });

  const healthScore = useMemo(() => {
    const issues = getRoleHealthIssues(editedRole);
    const warnings = issues.filter((i) => i.severity === "warning").length;
    const infos = issues.filter((i) => i.severity === "info").length;
    return Math.max(0, Math.min(100, 100 - warnings * 15 - infos * 5));
  }, [editedRole]);

  const handleRoleChange = useCallback((updates: Partial<Role>) => {
    setEditedRole((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
    setValidationErrors([]);
  }, []);

  const validateBeforeSave = useCallback((): string[] => {
    const errors: string[] = [];
    if (!editedRole.name.trim()) errors.push("Role name is required");
    if (!editedRole.owner.trim() && !(editedRole as any).ownerId) {
      errors.push("Role owner is required");
    }
    return errors;
  }, [editedRole]);

  const handleSave = useCallback(async () => {
    const errors = validateBeforeSave();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    const result = await save(editedRole);
    if (!result.success && !result.metadataUpdated && !result.entitlementsUpdated && !result.childrenUpdated) {
      return;
    }

    setHasChanges(false);
    setValidationErrors([]);
  }, [editedRole, save, validateBeforeSave]);

  const handleCancel = useCallback(() => {
    setEditedRole(role);
    setHasChanges(false);
    setValidationErrors([]);
    setShowImpactSimulation(false);
    entitlementNameCache.current.clear();
    originalEntitlementIds.current = [];
    originalChildIds.current = [];
    onCancel();
  }, [role, onCancel]);

  return (
    <div className="space-y-6">
      <RoleEditorHeader
        role={editedRole}
        healthScore={healthScore}
        hasChanges={hasChanges}
        isSaving={isSaving}
        validationErrors={validationErrors}
        onSave={handleSave}
        onCancel={handleCancel}
        onPreviewImpact={() => setShowImpactSimulation(true)}
      />

      <RoleAIAssistant role={editedRole} allRoles={allRoles} />

      {showImpactSimulation && (
        <RoleImpactSimulator
          originalRole={role}
          editedRole={editedRole}
          isOpen={showImpactSimulation}
          onClose={() => setShowImpactSimulation(false)}
        />
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <IconTabs
          columns={6}
          tabs={[
            { value: "overview", label: "Overview", icon: LayoutDashboard },
            { value: "entitlements", label: "Entitlements", icon: ShieldCheck },
            { value: "relationships", label: "Relationships", icon: Link },
            { value: "risk", label: "Risk & Compliance", icon: ShieldAlert },
            { value: "membership", label: "Membership Rules", icon: Code },
            { value: "owners", label: "Owners", icon: Users },
          ]}
        />

        <TabsContent value="overview">
          <RoleOverviewEditor
            role={editedRole}
            isEditing={true}
            onChange={handleRoleChange}
          />
        </TabsContent>

        <TabsContent value="entitlements">
          <RoleEntitlementsEditor
            role={editedRole}
            isEditing={true}
            onChange={handleRoleChange}
            nameCache={entitlementNameCache}
            onOriginalIdsLoaded={handleOriginalEntitlementIdsLoaded}
          />
        </TabsContent>

        <TabsContent value="relationships">
          <RoleRelationshipBuilder
            role={editedRole}
            allRoles={allRoles}
            isEditing={true}
            onChange={handleRoleChange}
            onSelectRole={onSelectRole}
            onOriginalChildIdsLoaded={handleOriginalChildIdsLoaded}
          />
        </TabsContent>

        <TabsContent value="risk">
          <RoleRiskComplianceEditor
            role={editedRole}
            isEditing={true}
            onChange={handleRoleChange}
          />
        </TabsContent>

        <TabsContent value="membership">
          <RoleMembershipRulesEditor
            role={editedRole}
            isEditing={true}
            onChange={handleRoleChange}
          />
        </TabsContent>

        <TabsContent value="owners">
          <RoleOwnersEditor role={editedRole} onChange={handleRoleChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleEditor;
