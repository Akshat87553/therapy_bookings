// src/pages/Notifications.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import NotificationItem from '../components/notifications/NotificationItem';
import axios from 'axios';
import { LucideIcon } from 'lucide-react';

interface Notification {
  _id: string;
  type:
    | 'new_user'
    | 'payment_received'
    | 'appointment_created'
    | 'appointment_reminder'
    | 'appointment_reschedule';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  new_user: User,
  payment_received: CheckCircle,
  appointment_created: Calendar,
  appointment_reminder: Clock,
  appointment_reschedule: AlertCircle,
};

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get<Notification[]>(
          'http://localhost:5000/api/notifications',
          { withCredentials: true }
        );
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Handler: mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/notifications/read-all',
        {},
        { withCredentials: true }
      );
      // Optimistically update UI:
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  // Handler: mark single as read
  const markOneAsRead = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking one as read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return <div className="p-6">Loading notifications…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-olive-700 hover:text-olive-800 text-sm font-medium"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <span className="font-medium text-gray-800">Recent notifications</span>
          <span className="text-sm text-gray-500">{unreadCount} unread</span>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={{
                  id: notification._id,
                  type: notification.type,
                  title: notification.title,
                  message: notification.message,
                  time: new Date(notification.createdAt).toLocaleString(),
                  read: notification.read,
                  icon: iconMap[notification.type] || AlertCircle,
                }}
                onMarkAsRead={() => markOneAsRead(notification._id)}
              />
            ))
          ) : (
            <div className="px-6 py-4 text-gray-500">No notifications</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
