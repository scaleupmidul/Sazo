
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType | null;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const Icon = isSuccess ? CheckCircle : XCircle;
  const bgColor = isSuccess ? 'bg-pink-100' : 'bg-red-100';
  const textColor = isSuccess ? 'text-pink-800' : 'text-red-700';

  return (
    <div className={`fixed top-5 right-5 left-5 sm:left-auto max-w-sm mx-auto sm:mx-0 z-50 p-3 sm:p-4 rounded-lg shadow-xl flex items-center space-x-3 transition-opacity duration-300 animate-slideIn ${bgColor} ${textColor}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{notification.message}</span>
    </div>
  );
};

export default Notification;
