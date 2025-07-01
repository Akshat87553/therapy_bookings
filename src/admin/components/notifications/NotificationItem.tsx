import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: LucideIcon;
  };
  onMarkAsRead: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  // Define color scheme based on notification type
  const getColorScheme = (type: string) => {
    switch (type) {
      case 'appointment_created':
      case 'appointment_reminder':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-500',
        };
      case 'payment_received':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-500',
        };
      case 'new_client':
        return {
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-500',
        };
      case 'system':
        return {
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-500',
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-500',
        };
    }
  };
  
  const { bgColor, textColor } = getColorScheme(notification.type);
  const Icon = notification.icon;
  
  return (
    <div className={`px-6 py-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="flex items-start">
        <div className={`p-2 rounded-full ${bgColor} mr-4`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h4 className={`font-medium ${notification.read ? 'text-gray-800' : 'text-black'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {notification.time}
            </span>
          </div>
          <p className={`mt-1 text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800'}`}>
            {notification.message}
          </p>
          {!notification.read && (
        <button onClick={onMarkAsRead}>Mark as Read</button>
      )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;