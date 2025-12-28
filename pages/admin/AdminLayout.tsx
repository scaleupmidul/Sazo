
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ShoppingBag, ListOrdered, LogOut, Menu, X, MessageSquare, Settings, CreditCard, Bell } from 'lucide-react';
import { useAppStore } from '../../store';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NavLink: React.FC<{ icon: React.ElementType, label: string, onClick: () => void, notificationCount?: number }> = ({ icon: Icon, label, onClick, notificationCount = 0 }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200">
    <div className="flex items-center space-x-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    {notificationCount > 0 && (
      <span className="bg-pink-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
        {notificationCount}
      </span>
    )}
  </button>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { navigate, logout, contactMessages, newOrdersCount, loadAdminData, orders, notify } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const lastOrderCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // নোটিফিকেশন সাউন্ড সেটআপ (Shopify style "Cha-ching")
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    
    // ব্রাউজার নোটিফিকেশন পারমিশন চাওয়া
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // রিয়েল-টাইম অর্ডার চেকিং (প্রতি ৩০ সেকেন্ডে একবার)
  useEffect(() => {
    const interval = setInterval(() => {
      loadAdminData();
    }, 30000); 
    return () => clearInterval(interval);
  }, [loadAdminData]);

  // নতুন অর্ডার আসলে সাউন্ড এবং নোটিফিকেশন ট্রিগার
  useEffect(() => {
    if (newOrdersCount > lastOrderCountRef.current) {
      // সাউন্ড প্লে করা
      audioRef.current?.play().catch(e => console.log("Audio play failed, user interaction needed."));

      // ব্রাউজার পুশ নোটিফিকেশন পাঠানো
      if ("Notification" in window && Notification.permission === "granted") {
        const latestOrder = orders[0];
        new Notification("🚀 New Order Received!", {
          body: `${latestOrder?.firstName || 'A customer'} just placed an order for ৳${latestOrder?.total || ''}`,
          icon: 'https://i.ibb.co.com/ZRKmxrGb/SAZO-4.png'
        });
      }
      
      notify(`New Order Received! (#${orders[0]?.orderId})`, 'info');
    }
    lastOrderCountRef.current = newOrdersCount;
  }, [newOrdersCount, orders, notify]);

  const unreadMessagesCount = contactMessages.filter(msg => !msg.isRead).length;

  const handleNav = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 flex items-center justify-center gap-2">
        <h1 className="text-xl font-extrabold text-white">SAZO Admin</h1>
        <div className="relative">
           <Bell className={`w-4 h-4 text-pink-500 ${newOrdersCount > 0 ? 'animate-pulse' : ''}`} />
           {newOrdersCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full"></span>}
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink icon={LayoutDashboard} label="Dashboard" onClick={() => handleNav('/admin/dashboard')} />
        <NavLink icon={ShoppingBag} label="Products" onClick={() => handleNav('/admin/products')} />
        <NavLink icon={ListOrdered} label="Orders" onClick={() => handleNav('/admin/orders')} notificationCount={newOrdersCount} />
        <NavLink icon={MessageSquare} label="Messages" onClick={() => handleNav('/admin/messages')} notificationCount={unreadMessagesCount} />
        <NavLink icon={CreditCard} label="Transactions" onClick={() => handleNav('/admin/transactions')} />
        <NavLink icon={Settings} label="Settings" onClick={() => handleNav('/admin/settings')} />
      </nav>
      <div className="p-4 border-t border-gray-700">
        <NavLink icon={LogOut} label="Logout" onClick={logout} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-gray-800 text-white">
        <SidebarContent />
      </aside>

      <div className={`fixed inset-0 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-full bg-gray-800 text-white transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b md:hidden">
          <h1 className="text-xl font-bold text-pink-600">SAZO Admin</h1>
          <div className="flex items-center gap-4">
             {newOrdersCount > 0 && <span className="bg-pink-100 text-pink-600 text-[10px] font-black px-2 py-1 rounded-full animate-pulse">{newOrdersCount} NEW</span>}
             <button onClick={() => setIsSidebarOpen(true)} className="p-2">
                <Menu className="w-6 h-6 text-gray-600" />
             </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
