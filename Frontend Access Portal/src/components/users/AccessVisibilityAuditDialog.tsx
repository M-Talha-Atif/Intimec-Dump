
import React from 'react';
import { type User } from '@/data/mock-users';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AccessVisibilityAuditDialogProps = {
  user: User;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const AccessVisibilityAuditDialog = ({ user, isOpen, onOpenChange }: AccessVisibilityAuditDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Access Visibility Audit</DialogTitle>
          <DialogDescription>
            List of users and systems that can view or manage {user.name}'s identity profile.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.accessVisibility?.map((vis, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{vis.actor}</TableCell>
                  <TableCell>{vis.role}</TableCell>
                  <TableCell className="text-slate-500">{vis.reason}</TableCell>
                  <TableCell>{vis.timestamp}</TableCell>
                </TableRow>
              ))}
              {!user.accessVisibility || user.accessVisibility.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No visibility data available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccessVisibilityAuditDialog;
