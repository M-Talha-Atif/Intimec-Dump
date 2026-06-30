import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditRoleContext } from "../contexts/EditRoleContext";
import { roleTypeIcons, formatRoleTypeDisplay } from "../data/createRoleData";
import { getRoleTypeDescription } from "../utils/createRoleUtils";

export const EditBasicInfoSection: React.FC<{ error?: string | null }> = ({ error }) => {
  const { formData, updateFormField, role } = useEditRoleContext();
  
  const MAX_ROLE_NAME_LENGTH = 128;
  const isRoleNameTooLong = formData.name.length > MAX_ROLE_NAME_LENGTH;
  const isSystemRole = role.type === "SYSTEM";

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="editRoleName" className="text-sm font-medium">
          Role Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="editRoleName"
          value={formData.name}
          onChange={(e) => updateFormField("name", e.target.value)}
          className={`mt-1 ${error || isRoleNameTooLong ? 'border-destructive' : ''}`}
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
        {isRoleNameTooLong && (
          <p className="text-sm text-destructive mt-1">
            Role name must not exceed {MAX_ROLE_NAME_LENGTH} characters ({formData.name.length}/{MAX_ROLE_NAME_LENGTH})
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <Label htmlFor="editRoleType" className="text-sm font-medium">
            Role Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              updateFormField("type", value)
            }
            disabled={isSystemRole}
          >
            <SelectTrigger id="editRoleType" className="mt-1" disabled={isSystemRole}>
              <SelectValue placeholder="Select role type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-md">
              {Object.entries(roleTypeIcons).map(([type, Icon]) => (
                <SelectItem
                  key={type}
                  value={type}
                  className="flex items-center"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{formatRoleTypeDisplay(type)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.type && (
            <p className="text-xs text-muted-foreground mt-1">
              {getRoleTypeDescription(formData.type)}
              {isSystemRole && " (Cannot be changed for SYSTEM roles)"}
            </p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="editRiskLevel" className="text-sm font-medium">
            Risk Level <span className="text-destructive">*</span>
          </Label>
        <Select
          value={formData.riskLevel}
          onValueChange={(value) =>
            updateFormField("riskLevel", value as "Low" | "Medium" | "High")
          }
        >
          <SelectTrigger id="editRiskLevel" className="mt-1">
            <SelectValue placeholder="Select risk level" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-md">
            <SelectItem value="Low" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </SelectItem>
            <SelectItem value="Medium" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
            </SelectItem>
            <SelectItem value="High" className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span>High</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="editRoleDescription" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="editRoleDescription"
          value={formData.description}
          onChange={(e) => updateFormField("description", e.target.value)}
          className="mt-1 min-h-[80px]"
        />
      </div>

      <div>
        <Label
          htmlFor="editBusinessJustification"
          className="text-sm font-medium"
        >
          Business Justification
        </Label>
        <Textarea
          id="editBusinessJustification"
          value={formData.businessJustification}
          onChange={(e) =>
            updateFormField("businessJustification", e.target.value)
          }
          placeholder="Explain why this role is needed for business operations..."
          className="mt-1 min-h-[60px]"
        />
      </div>
    </div>
  );
};
