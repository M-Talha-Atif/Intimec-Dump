import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateDelegationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const CreateDelegationDialog: React.FC<CreateDelegationDialogProps> = ({
  open,
  onOpenChange,
  trigger,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Delegated Scope</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scopeName">Scope Name</Label>
            <Input id="scopeName" placeholder="Enter scope name..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scopeType">Scope Type</Label>
            <Select>
              <SelectTrigger id="scopeType">
                <SelectValue placeholder="Select scope type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organizational">
                  Organizational Unit
                </SelectItem>
                <SelectItem value="geographical">
                  Geographical Region
                </SelectItem>
                <SelectItem value="application">Application Domain</SelectItem>
                <SelectItem value="identity">Identity Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="administrator">Administrator</Label>
            <Input id="administrator" placeholder="Select administrator..." />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Create Delegation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
