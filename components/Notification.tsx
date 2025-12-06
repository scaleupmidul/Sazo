import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType | null;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification) return null;

  // Determine icon based on type
  let Icon = CheckCircle;
  if (notification.type === 'error') Icon = AlertCircle;
  if (notification.type === 'info') Icon = Info;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] flex items-center px-4 py-3 rounded-lg border shadow-lg bg-pink-100 border-pink-400 text-pink-800 min-w-[300px] max-w-[90vw] animate-fadeIn transition-all duration-300">
      <Icon className="w-5 h-5 mr-3 flex-shrink-0 text-pink-600" />
      <span className="font-medium text-sm sm:text-base">{notification.message}</span>
    </div>
  );
};

export default Notification;
