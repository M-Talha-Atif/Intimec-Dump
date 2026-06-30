import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Clock } from "lucide-react";
import UserSelector from "./UserSelector";
import type { DelegatedAdminAssignment } from "@/types/hierarchical-delegation";

interface AssignDelegateFormData {
  userId: string;
  userName: string;
  role: "owner" | "admin" | "viewer";
  permissions: string[];
  timeWindow?: {
    start: string;
    end: string;
  };
  allowSiblingAccess: boolean;
}

interface AssignDelegateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeName: string;
  onAssign: (
    data: Omit<DelegatedAdminAssignment, "id" | "assigned" | "assignedBy">
  ) => void;
}

const availablePermissions = [
  { id: "read", label: "Read", description: "View node and its contents" },
  { id: "write", label: "Write", description: "Modify node properties" },
  { id: "create", label: "Create", description: "Create child nodes" },
  { id: "delete", label: "Delete", description: "Delete nodes" },
  { id: "assign", label: "Assign", description: "Assign users to roles" },
];

const EnhancedAssignDelegateDialog: React.FC<AssignDelegateDialogProps> = ({
  open,
  onOpenChange,
  nodeId,
  onAssign,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignDelegateFormData>({
    defaultValues: {
      userId: "",
      userName: "",
      role: "viewer",
      permissions: ["read"],
      timeWindow: {
        start: new Date().toISOString().split("T")[0],
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      allowSiblingAccess: false,
    },
  });

  const selectedRole = watch("role");
  const selectedPermissions = watch("permissions");

  const onSubmit = async (data: AssignDelegateFormData) => {
    try {
      await onAssign({
        userId: data.userId,
        userName: data.userName,
        role: data.role,
        permissions: data.permissions,
        timeWindow: data.timeWindow,
        allowSiblingAccess: data.allowSiblingAccess,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to assign delegate:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const currentPermissions = selectedPermissions || [];
    if (checked) {
      return [...currentPermissions, permissionId];
    } else {
      return currentPermissions.filter((p) => p !== permissionId);
    }
  };

  const handleUserChange = (userId: string) => {
    setValue("userId", userId);
    // In a real app, you'd fetch the user name from an API
    // For now, we'll use a mock lookup
    const mockUsers: Record<string, string> = {
      "user-1": "Alice Johnson",
      "user-2": "Bob Smith",
      "user-3": "Charlie Brown",
      "user-4": "Diana Prince",
      "user-5": "Eve Wilson",
    };
    setValue("userName", mockUsers[userId] || "Unknown User");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Delegate
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>User *</Label>
            <Controller
              name="userId"
              control={control}
              rules={{ required: "Please select a user" }}
              render={({ field }) => (
                <UserSelector
                  value={field.value}
                  onValueChange={handleUserChange}
                  filterType="All"
                  placeholder="Select user to delegate to..."
                />
              )}
            />
            {errors.userId && (
              <p className="text-sm text-destructive">
                {errors.userId.message}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Role *</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Owner</span>
                        <span className="text-xs text-muted-foreground">
                          Full administrative rights
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground">
                          Limited administrative rights
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Viewer</span>
                        <span className="text-xs text-muted-foreground">
                          Read-only access
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <Label>Permissions *</Label>
            <div className="grid grid-cols-1 gap-3">
              {availablePermissions.map((permission) => (
                <Controller
                  key={permission.id}
                  name="permissions"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={permission.id}
                        checked={field.value?.includes(permission.id) || false}
                        onCheckedChange={(checked) => {
                          const newPermissions = handlePermissionChange(
                            permission.id,
                            checked as boolean
                          );
                          field.onChange(newPermissions);
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Time Window */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Window
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm">
                  Start Date
                </Label>
                <Controller
                  name="timeWindow.start"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="start-date"
                      type="date"
                      value={field.value}
                      onChange={field.onChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm">
                  End Date
                </Label>
                <Controller
                  name="timeWindow.end"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="end-date"
                      type="date"
                      value={field.value}
                      onChange={field.onChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sibling Access */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/50">
              <Controller
                name="allowSiblingAccess"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="sibling-access"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="sibling-access"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow Sibling Access
                </Label>
                <p className="text-xs text-muted-foreground">
                  Grant access to sibling nodes at the same level in the
                  hierarchy.
                  {selectedRole === "admin" &&
                    " Admin roles can manage siblings if explicitly permitted."}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Assignment Summary</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                Role: <Badge variant="outline">{selectedRole}</Badge>
              </p>
              <p>Permissions: {selectedPermissions?.join(", ") || "None"}</p>
              <p>
                Sibling Access:{" "}
                {watch("allowSiblingAccess") ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Assigning..." : "Assign Delegate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAssignDelegateDialog;
