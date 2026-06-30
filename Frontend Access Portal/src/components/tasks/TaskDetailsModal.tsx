import { useState } from "react";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WorkflowTaskDetails } from "@/types/tasks";
import {
  User,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  Shield,
  Building2,
  Target,
  Info,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { RiskLevel } from "@/types/tasks";
import IconTabs from "@/components/shared/IconTabs";
import { RoleDetails } from "@/components/tasks/RoleDetails";
import { RolePermissions } from "@/components/tasks/RolePermissions";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface TaskDetailsModalProps {
  taskId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  onDelegate?: (taskId: string) => void;
}

const tabs = [
  { value: "overview", label: "Overview", icon: Info },
  { value: "role-details", label: "Role Details", icon: Shield },
  { value: "role-permissions", label: "Role Permissions", icon: Users },
  { value: "timeline", label: "Timeline", icon: Clock },
  { value: "context", label: "Technical Context", icon: FileText },
];

export default function TaskDetailsModal({
  taskId,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onDelegate,
}: TaskDetailsModalProps) {
  const { data: task, isLoading } = useTaskDetails(taskId);
  const [activeTab, setActiveTab] = useState("overview");

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getSlaColor = (status?: string) => {
    switch (status) {
      case "overdue":
        return "destructive";
      case "dueSoon":
        return "default";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right">
          <SheetHeader>
            <VisuallyHidden>
              <SheetTitle>Loading task details</SheetTitle>
            </VisuallyHidden>
            <Skeleton className="h-6 w-3/4" />
          </SheetHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!task) return null;

  // Debug: Check page names in permissionList
  if ((task as WorkflowTaskDetails).permissionList) {
    console.log('[TaskDetailsModal] Permission List Details:',
      (task as WorkflowTaskDetails).permissionList!.map((p, idx) => ({
        index: idx,
        actionName: p.actionName,
        pageName: p.pageName,
        pageNameType: typeof p.pageName,
        pageNameExists: !!p.pageName,
      }))
    );
    console.log('[TaskDetailsModal] Has any pageName?',
      (task as WorkflowTaskDetails).permissionList!.some(p => p.pageName)
    );
  }

  const cleanTaskTitle = (title: string) => {
    let cleaned = title;

    // remove known prefixes
    cleaned = cleaned.replace(
      /^(Approve Role-Assignement - |Approve Access-Portal-Role-Assignement - )/i,
      ""
    );

    // fix spelling in normal or hyphenated words
    cleaned = cleaned.replace(/assignement/gi, "Assignment");

    return cleaned;
  };

  // Debug: Check page name in singlePermission
  if ((task as WorkflowTaskDetails).singlePermission) {
    console.log('[TaskDetailsModal] Single Permission Details:', {
      actionName: (task as WorkflowTaskDetails).singlePermission!.actionName,
      pageName: (task as WorkflowTaskDetails).singlePermission!.pageName,
      pageNameType: typeof (task as WorkflowTaskDetails).singlePermission!.pageName,
      pageNameExists: !!(task as WorkflowTaskDetails).singlePermission!.pageName,
    });
  }



  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-5xl flex flex-col p-0 h-full"
      >
        <div className="flex flex-col h-full min-w-0">

          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 py-4">
            <SheetHeader className="p-0">
              <SheetTitle>{cleanTaskTitle(task.title)}</SheetTitle>
              <SheetDescription>
                Review request details, governance context, role permissions, and workflow timeline.
              </SheetDescription>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className="capitalize">
                  {task.type.replace(/([A-Z])/g, " $1").trim()}
                </Badge>

                <Badge variant={getRiskColor(task.risk)}>
                  {capitalize(task.risk)}
                </Badge>

                {task.sla && (
                  <Badge variant={getSlaColor(task.sla.status)}>
                    SLA:{" "}
                    {task.sla.status === "ok"
                      ? "On Track"
                      : task.sla.status === "dueSoon"
                        ? "Due Soon"
                        : "Overdue"}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-3">
                {task.requester && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{task.requester.name}</span>
                  </div>
                )}

                {task.assignee && (
                  <div className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    <span>Assigned to {task.assignee.name}</span>
                  </div>
                )}

                {task.dueAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due {format(new Date(task.dueAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </SheetHeader>
          </div>

          {/* Tabs + Scrollable Content */}
          <div className="flex-1 min-h-0 px-6 pb-6 overflow-hidden">

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col h-full"
            >
              <IconTabs tabs={tabs} columns={5} />

              <ScrollArea className="flex-1 mt-4 pr-2">
                <TabsContent value="overview" className="space-y-4 mt-0">
                  <div className="grid gap-3">
                    {/* Requester - Most important for IAM governance */}
                    {task.requester?.name && (
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Requested By</div>
                          <div className="text-sm text-muted-foreground">
                            {task.requester.name}
                            {task.requester.email && ` (${task.requester.email})`}
                          </div>
                          {(task as WorkflowTaskDetails).requesterDepartment && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {(task as WorkflowTaskDetails).requesterDepartment}
                              {(task as WorkflowTaskDetails).requesterTitle &&
                                ` • ${(task as WorkflowTaskDetails).requesterTitle}`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Request Date/Time */}
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Request Date</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(task.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                        </div>
                      </div>
                    </div>

                    {/* Due Date */}
                    {task.dueAt && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Due Date</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(task.dueAt), "MMM dd, yyyy 'at' hh:mm a")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Role being requested */}
                    {task.role?.name && (
                      <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Role</div>
                          <div className="text-sm text-muted-foreground">
                            {task.role.name}
                            {task.role.type && <span className="ml-1 text-xs">({task.role.type})</span>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Application */}
                    {task.application?.name && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Application</div>
                          <div className="text-sm text-muted-foreground">{task.application.name}</div>
                        </div>
                      </div>
                    )}

                    {/* Request Type/Operation */}
                    {(task as WorkflowTaskDetails).requestType && (
                      <div className="flex items-start gap-3">
                        <Target className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Operation</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {(task as WorkflowTaskDetails).requestType?.replace(/[._]/g, ' ')}
                            {(task as WorkflowTaskDetails).approvalContext?.sourceService && (
                              <span className="text-xs ml-2 text-muted-foreground/70">
                                (from {(task as WorkflowTaskDetails).approvalContext.sourceService})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Approval Policy (for multi-approval workflows) */}
                    {(task as WorkflowTaskDetails).approvalPolicy && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Approval Policy</div>
                          <div className="text-sm text-muted-foreground">
                            {(task as WorkflowTaskDetails).approvalPolicy}
                            {(task as WorkflowTaskDetails).requiredApprovals &&
                              ` (${(task as WorkflowTaskDetails).requiredApprovals} required)`
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Justification */}
                  {task.justification && (
                    <>
                      <div>
                        <div className="mb-2 text-sm font-semibold">Justification</div>
                        <p className="text-sm text-muted-foreground">{task.justification}</p>
                      </div>
                    </>
                  )}
                  {/* Dynamic Content - Target Users for Role Assignment/Revocation */}
                  {((task as WorkflowTaskDetails).eventType === 'role.assigned' ||
                    (task as WorkflowTaskDetails).eventType === 'role.revoked') &&
                    (task as WorkflowTaskDetails).targetUsersList &&
                    (task as WorkflowTaskDetails).targetUsersList!.length > 0 && (
                      <>
                        {/* Per-User Approval: Show the specific user being approved */}
                        {(task as WorkflowTaskDetails).evidenceBundle?.targetUserId && (
                          <div>
                            <div className="mb-2 text-sm font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {(task as WorkflowTaskDetails).eventType === 'role.assigned'
                                ? 'You are approving role assignment for'
                                : 'You are approving role revocation for'}
                            </div>
                            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 text-sm">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-base">
                                    {(task as WorkflowTaskDetails).evidenceBundle?.targetUserDisplayName ||
                                      (task as WorkflowTaskDetails).evidenceBundle?.targetUserName ||
                                      (task as WorkflowTaskDetails).evidenceBundle?.currentUserName ||
                                      'User'}
                                  </div>
                                  {(task as WorkflowTaskDetails).evidenceBundle?.targetUserEmail && (
                                    <div className="text-muted-foreground text-sm">
                                      {(task as WorkflowTaskDetails).evidenceBundle.targetUserEmail}
                                    </div>
                                  )}
                                  {((task as WorkflowTaskDetails).evidenceBundle?.targetUserFirstName ||
                                    (task as WorkflowTaskDetails).evidenceBundle?.targetUserLastName) && (
                                      <div className="text-muted-foreground text-xs mt-1">
                                        {(task as WorkflowTaskDetails).evidenceBundle.targetUserFirstName} {(task as WorkflowTaskDetails).evidenceBundle.targetUserLastName}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Show full list for context (especially useful for per-user approvals) */}
                        <div>
                          <div className="mb-2 text-sm font-semibold flex items-center gap-2">
                            {(task as WorkflowTaskDetails).evidenceBundle?.targetUserId ? (
                              <>
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  All Users in This Request ({(task as WorkflowTaskDetails).targetUsersList!.length})
                                </span>
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4" />
                                {(task as WorkflowTaskDetails).eventType === 'role.assigned'
                                  ? 'Role Being Assigned To'
                                  : 'Role Being Revoked From'}
                              </>
                            )}
                          </div>
                          {(task as WorkflowTaskDetails).targetUsersList!.length === 1 &&
                            !(task as WorkflowTaskDetails).evidenceBundle?.targetUserId ? (
                            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                              <span className="font-medium">
                                {(task as WorkflowTaskDetails).targetUsersList![0].name ||
                                  (task as WorkflowTaskDetails).targetUsersList![0].id}
                              </span>
                              {(task as WorkflowTaskDetails).targetUsersList![0].email && (
                                <span className="text-muted-foreground ml-2">
                                  ({(task as WorkflowTaskDetails).targetUsersList![0].email})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-lg border overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="text-left p-2 font-medium">#</th>
                                    <th className="text-left p-2 font-medium">User</th>
                                    <th className="text-left p-2 font-medium">Email</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(task as WorkflowTaskDetails).targetUsersList!.map((user, idx) => {
                                    const isCurrentUser = (task as WorkflowTaskDetails).evidenceBundle?.targetUserId === user.id;
                                    return (
                                      <tr
                                        key={idx}
                                        className={`border-t ${isCurrentUser ? 'bg-primary/10 font-medium' : ''}`}
                                      >
                                        <td className="p-2 text-muted-foreground">{idx + 1}</td>
                                        <td className="p-2 font-medium">
                                          {user.name || user.id}
                                          {isCurrentUser && (
                                            <span className="ml-2 text-xs text-primary">(You are approving this user)</span>
                                          )}
                                        </td>
                                        <td className="p-2 text-muted-foreground">{user.email || '-'}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  {/* Dynamic Content - Bulk Permission List */}
                  {(task as WorkflowTaskDetails).eventType?.includes('permission') &&
                    (task as WorkflowTaskDetails).eventType?.includes('bulk') &&
                    (task as WorkflowTaskDetails).permissionList &&
                    (task as WorkflowTaskDetails).permissionList!.length > 0 && (
                      <>
                        <div>
                          <div className="mb-2 text-sm font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Permissions Being {(task as WorkflowTaskDetails).eventType?.includes('revoke') ? 'Revoked' : 'Granted'}
                          </div>
                          <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-2 font-medium">#</th>
                                  <th className="text-left p-2 font-medium">Action</th>
                                  {(task as WorkflowTaskDetails).permissionList!.some(p => p.pageName) && (
                                    <th className="text-left p-2 font-medium">Page</th>
                                  )}
                                  {(task as WorkflowTaskDetails).permissionList!.some(p => p.permissionType) && (
                                    <th className="text-left p-2 font-medium">Type</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {(task as WorkflowTaskDetails).permissionList!.map((permission, idx) => (
                                  <tr key={idx} className="border-t">
                                    <td className="p-2 text-muted-foreground">{idx + 1}</td>
                                    <td className="p-2 font-medium">{permission.actionName}</td>
                                    {(task as WorkflowTaskDetails).permissionList!.some(p => p.pageName) && (
                                      <td className="p-2 text-muted-foreground">{permission.pageName || '-'}</td>
                                    )}
                                    {(task as WorkflowTaskDetails).permissionList!.some(p => p.permissionType) && (
                                      <td className="p-2">
                                        {permission.permissionType && (
                                          <Badge variant="secondary" className="text-xs">
                                            {permission.permissionType}
                                          </Badge>
                                        )}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}

                  {/* Dynamic Content - Single Permission */}
                  {(task as WorkflowTaskDetails).eventType?.includes('permission') &&
                    !(task as WorkflowTaskDetails).eventType?.includes('bulk') &&
                    (task as WorkflowTaskDetails).singlePermission && (
                      <>
                        <div>
                          <div className="mb-2 text-sm font-semibold flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Permission Details
                          </div>
                          <div className="rounded-lg border bg-muted/50 p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Action:</span>
                              <span className="font-medium">{(task as WorkflowTaskDetails).singlePermission!.actionName}</span>
                            </div>
                            {/* Show page/tile from singlePermission or approvalContext */}
                            {((task as WorkflowTaskDetails).singlePermission!.pageName || (task as WorkflowTaskDetails).approvalContext?.tileName) && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  {(task as WorkflowTaskDetails).singlePermission!.pageName ? 'Page' : 'Tile'}:
                                </span>
                                <span>
                                  {(task as WorkflowTaskDetails).singlePermission!.pageName || (task as WorkflowTaskDetails).approvalContext?.tileName}
                                </span>
                              </div>
                            )}
                            {(task as WorkflowTaskDetails).singlePermission!.permissionType && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <Badge variant="secondary" className="text-xs">
                                  {(task as WorkflowTaskDetails).singlePermission!.permissionType}
                                </Badge>
                              </div>
                            )}
                            {(task as WorkflowTaskDetails).singlePermission!.justification && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Justification:</span>
                                <span className="italic">{(task as WorkflowTaskDetails).singlePermission!.justification}</span>
                              </div>
                            )}
                            {(task as WorkflowTaskDetails).role && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">For Role:</span>
                                <span className="font-medium">{(task as WorkflowTaskDetails).role.name}</span>
                              </div>
                            )}
                            {(task as WorkflowTaskDetails).singlePermission!.actionId && (
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Action ID:</span>
                                <span className="font-mono">{(task as WorkflowTaskDetails).singlePermission!.actionId.substring(0, 8)}...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  {/* Dynamic Content - Target Users List */}
                  {(task as WorkflowTaskDetails).eventType === 'role.assigned' &&
                    (task as WorkflowTaskDetails).targetUsersList &&
                    (task as WorkflowTaskDetails).targetUsersList!.length > 0 && (
                      <>
                        <div>
                          <div className="mb-2 text-sm font-semibold flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Users Receiving Role ({(task as WorkflowTaskDetails).targetUsersList!.length})
                          </div>
                          <div className="rounded-lg border overflow-hidden">
                            <div className="max-h-48 overflow-y-auto">
                              {(task as WorkflowTaskDetails).targetUsersList!.map((user, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2 p-2 text-sm ${idx > 0 ? 'border-t' : ''
                                    }`}
                                >
                                  <div className="rounded-full bg-primary/10 p-1.5">
                                    <User className="h-3 w-3 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{user.name}</div>
                                    {user.email && (
                                      <div className="text-xs text-muted-foreground">{user.email}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                  {/* Evidence Bundle (fallback for other event types) */}
                  {(task as WorkflowTaskDetails).evidenceBundle &&
                    Object.keys((task as WorkflowTaskDetails).evidenceBundle || {}).length > 0 &&
                    // Only show if no dynamic content was displayed
                    !(
                      ((task as WorkflowTaskDetails).eventType?.includes('permission') &&
                        (task as WorkflowTaskDetails).permissionList) ||
                      ((task as WorkflowTaskDetails).eventType === 'role.assigned' &&
                        (task as WorkflowTaskDetails).targetUsersList)
                    ) && (
                      <>
                        <div>
                          <div className="mb-2 text-sm font-semibold">Supporting Data</div>
                          <div className="rounded-lg border bg-muted/50 p-3">
                            <pre className="text-xs text-muted-foreground overflow-auto">
                              {JSON.stringify((task as WorkflowTaskDetails).evidenceBundle, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                </TabsContent>

                <TabsContent value="role-details">
                  {task.role?.id && <RoleDetails roleId={task.role.id} />}
                </TabsContent>

                <TabsContent value="role-permissions">
                  {task.role?.id && (
                    <RolePermissions roleId={task.role.id} />
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 mt-0">
                  {task.timeline && task.timeline.length > 0 ? (
                    <div className="space-y-4">
                      {task.timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="rounded-full bg-primary p-1">
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            </div>
                            {idx < task.timeline!.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm capitalize">{event.action}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(event.at), "MMM dd, yyyy 'at' hh:mm a")}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">by {event.actor}</div>
                            {event.note && <p className="text-sm text-muted-foreground mt-1">{event.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-muted/50 p-8 text-center">
                      <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">Timeline will be populated as the workflow progresses</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="context" className="space-y-4 mt-0">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Technical Metadata</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Technical identifiers and workflow execution details for troubleshooting and audit purposes.
                    </p>
                    {(task as WorkflowTaskDetails).workflowName && (
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-muted-foreground">Workflow Template:</div>
                        <div className="font-mono text-xs">{(task as WorkflowTaskDetails).workflowName}</div>
                      </div>
                    )}
                    {(task as WorkflowTaskDetails).approvalId && (
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-muted-foreground">Approval ID:</div>
                        <div className="font-mono text-xs">{(task as WorkflowTaskDetails).approvalId}</div>
                      </div>
                    )}
                    {(task as WorkflowTaskDetails).workflowInstanceId && (
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-muted-foreground">Execution ID:</div>
                        <div className="font-mono text-xs">{(task as WorkflowTaskDetails).workflowInstanceId}</div>
                      </div>
                    )}
                    {task.role?.id && (
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-muted-foreground">Role ID:</div>
                        <div className="font-mono text-xs">{task.role.id}</div>
                      </div>
                    )}
                    {task.application?.id && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Application ID:</div>
                        <div className="font-mono text-xs">{task.application.id}</div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 pb-6">

            {task.status === "Pending" && (
              <div className="flex items-center justify-end gap-2">

                {onDelegate && (
                  <Button variant="outline" onClick={() => onDelegate(task.id)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Delegate
                  </Button>
                )}

                {onReject && (
                  <Button variant="destructive" onClick={() => onReject(task.id)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}

                {onApprove && (
                  <Button onClick={() => onApprove(task.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}

              </div>
            )}

          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}