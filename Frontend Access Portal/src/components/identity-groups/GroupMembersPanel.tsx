import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, UserMinus, Download } from "lucide-react";
import { getGroupMembers, GroupMember, removeMembersFromGroup } from "@/services/groups";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface GroupMembersPanelProps {
  groupId: string;
  groupName: string;
  groupType: 'static' | 'dynamic';
  isOpen: boolean;
  onClose: () => void;
}

export function GroupMembersPanel({ groupId, groupName, groupType, isOpen, onClose }: GroupMembersPanelProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['group-members', groupId, search, page],
    queryFn: () => getGroupMembers(groupId, { effective: true, search, page, pageSize: 25 }),
    enabled: isOpen
  });

  const handleSelectMember = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedMembers(new Set(data.members.map(m => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleRemoveMembers = async () => {
    await removeMembersFromGroup(groupId, Array.from(selectedMembers));
    setSelectedMembers(new Set());
    setShowRemoveDialog(false);
    refetch();
  };

  const handleExport = () => {
    console.log('export-members', groupId);
    // In production, trigger CSV download
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-warning';
    return 'text-success';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return '👤';
      case 'non-employee':
        return '👥';
      case 'non-human':
        return '🤖';
      default:
        return '•';
    }
  };

  const getSourceBadge = (source: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      static: 'default',
      dynamic: 'secondary',
      inherited: 'outline'
    };
    return <Badge variant={variants[source] || 'outline'} className="text-xs">{source}</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Members of {groupName}</DialogTitle>
                <DialogDescription>
                  {data ? `${data.total} total members` : "Loading members..."}
                </DialogDescription>
              </div>

              <Button className="mr-2" variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>

              {groupType === "static" && selectedMembers.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowRemoveDialog(true)}
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Remove ({selectedMembers.size})
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                {groupType === "static" && data && data.members.length > 0 && (
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Checkbox
                      checked={selectedMembers.size === data.members.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      Select all
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {data?.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {groupType === "static" && (
                        <Checkbox
                          checked={selectedMembers.has(member.id)}
                          onCheckedChange={(checked) =>
                            handleSelectMember(member.id, checked as boolean)
                          }
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getTypeIcon(member.type)}
                          </span>

                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.department && (
                          <Badge variant="outline" className="text-xs">
                            {member.department}
                          </Badge>
                        )}

                        {getSourceBadge(member.source)}

                        <div
                          className={`text-sm font-medium ${getRiskColor(
                            member.riskScore
                          )}`}
                        >
                          {member.riskScore}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {data && data.total > data.pageSize && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * data.pageSize + 1} -{" "}
                      {Math.min(page * data.pageSize, data.total)} of {data.total}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * data.pageSize >= data.total}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Members</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMembers.size} member(s)
              from this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={handleRemoveMembers}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Members
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
