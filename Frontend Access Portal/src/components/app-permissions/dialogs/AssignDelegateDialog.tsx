"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AssignDelegateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  nodeName: string;
  onAssign: (assignment: {
    userId: string;
    userName: string;
    role: string;
    permissions: string[];
    timeWindow?: { start: string; end: string };
    allowSiblingAccess: boolean;
  }) => void;
}

export const AssignDelegateDialog: React.FC<AssignDelegateDialogProps> = ({
  open,
  onOpenChange,
  nodeId,
  nodeName,
  onAssign,
}) => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [allowSiblingAccess, setAllowSiblingAccess] = useState(false);
  const [hasTimeWindow, setHasTimeWindow] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const availablePermissions = [
    "User Management",
    "Access Reviews",
    "Reporting",
    "App Configuration",
    "Audit Access",
    "Regional Compliance",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignment = {
      userId,
      userName,
      role,
      permissions: selectedPermissions,
      timeWindow: hasTimeWindow
        ? { start: startDate, end: endDate }
        : undefined,
      allowSiblingAccess,
    };

    onAssign(assignment);
    onOpenChange(false);

    // Reset form
    setUserId("");
    setUserName("");
    setRole("");
    setSelectedPermissions([]);
    setAllowSiblingAccess(false);
    setHasTimeWindow(false);
    setStartDate("");
    setEndDate("");
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Delegate to {nodeName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID..."
              required
            />
          </div>

          <div>
            <Label htmlFor="userName">User Name</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter user name..."
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                  />
                  <Label htmlFor={permission} className="text-sm">
                    {permission}
                  </Label>
                </div>
              ))}
            </div>
            {selectedPermissions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedPermissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant="secondary"
                    className="text-xs"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowSiblingAccess"
              checked={allowSiblingAccess}
              onCheckedChange={(checked) =>
                setAllowSiblingAccess(checked === true)
              }
            />
            <Label htmlFor="allowSiblingAccess" className="text-sm">
              Allow Sibling Access
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasTimeWindow"
              checked={hasTimeWindow}
              onCheckedChange={(checked) => setHasTimeWindow(checked === true)}
            />
            <Label htmlFor="hasTimeWindow" className="text-sm">
              Set Time Window
            </Label>
          </div>

          {hasTimeWindow && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required={hasTimeWindow}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required={hasTimeWindow}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Assign Delegate</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
