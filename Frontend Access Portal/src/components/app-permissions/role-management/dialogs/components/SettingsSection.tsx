import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateRoleContext } from "../contexts/CreateRoleContext";

export const SettingsSection: React.FC = () => {
  const { formData, updateFormData } = useCreateRoleContext();

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
            onCheckedChange={(checked) =>
              updateFormData({ isActive: checked })
            }
          />
        </div>

        {/* Requires Owner Approval */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Require Owner Approval</Label>
            <p className="text-xs text-muted-foreground">
              Role creation requires approval from designated owners
            </p>
          </div>
          <Switch
            checked={formData.requireOwnerApproval ?? false}
            onCheckedChange={(checked) =>
              updateFormData({ requireOwnerApproval: checked })
            }
          />
        </div>
      </div>
    </div>
  );
};
