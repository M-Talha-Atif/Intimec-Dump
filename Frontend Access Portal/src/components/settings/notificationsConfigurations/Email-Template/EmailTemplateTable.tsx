import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { EmailTemplate } from '../../../../types/emailTemplateTypes';
import { triggerTypes } from './constants';
import { formatTimestampToLocal } from '@/utils/timestamp-utils';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface EmailTemplateTableProps {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onClone: (template: EmailTemplate) => void;
  onDelete: (templateId: string) => void;
  onToggleStatus: (templateId: string, checked: boolean) => void;
  isLoading?: boolean;
}

export const EmailTemplateTable: React.FC<EmailTemplateTableProps> = ({
  templates,
  onEdit,
  onClone,
  onDelete,
  onToggleStatus,
  isLoading = false,
}) => {
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-3 w-[100px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-3 w-[100px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-[40px]" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </TableRow>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Trigger Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Locale</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Show 3 skeleton rows while loading
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No email templates found
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    {triggerTypes.find(t => t.value === template.triggerType)?.label || template.triggerType}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.status ? 'default' : 'secondary'}>
                      {template.status ? "enabled" : "disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.locale}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatTimestampToLocal(template.lastModified)}</div>
                      <div className="text-gray-500">by {template.modifiedBy}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatTimestampToLocal(template.createdAt)}</div>
                      <div className="text-gray-500">by {template.createdBy}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {/* Enable/Disable */}
                      <Switch
                        checked={template.status}
                        onCheckedChange={(checked) => onToggleStatus(template.id, checked)}
                      />

                      {/* Edit */}
                      <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>

                      {/* Clone */}
                      <Button variant="ghost" size="sm" onClick={() => onClone(template)}>
                        <Copy className="h-4 w-4 text-blue-500" />
                      </Button>
                      {/* Delete */}
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button> */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this template?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                              onClick={() => onDelete(template.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};