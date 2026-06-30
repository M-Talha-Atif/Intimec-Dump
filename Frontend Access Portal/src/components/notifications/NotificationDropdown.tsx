'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Megaphone, TriangleAlert, Eye, Pin, PinOff, Check, X, UserPlus, Shield, Users, Clock, FileText, Building2, ArrowRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNotifications, type NotificationData } from '@/contexts/NotificationContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { workflowApprovalsService, type WorkflowApprovalDetails } from '@/services/workflowApprovalsService';
import { useToast } from '@/hooks/use-toast';

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsViewed: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

interface WorkflowNotificationMetadata {
  type: 'workflow_approval';
  workflowName: string;
  requestedBy: string;
  approvalId: string;
  message: string;
  // Enterprise IAM context fields
  requesterFullName?: string;
  requesterDepartment?: string;
  tileName?: string;
  roleName?: string;
  roleDescription?: string;
  riskLevel?: string;
  targetUsers?: string;
  targetUserCount?: number;
  justification?: string;
  requestedAt?: string;
  deadlineAt?: string;
  applicationName?: string;
  requestType?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsViewed, onTogglePin }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [approvalDetails, setApprovalDetails] = useState<WorkflowApprovalDetails | null>(null);
  const [loadingApproval, setLoadingApproval] = useState(false);

  // Check if this is a workflow approval notification
  const isWorkflowApproval = notification.operation === 'WORKFLOW_APPROVAL_REQUESTED';
  
  // Parse workflow metadata from details field
  const workflowMetadata = React.useMemo(() => {
    if (!isWorkflowApproval || !notification.details) return null;
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(notification.details);
      if (parsed.type === 'workflow_approval') {
        return parsed as WorkflowNotificationMetadata;
      }
    } catch (e) {
      // Not JSON - this is an old notification format, skip it
      console.log('Notification details is not JSON (old format), skipping workflow actions');
    }
    return null;
  }, [isWorkflowApproval, notification.details]);

  // Fetch approval details when needed - only for unviewed notifications
  // (viewed notifications already had their approval acted upon)
  const [approvalFetchFailed, setApprovalFetchFailed] = React.useState(false);
  
  useEffect(() => {
    const approvalId = workflowMetadata?.approvalId;
    // Only fetch approval details if:
    // 1. We have an approvalId
    // 2. Notification hasn't been viewed yet (user hasn't acted on it)
    // 3. We don't already have details
    // 4. We're not already loading
    // 5. Previous fetch didn't fail
    if (approvalId && !notification.isViewed && !approvalDetails && !loadingApproval && !approvalFetchFailed) {
      setLoadingApproval(true);
      workflowApprovalsService
        .getApprovalById(approvalId)
        .then((details) => {
          if (details) {
            setApprovalDetails(details);
          } else {
            // Approval not found (deleted/stale) - mark as failed so we don't retry
            console.log('Approval not found, marking as stale:', approvalId);
            setApprovalFetchFailed(true);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch approval details:', err);
          setApprovalFetchFailed(true); // Don't retry on error
        })
        .finally(() => setLoadingApproval(false));
    }
  }, [workflowMetadata?.approvalId, notification.isViewed, approvalDetails, loadingApproval, approvalFetchFailed]);

  const getTypeIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'NOTIFICATIONS':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'ANNOUNCEMENTS':
        return <Megaphone className="h-4 w-4 text-green-500" />;
      case 'ALERTS':
        return <TriangleAlert className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: NotificationData['type']) => {
    switch (type) {
      case 'NOTIFICATIONS':
        return 'border-l-blue-500';
      case 'ANNOUNCEMENTS':
        return 'border-l-green-500';
      case 'ALERTS':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Recently';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <>
      <div
        className={cn(
          "p-4 border-l-4 transition-colors cursor-pointer",
          getTypeColor(notification.type),
          notification.isPinned && "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
          !notification.isViewed && !notification.isPinned
            ? "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20"
            : "hover:bg-muted/50 dark:hover:bg-muted/20"
        )}
        onClick={() => {
          console.log('NotificationItem clicked:', notification.id, 'isViewed:', notification.isViewed);
          // Mark any unviewed notification as viewed when clicked
          if (!notification.isViewed) {
            console.log('Calling onMarkAsViewed for notification:', notification.id);
            onMarkAsViewed(notification.id);
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getTypeIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium truncate">
                {notification.description}
              </p>
              <div className="flex items-center gap-2">
                {notification.isPinned && (
                  <Pin className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                )}
                {!notification.isViewed && (
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                )}
              </div>
            </div>
            
            {/* Enterprise-grade workflow approval details */}
            {workflowMetadata && (
              <div className="mb-3 space-y-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-3 -mx-1">
                {/* Header row: Request type, Application, and Risk */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium gap-1">
                      <Shield className="h-3 w-3" />
                      {workflowMetadata.requestType || 'Access Request'}
                    </Badge>
                    {workflowMetadata.applicationName && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {workflowMetadata.applicationName}
                      </span>
                    )}
                  </div>
                  {workflowMetadata.riskLevel && (
                    <Badge 
                      variant={
                        workflowMetadata.riskLevel === 'HIGH' ? 'destructive' :
                        workflowMetadata.riskLevel === 'MEDIUM' ? 'secondary' : 'outline'
                      }
                      className={cn(
                        "text-xs uppercase font-bold",
                        workflowMetadata.riskLevel === 'HIGH' && "bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 animate-pulse",
                        workflowMetadata.riskLevel === 'MEDIUM' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
                        workflowMetadata.riskLevel === 'LOW' && "bg-green-500/10 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700"
                      )}
                    >
                      {workflowMetadata.riskLevel === 'HIGH' ? '⚠️ ' : ''}
                      {workflowMetadata.riskLevel} Risk
                    </Badge>
                  )}
                </div>
                
                {/* Tile name - prominent display */}
                {workflowMetadata.tileName && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Tile Name:</span>
                    <span className="text-base font-semibold text-foreground">
                      {workflowMetadata.tileName}
                    </span>
                  </div>
                )}
                
                {/* Role name - separate display */}
                {workflowMetadata.roleName && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-muted-foreground">Role Name:</span>
                    <span className="text-base font-semibold text-foreground">
                      {workflowMetadata.roleName}
                    </span>
                  </div>
                )}
                
                {/* Role description if available */}
                {workflowMetadata.roleDescription && (
                  <p className="text-xs text-muted-foreground pl-6">
                    {workflowMetadata.roleDescription}
                  </p>
                )}
                
                {/* Info grid */}
                <div className="grid gap-2 text-xs">
                  {/* Requester info */}
                  <div className="flex items-start gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Requested by: </span>
                      <span className="text-muted-foreground">
                        {workflowMetadata.requesterFullName || workflowMetadata.requestedBy}
                        {workflowMetadata.requesterDepartment && (
                          <span className="text-muted-foreground/70"> • {workflowMetadata.requesterDepartment}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Target users */}
                  {workflowMetadata.targetUsers && (
                    <div className="flex items-start gap-2">
                      <UserPlus className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">Assign to: </span>
                        <span className="text-muted-foreground">
                          {workflowMetadata.targetUsers}
                          {workflowMetadata.targetUserCount && workflowMetadata.targetUserCount > 1 && (
                            <Badge variant="outline" className="ml-1 text-[10px] h-4 px-1">
                              {workflowMetadata.targetUserCount} users
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Approval creation time */}
                  {workflowMetadata.requestedAt && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">Created: </span>
                        <span className="text-muted-foreground">
                          {workflowMetadata.requestedAt}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Business justification - highlighted box */}
                {workflowMetadata.justification && (
                  <div className="bg-muted/50 dark:bg-muted/20 rounded-md p-2.5 border-l-2 border-primary/50">
                    <div className="flex items-start gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary/70 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-foreground">Business Justification</span>
                        <p className="text-xs text-muted-foreground mt-0.5 italic leading-relaxed">
                          &quot;{workflowMetadata.justification}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Deadline - urgent styling */}
                {workflowMetadata.deadlineAt && (
                  <div className={cn(
                    "flex items-center gap-2 text-xs px-2 py-1.5 rounded-md",
                    "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-800"
                  )}>
                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium text-amber-700 dark:text-amber-300">
                      {workflowMetadata.deadlineAt}
                    </span>
                  </div>
                )}
                
                {/* Fallback to basic info if no rich context */}
                {!workflowMetadata.roleName && !workflowMetadata.targetUsers && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Workflow:</span> {workflowMetadata.workflowName}
                  </p>
                )}
              </div>
            )}
            
            {/* Regular notification details */}
            {!workflowMetadata && notification.details && (
              <p className="text-xs mb-3 line-clamp-2 leading-relaxed">
                {notification.details}
              </p>
            )}
            
            {/* View in My Tasks button for workflow approvals */}
            {isWorkflowApproval && workflowMetadata && approvalDetails?.decision === 'PENDING' && (
              <div className="flex flex-col gap-2 mb-3 pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/responsibilities/tasks');
                  }}
                  className="h-9 text-xs gap-2 w-full justify-between bg-primary/5 hover:bg-primary/10 border-primary/20"
                >
                  <span className="font-medium">View in My Tasks</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Already actioned notification - show status */}
            {isWorkflowApproval && workflowMetadata && approvalDetails?.decision !== 'PENDING' && (
              <div className="flex items-center gap-2 mb-2 pt-2 border-t border-border/50">
                <Badge variant={approvalDetails?.decision === 'APPROVED' ? 'default' : 'destructive'} className="text-xs">
                  {approvalDetails?.decision === 'APPROVED' ? 'Approved' : 'Rejected'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Action completed
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs ">
                  {formatTime(notification.createdAt)}
                </span>
                {notification.operation && (
                  <Badge variant="outline" className="text-xs">
                    {notification.operation}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {onTogglePin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(notification.id);
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                    title={notification.isPinned ? "Unpin notification" : "Pin notification"}
                  >
                    {notification.isPinned ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </Button>
                )}
                {!notification.isViewed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      console.log('Eye button clicked for notification:', notification.id);
                      e.stopPropagation();
                      onMarkAsViewed(notification.id);
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    title="Mark as viewed"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface EmptyStateProps {
  type: 'all' | 'new' | 'pinned';
  notificationType: NotificationData['type'];
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, notificationType }) => {
  const getIcon = () => {
    if (type === 'pinned') {
      return <Pin className="h-12 w-12 text-muted-foreground/50" />;
    }
    if (type === 'new') {
      return <div className="relative">
        <Bell className="h-12 w-12 text-muted-foreground/50" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
      </div>;
    }

    // Default for 'all'
    switch (notificationType) {
      case 'NOTIFICATIONS':
        return <Bell className="h-12 w-12 text-muted-foreground/50" />;
      case 'ANNOUNCEMENTS':
        return <Megaphone className="h-12 w-12 text-muted-foreground/50" />;
      case 'ALERTS':
        return <TriangleAlert className="h-12 w-12 text-muted-foreground/50" />;
      default:
        return <Bell className="h-12 w-12 text-muted-foreground/50" />;
    }
  };

  const getMessage = () => {
    if (type === 'pinned') {
      return 'No pinned notifications';
    }
    if (type === 'new') {
      return 'No new notifications';
    }
    return 'No notifications yet';
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {getIcon()}
      <p className="mt-4 text-sm font-medium text-foreground/80">
        {getMessage()}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {type === 'pinned'
          ? 'Pin important notifications to keep them handy'
          : type === 'new'
            ? 'New notifications will appear here'
            : 'You\'ll see notifications here when they arrive'
        }
      </p>
    </div>
  );
};

interface NotificationDropdownProps {
  type: 'NOTIFICATIONS' | 'ANNOUNCEMENTS' | 'ALERTS';
  icon: React.ReactNode;
  title: string;
  count: number;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  type,
  icon,
  title,
  count,
}) => {
  const { notifications, markAsViewed, togglePin, connectionError, isConnected } = useNotifications();
  const { isAuthenticated, isLoading } = useAuthContext();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'pinned'>('all');

  // Filter notifications by type
  const filteredNotifications = notifications.filter(n => {
    // Type must match
    if (n.type !== type) {
      return false;
    }
    
    // Filter out viewed workflow notifications
    // These are one-time action notifications that should disappear after viewing
    const workflowOperations = [
      'WORKFLOW_APPROVAL_REQUESTED',
      'WORKFLOW_APPROVAL_APPROVED', 
      'WORKFLOW_APPROVAL_REJECTED',
      'WORKFLOW_APPROVAL_COMPLETED'
    ];
    
    if (workflowOperations.includes(n.operation || '') && n.isViewed) {
      return false;
    }
    
    return true;
  });

  // Partition notifications into categories
  const allNotifications = filteredNotifications;
  const pinnedNotifications = filteredNotifications.filter(n => n.isPinned);
  const newNotifications = filteredNotifications.filter(n => !n.isViewed);

  const handleMarkAsViewed = async (id: string) => {
    try {
      await markAsViewed(id);
    } catch (error) {
      console.error('Failed to mark notification as viewed:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as viewed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await togglePin(id);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast({
        title: "Error",
        description: "Failed to update notification pin status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markAllAsViewed = async () => {
    try {
      const unviewedNotifications = newNotifications;
      const promises = unviewedNotifications.map(n => markAsViewed(n.id));
      await Promise.all(promises);
      toast({
        title: "Success",
        description: `Marked ${unviewedNotifications.length} notification(s) as read.`,
      });
    } catch (error) {
      console.error('Failed to mark all as viewed:', error);
      toast({
        title: "Error",
        description: "Some notifications could not be marked as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderNotificationList = (notificationList: NotificationData[], emptyStateType: 'all' | 'new' | 'pinned') => {
    if (notificationList.length === 0) {
      return <EmptyState type={emptyStateType} notificationType={type} />;
    }

    return (
      <div className="divide-y">
        {notificationList.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsViewed={handleMarkAsViewed}
            onTogglePin={handleTogglePin}
          />
        ))}
      </div>
    );
  };

  const getTabCounts = () => ({
    all: allNotifications.length,
    new: newNotifications.length,
    pinned: pinnedNotifications.length,
  });

  const tabCounts = getTabCounts();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative "
        >
          {icon}
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[32rem] max-h-[40rem] p-0"
        align="end"
        sideOffset={5}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DropdownMenuLabel className="p-0 text-base font-semibold">
                {title}
              </DropdownMenuLabel>
              {newNotifications.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {newNotifications.length} new
                </Badge>
              )}
            </div>
            {newNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsViewed}
                className="h-8 text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
          {!isConnected && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></div>
              {!isAuthenticated && !isLoading
                ? 'Please log in to view notifications'
                : isLoading
                  ? 'Loading...'
                  : connectionError || 'Connecting to real-time updates...'}
            </div>
          )}
          {isConnected && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              Real-time updates active
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'new' | 'pinned')} className="w-full">
          <div className="px-4 pt-2 border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="relative">
                All
                {tabCounts.all > 0 && (
                  <Badge variant="outline" className="ml-1 h-5 text-xs">
                    {tabCounts.all}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="new" className="relative">
                New
                {tabCounts.new > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 text-xs">
                    {tabCounts.new}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pinned" className="relative">
                Pinned
                {tabCounts.pinned > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {tabCounts.pinned}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-96 overflow-y-auto">
            <TabsContent value="all" className="mt-0 p-0">
              {renderNotificationList(allNotifications, 'all')}
            </TabsContent>

            <TabsContent value="new" className="mt-0 p-0">
              {renderNotificationList(newNotifications, 'new')}
            </TabsContent>

            <TabsContent value="pinned" className="mt-0 p-0">
              {renderNotificationList(pinnedNotifications, 'pinned')}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* <div className="p-3 border-t bg-gray-50">
          <Button
            variant="ghost"
            className="w-full text-sm hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
              // Navigate to full notifications page if it exists
              console.log(`Navigate to ${type.toLowerCase()} page`);
            }}
          >
            View all {title.toLowerCase()}
          </Button>
        </div> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
