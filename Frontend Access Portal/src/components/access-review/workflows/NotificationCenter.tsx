import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { notificationService } from '@/services/accessReviewService';
import type { NotificationConfig } from '@/types/accessReview';
import { toast } from 'sonner';

interface NotificationCenterProps {
  campaignId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ campaignId }) => {
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [campaignId]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(campaignId);
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await notificationService.updateNotificationConfig(id, { enabled });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, enabled } : n))
      );
      toast.success(enabled ? 'Notification enabled' : 'Notification disabled');
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      await notificationService.sendNotification(id);
      toast.success('Notification sent successfully');
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'slack':
        return <MessageSquare className="h-3 w-3" />;
      case 'in-app':
        return <Bell className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'bg-blue-100 text-blue-700';
      case 'escalation':
        return 'bg-red-100 text-red-700';
      case 'completion':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notification Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No notifications configured for this campaign
          </div>
        ) : (
          notifications.map(notif => (
            <Card key={notif.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(notif.type)} variant="secondary">
                        {notif.type}
                      </Badge>
                      <div className="flex gap-1">
                        {notif.channels.map(channel => (
                          <Badge key={channel} variant="outline" className="text-xs">
                            {getChannelIcon(channel)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-1">Schedule: {notif.schedule}</p>
                    <p className="text-xs text-muted-foreground">
                      Recipients: {notif.recipients.join(', ')}
                    </p>
                    {notif.lastSent && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last sent: {new Date(notif.lastSent).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch checked={notif.enabled} onCheckedChange={(checked) => handleToggle(notif.id, checked)} />
                    {notif.enabled && (
                      <Button size="sm" variant="outline" onClick={() => handleSendNow(notif.id)}>
                        <Send className="h-3 w-3 mr-1" />
                        Send Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Automated Notifications</p>
                <p className="text-xs text-blue-700 mt-1">
                  Notifications are sent automatically based on campaign configuration. Enable/disable as needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
