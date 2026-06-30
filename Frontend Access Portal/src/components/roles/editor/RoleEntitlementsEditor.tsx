import React, { useEffect, useCallback, useRef } from "react";
import { Role } from "@/types/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Bot, AlertTriangle, LoaderCircle } from "lucide-react";
import EntitlementCatalogPicker from "@/components/shared/EntitlementCatalogPicker";
import { useGroupedRoleEntitlements } from "@/hooks/access-catalogue/roles/entitlements/useGroupedRoleEntitlements";

interface RoleEntitlementsEditorProps {
  role: Role;
  isEditing: boolean;
  onChange: (updates: Partial<Role>) => void;
  nameCache: React.MutableRefObject<Map<string, string>>;
  /** Called once when original entitlement IDs are loaded from backend. */
  onOriginalIdsLoaded?: (ids: string[]) => void;
}

const RoleEntitlementsEditor: React.FC<RoleEntitlementsEditorProps> = ({
  role,
  isEditing,
  onChange,
  nameCache,
  onOriginalIdsLoaded,
}) => {
  const seededRef = useRef(false);

  const { data, loading, error, refresh } = useGroupedRoleEntitlements(
    role.id, 0, 100, 0, 100
  );

  const hasEdited = (role as any).entitlementIds !== undefined;

  useEffect(() => {
    if (seededRef.current || hasEdited || !data || loading) return;

    const ids: string[] = [];
    for (const appGroup of data.applications.content) {
      for (const ent of appGroup.entitlements.content) {
        ids.push(ent.id);
        if (ent.displayName) {
          nameCache.current.set(ent.id, ent.displayName);
        }
      }
    }

    seededRef.current = true;
    onOriginalIdsLoaded?.(ids);
    onChange({ entitlementIds: ids } as any);
  }, [data, loading, hasEdited, nameCache, onChange, onOriginalIdsLoaded]);

  const selectedIds: string[] = (role as any).entitlementIds || [];

  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      onChange({ entitlementIds: ids } as any);
    },
    [onChange]
  );

  if (loading && !seededRef.current && !hasEdited) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Entitlements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading linked entitlements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !seededRef.current && selectedIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Entitlements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-destructive mb-2">Failed to load linked entitlements</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => { seededRef.current = false; refresh(); }}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Entitlements ({selectedIds.length} linked)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EntitlementCatalogPicker
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            nameCache={nameCache}
            editable={isEditing}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span>AI Entitlement Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-300">Optimization Suggestion</p>
                  <p className="text-blue-800 dark:text-blue-400 text-sm">
                    3 entitlements appear to be unused for over 90 days. Consider reviewing their necessity.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-300">Risk Alert</p>
                  <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                    This role has admin-level access to both development and production environments, creating potential SoD conflicts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleEntitlementsEditor;