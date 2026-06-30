import React from "react";
import { EntitlementResponseDto } from "@/types/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EntitlementOverviewEditorProps {
  entitlement: EntitlementResponseDto;
  isEditing: boolean;
  onChange: (updates: Partial<EntitlementResponseDto>) => void;
}

const ENTITLEMENT_TYPES = [
  "Role",
  "Group",
  "Permission",
  "Policy",
  "Responsibility",
] as const;

const EntitlementOverviewEditor: React.FC<EntitlementOverviewEditorProps> = ({
  entitlement,
  isEditing,
  onChange,
}) => {
  const currentType =
    entitlement.kind ??
    (typeof entitlement.attributes?.type === "string"
      ? String(entitlement.attributes.type)
      : entitlement.objectClass ?? "Role");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Editable: displayName */}
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={entitlement.displayName ?? ""}
              onChange={(e) => onChange({ displayName: e.target.value })}
              placeholder="Enter entitlement name"
              disabled={!isEditing}
            />
          </div>

          {/* Read-only: resourceName (sync-managed) */}
          <div>
            <Label htmlFor="resourceName">Application</Label>
            <Input
              id="resourceName"
              value={entitlement.resourceName ?? ""}
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          {/* Editable: type (saved as kind) */}
          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={currentType}
              onValueChange={(value) => onChange({ kind: value })}
              disabled={!isEditing}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITLEMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Editable: lifecycle */}
          <div>
            <Label htmlFor="lifecycle">Lifecycle</Label>
            <Select
              value={entitlement.lifecycle ?? "Active"}
              onValueChange={(value) => onChange({ lifecycle: value })}
              disabled={!isEditing}
            >
              <SelectTrigger id="lifecycle">
                <SelectValue placeholder="Select lifecycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Deprecated">Deprecated</SelectItem>
                <SelectItem value="Orphaned">Orphaned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Editable: requestable (Yes / No) */}
          <div>
            <Label htmlFor="requestable">Requestable</Label>
            <Select
              value={entitlement.requestable ? "Yes" : "No"}
              onValueChange={(value) =>
                onChange({ requestable: value === "Yes" })
              }
              disabled={!isEditing}
            >
              <SelectTrigger id="requestable">
                <SelectValue placeholder="Select requestable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Editable: description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={entitlement.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Enter entitlement description"
            rows={3}
            disabled={!isEditing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EntitlementOverviewEditor;