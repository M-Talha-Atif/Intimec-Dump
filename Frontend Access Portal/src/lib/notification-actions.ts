'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:8089/api/v1';
const AUTH_TOKEN_KEY = 'auth_token';

export interface ServerNotificationData {
  id: string;
  notificationId?: string;
  type: 'NOTIFICATIONS' | 'ANNOUNCEMENTS' | 'ALERTS';
  description: string;
  details?: string;
  operation?: string;
  isViewed: boolean;
}

/**
 * Server action to fetch notifications for a specific type
 */
export async function fetchNotificationsByType(type: 'notifications' | 'announcements' | 'alerts'): Promise<ServerNotificationData[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;
    
    if (!token) {
      console.log('Server: No auth token found');
      return [];
    }

    console.log(`Server: Fetching ${type} from ${API_URL}/user-notifications/${type}`);

    const response = await fetch(`${API_URL}/user-notifications/${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Server: Failed to fetch ${type}:`, response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log(`Server: Received ${type} data:`, data);
    return data.data || [];
  } catch (error) {
    console.error(`Server: Error fetching ${type}:`, error);
    return [];
  }
}

/**
 * Server action to fetch all notifications
 */
export async function fetchAllNotifications(): Promise<ServerNotificationData[]> {
  try {
    const [notifications, announcements, alerts] = await Promise.all([
      fetchNotificationsByType('notifications'),
      fetchNotificationsByType('announcements'),
      fetchNotificationsByType('alerts'),
    ]);

    const allNotifications = [...notifications, ...announcements, ...alerts];
    
    // Sort by newest first - since we don't have createdAt, keep original order
    return allNotifications;
  } catch (error) {
    console.error('Server: Error fetching all notifications:', error);
    return [];
  }
}

/**
 * Server action to mark a notification as viewed
 */
export async function markNotificationAsViewed(notificationId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_TOKEN_KEY)?.value;
    
    if (!token) {
      console.log('Server: No auth token found for mark as viewed');
      return false;
    }

    const response = await fetch(`${API_URL}/user-notifications/mark-viewed/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Server: Failed to mark notification as viewed:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Server: Error marking notification as viewed:', error);
    return false;
  }
}
