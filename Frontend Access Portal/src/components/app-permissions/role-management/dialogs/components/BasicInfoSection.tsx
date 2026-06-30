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
import { useCreateRoleContext } from "../contexts/CreateRoleContext";
import { roleTypeIcons } from "../data/createRoleData";
import { getRoleTypeDescription } from "../utils/createRoleUtils";

export const BasicInfoSection: React.FC = () => {
  const { formData, updateFormData } = useCreateRoleContext();

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="roleName" className="text-sm font-medium">
          Role Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="roleName"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Enter role name..."
          className="mt-1"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <Label htmlFor="roleType" className="text-sm font-medium">
            Role Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              updateFormData({
                type: value as "admin" | "reviewer" | "operator" | "viewer",
              })
            }
          >
            <SelectTrigger id="roleType" className="mt-1">
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
                    <span className="capitalize">{type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.type && (
            <p className="text-xs text-muted-foreground mt-1">
              {getRoleTypeDescription(formData.type)}
            </p>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="riskLevel" className="text-sm font-medium">
            Risk Level <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.riskLevel}
            onValueChange={(value) =>
              updateFormData({
                riskLevel: value as "Low" | "Medium" | "High",
              })
            }
          >
            <SelectTrigger id="riskLevel" className="mt-1">
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
        <Label htmlFor="roleDescription" className="text-sm font-medium">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="roleDescription"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the role's purpose and responsibilities..."
          className="mt-1 min-h-[80px]"
        />
      </div>

      <div>
        <Label htmlFor="businessJustification" className="text-sm font-medium">
          Business Justification
        </Label>
        <Textarea
          id="businessJustification"
          value={formData.businessJustification}
          onChange={(e) =>
            updateFormData({ businessJustification: e.target.value })
          }
          placeholder="Explain why this role is needed for business operations..."
          className="mt-1 min-h-[60px]"
        />
      </div>
    </div>
  );
};
