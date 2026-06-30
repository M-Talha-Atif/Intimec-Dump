import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ReportPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (permissions: any) => void;
}

export const ReportPermissionsModal = ({ open, onOpenChange, onSave }: ReportPermissionsModalProps) => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState({
    'Admin': { view: true, edit: true, delete: true, schedule: true },
    'Manager': { view: true, edit: true, delete: false, schedule: true },
    'Analyst': { view: true, edit: false, delete: false, schedule: false },
    'Viewer': { view: true, edit: false, delete: false, schedule: false },
  });

  const handleSave = () => {
    onSave?.(permissions);
    toast({ title: "Permissions Updated" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Report Permissions</span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-center">View</th>
                <th className="p-2 text-center">Edit</th>
                <th className="p-2 text-center">Delete</th>
                <th className="p-2 text-center">Schedule</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(permissions).map(([role, perms]) => (
                <tr key={role} className="border-b">
                  <td className="p-2 font-medium">{role}</td>
                  <td className="p-2 text-center"><Checkbox checked={perms.view} /></td>
                  <td className="p-2 text-center"><Checkbox checked={perms.edit} /></td>
                  <td className="p-2 text-center"><Checkbox checked={perms.delete} /></td>
                  <td className="p-2 text-center"><Checkbox checked={perms.schedule} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Permissions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
