import React, { memo } from 'react';
import { useAppStore } from '../store';

const MessageIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-9 h-9"
    >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
);

const WhatsAppButton: React.FC = () => {
    const whatsappNumber = useAppStore(state => state.settings.whatsappNumber);

    if (!whatsappNumber || whatsappNumber.trim() === '') {
        return null;
    }

    // Clean the number: remove all non-digit characters
    const cleanPhoneNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="group fixed bottom-8 right-6 z-50 flex items-center"
        >
            {/* Text Bubble - Hidden on mobile (below sm breakpoint) */}
            <div className="hidden sm:block absolute right-full mr-3 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-lg opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 transform scale-95 group-hover:scale-100 origin-right">
                Do you want to know anything!
            </div>
            
            {/* Pink Button */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-white shadow-xl transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-2xl animate-pulse-whatsapp">
                <MessageIcon />
            </div>
        </a>
    );
};

export default memo(WhatsAppButton);