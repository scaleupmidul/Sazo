
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
      bgClass: 'bg-emerald-50', // Soft premium green background
      iconClass: 'text-emerald-600',
      labelClass: 'text-emerald-700',
      label: 'Success'
    },
    error: {
      icon: AlertCircle, // Circle icon for error
      bgClass: 'bg-rose-50', // Soft premium red background
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
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-notification w-[92vw] max-w-[400px]">
      {/* Reduced padding (p-3) and gap (gap-3) for mobile, kept standard (sm:p-4) for larger screens */}
      <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/95 backdrop-blur-xl border border-stone-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
        
        {/* Icon Circle */}
        <div className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full ${bgClass} ${iconClass} flex-shrink-0 shadow-sm mt-0.5`}>
          <Icon size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
        </div>

        {/* Text Content */}
        <div className="flex flex-col justify-center pt-0.5">
           {/* Label (Success/Error) - Uppercase & Bold */}
           <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest leading-none mb-1 sm:mb-1.5 ${labelClass}`}>
             {label}
           </span>
           
           {/* Message - Clean sans-serif */}
           <span className="text-xs sm:text-[13px] font-semibold text-stone-700 leading-snug">
             {notification.message}
           </span>
        </div>

      </div>
    </div>
  );
};

export default Notification;
