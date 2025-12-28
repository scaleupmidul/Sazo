import React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { Notification as NotificationType } from '../types';

interface NotificationProps {
  notification: NotificationType | null;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  if (!notification) return null;

  const config = {
    success: {
      icon: Check,
      bgClass: 'bg-emerald-50',
      iconClass: 'text-emerald-600',
      labelClass: 'text-emerald-700',
      label: 'Success'
    },
    error: {
      icon: AlertCircle,
      bgClass: 'bg-rose-50',
      iconClass: 'text-rose-600',
      labelClass: 'text-rose-700',
      label: 'Error'
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      labelClass: 'text-blue-700',
      label: 'Info'
    }
  };

  const { icon: Icon, bgClass, iconClass, labelClass, label } = config[notification.type];

  return (
    <div className="fixed top-3 sm:top-5 left-1/2 transform -translate-x-1/2 z-[1000] animate-notification w-[90vw] max-w-[320px]">
      <div className="flex items-start gap-2.5 p-2.5 bg-white/95 backdrop-blur-xl border border-stone-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-xl">
        
        {/* Compact Icon - Aligned to start */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgClass} ${iconClass} flex-shrink-0 mt-0.5`}>
          <Icon size={16} strokeWidth={3} />
        </div>

        {/* Compact Text Content - Allowed to wrap */}
        <div className="flex flex-col justify-center min-w-0 py-0.5">
           <span className={`text-[9px] font-black uppercase tracking-[0.15em] leading-none mb-1.5 ${labelClass}`}>
             {label}
           </span>
           
           <span className="text-xs font-bold text-stone-800 leading-tight">
             {notification.message}
           </span>
        </div>

      </div>
      
      <style>{`
        @keyframes notification-in {
          0% { transform: translate(-50%, -120%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-notification {
          animation: notification-in 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards;
        }
      `}</style>
    </div>
  );
};

export default Notification;
