import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { UsersRound, Plus, Settings, BarChart3, FolderOpen, BookOpen } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StandardTabs from '@/components/shared/StandardTabs';
import { CreateIdentityGroupModal } from './CreateIdentityGroupModal';
import { GroupMembersPanel } from './GroupMembersPanel';
import { GroupDetailsPanel } from './GroupDetailsPanel';
import GroupsAnalyticsDashboard from './GroupsAnalyticsDashboard';
import GroupsDirectoryTable from './GroupsDirectoryTable';
import { listGroups, deleteGroup, cloneGroup, IdentityGroup } from '@/services/groups';

export default function IdentityGroupsContent() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IdentityGroup | null>(null);
  const [membersPanel, setMembersPanel] = useState<{ groupId: string; groupName: string; groupType: 'static' | 'dynamic' } | null>(null);
  const [detailsPanel, setDetailsPanel] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<IdentityGroup | null>(null);

  const { data } = useQuery({
    queryKey: ['groups'],
    queryFn: () => listGroups({})
  });

  const groups = data?.groups || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] })
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => cloneGroup(id),
    onSuccess: (cloned) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setEditingGroup(cloned);
      setIsCreateModalOpen(true);
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity Groups"
        description="Manage reusable identity groups for governance and assignments"
        icon={<UsersRound className="h-5 w-5 text-primary" />}
        tooltip="Create and manage reusable identity groups for governance policies, access assignments, and review campaigns."
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Group Settings</span>
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Identity Group</span>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="analytics" className="w-full">
        <StandardTabs
          tabs={[
            { value: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
            { value: "directory", label: "Directory", icon: <BookOpen className="h-4 w-4" /> },
          ]}
        />

        <TabsContent value="analytics">
          <GroupsAnalyticsDashboard groups={groups} />
        </TabsContent>

        <TabsContent value="directory">
          <GroupsDirectoryTable
            groups={groups}
            onViewDetails={(id) => setDetailsPanel(id)}
            onViewMembers={(g) => setMembersPanel({ groupId: g.id, groupName: g.name, groupType: g.type })}
            onEdit={(g) => { setEditingGroup(g); setIsCreateModalOpen(true); }}
            onClone={(id) => cloneMutation.mutate(id)}
            onDelete={(g) => setDeleteDialog(g)}
          />
        </TabsContent>
      </Tabs>

      <CreateIdentityGroupModal
        isOpen={isCreateModalOpen}
        group={editingGroup}
        onClose={() => { setIsCreateModalOpen(false); setEditingGroup(null); }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['groups'] })}
      />

      {membersPanel && (
        <GroupMembersPanel
          groupId={membersPanel.groupId}
          groupName={membersPanel.groupName}
          groupType={membersPanel.groupType}
          isOpen={!!membersPanel}
          onClose={() => setMembersPanel(null)}
        />
      )}

      {detailsPanel && (
        <GroupDetailsPanel
          groupId={detailsPanel}
          isOpen={!!detailsPanel}
          onClose={() => setDetailsPanel(null)}
        />
      )}

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteMutation.mutate(deleteDialog!.id); setDeleteDialog(null); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}