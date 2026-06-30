import React, { useState } from 'react';
import { Bell, Check, X, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNotificationStream, WorkflowNotification, NotificationAction } from '@/hooks/useNotificationStream';

/**
 * Workflow Notification Center Component
 * 
 * Displays real-time workflow notifications with action buttons
 * Supports approve, reject, and delegate actions for workflow approvals
 */
export function WorkflowNotificationCenter() {
  const { notifications, isConnected, clearNotification } = useNotificationStream({
    autoConnect: true,
    onNotification: (notif) => {
      console.log('New workflow notification:', notif);
    }
  });
  const { toast } = useToast();
  
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: NotificationAction | null;
    notificationId: string;
  }>({
    open: false,
    action: null,
    notificationId: ''
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActionClick = (action: NotificationAction, notificationId: string) => {
    if (action.requiresComment) {
      // Show dialog to collect comment
      setActionDialog({
        open: true,
        action,
        notificationId
      });
      setComment('');
    } else {
      // Execute action immediately
      executeAction(action, notificationId, '');
    }
  };

  const executeAction = async (action: NotificationAction, notificationId: string, commentText: string) => {
    setLoading(true);

    try {
      const jwt = localStorage.getItem('jwt');
      const userId = localStorage.getItem('userId') || 'testadmin'; // Get from auth context

      const response = await fetch(`http://localhost:8081${action.endpoint}`, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'X-User-ID': userId
        },
        body: JSON.stringify({ comment: commentText })
      });

      if (response.ok) {
        toast({
          title: `${action.label} Successful`,
          description: `Workflow approval ${action.label.toLowerCase()} completed successfully`,
        });

        // Remove notification from list
        clearNotification(notificationId);

        // Close dialog if open
        setActionDialog({ open: false, action: null, notificationId: '' });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to ${action.label.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Error executing ${action.label}:`, error);
      toast({
        title: `${action.label} Failed`,
        description: error instanceof Error ? error.message : `Failed to ${action.label.toLowerCase()}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'approve':
        return <Check className="h-4 w-4" />;
      case 'reject':
        return <X className="h-4 w-4" />;
      case 'delegate':
        return <UserPlus className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionVariant = (variant: string): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" => {
    switch (variant) {
      case 'success':
        return 'default'; // Use default for success (green)
      case 'danger':
        return 'destructive';
      case 'secondary':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Workflow Notifications</h2>
          {notifications.length > 0 && (
            <Badge variant="default">{notifications.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No workflow notifications
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      {notification.description}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {notification.details}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {notification.operation}
                  </Badge>
                </div>
              </CardHeader>

              {notification.actions && notification.actions.length > 0 && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={getActionVariant(action.variant)}
                        size="sm"
                        onClick={() => handleActionClick(action, notification.id)}
                        disabled={loading}
                        className="gap-2"
                      >
                        {getActionIcon(action.type)}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Received {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog (for actions requiring comments) */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !loading && setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action?.label}
            </DialogTitle>
            <DialogDescription>
              Please provide a comment for this action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment *</Label>
            <Textarea
              id="comment"
              placeholder="Enter your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: null, notificationId: '' })}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={getActionVariant(actionDialog.action?.variant || 'default')}
              onClick={() => {
                if (actionDialog.action && comment.trim()) {
                  executeAction(actionDialog.action, actionDialog.notificationId, comment);
                }
              }}
              disabled={loading || !comment.trim()}
            >
              {loading ? 'Processing...' : actionDialog.action?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
