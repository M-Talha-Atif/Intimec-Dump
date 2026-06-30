import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEditRoleContext } from "../contexts/EditRoleContext";

export const EditSettingsSection: React.FC = () => {
  const { formData, updateFormField } = useEditRoleContext();

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Role Settings</Label>

      {/* Horizontal layout for settings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Status</Label>
            <p className="text-xs text-muted-foreground">
              Inactive roles cannot be assigned to users
            </p>
          </div>
          <Switch
            checked={formData.isActive ?? true}
            onCheckedChange={(checked) => updateFormField("isActive", checked)}
          />
        </div>

        {/* Requires Approval */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Requires Approval</Label>
            <p className="text-xs text-muted-foreground">
              Role assignments require manager approval
            </p>
          </div>
          <Switch
            checked={formData.requiresApproval}
            onCheckedChange={(checked) =>
              updateFormField("requiresApproval", checked)
            }
          />
        </div>
      </div>
    </div>
  );
};
