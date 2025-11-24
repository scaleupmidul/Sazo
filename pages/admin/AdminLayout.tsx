import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, ListOrdered, LogOut, Menu, X, MessageSquare, Settings, CreditCard, ChevronRight, User } from 'lucide-react';
import { useAppStore } from '../../store';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavLinkProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
    notificationCount?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ icon: Icon, label, isActive, onClick, notificationCount = 0 }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between px-4 py-3.5 mx-2 rounded-xl transition-all duration-200 group ${
        isActive 
        ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </div>
    {notificationCount > 0 && (
      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ring-2 ring-slate-900">
        {notificationCount}
      </span>
    )}
  </button>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { navigate, logout, contactMessages, path, settings } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const unreadMessagesCount = contactMessages.filter(msg => !msg.isRead).length;

  const handleNav = (route: string) => {
    navigate(route);
    setIsSidebarOpen(false);
  }

  const isActive = (route: string) => path === route;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Logo Area */}
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="text-white font-bold text-xl">S</span>
        </div>
        <div>
            <h1 className="text-xl font-bold text-white tracking-tight">SAZO</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
        </div>
        <NavLink isActive={isActive('/admin/dashboard')} icon={LayoutDashboard} label="Dashboard" onClick={() => handleNav('/admin/dashboard')} />
        <NavLink isActive={isActive('/admin/products')} icon={ShoppingBag} label="Products" onClick={() => handleNav('/admin/products')} />
        <NavLink isActive={isActive('/admin/orders')} icon={ListOrdered} label="Orders" onClick={() => handleNav('/admin/orders')} />
        
        <div className="px-4 pb-2 pt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</p>
        </div>
        <NavLink isActive={isActive('/admin/messages')} icon={MessageSquare} label="Messages" onClick={() => handleNav('/admin/messages')} notificationCount={unreadMessagesCount} />
        <NavLink isActive={isActive('/admin/payment-info')} icon={CreditCard} label="Transactions" onClick={() => handleNav('/admin/payment-info')} />
        <NavLink isActive={isActive('/admin/settings')} icon={Settings} label="Settings" onClick={() => handleNav('/admin/settings')} />
      </nav>

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group cursor-pointer" onClick={logout}>
            <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 ring-2 ring-slate-800">
                    <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white group-hover:text-pink-400 transition-colors">Admin</span>
                    <span className="text-xs text-slate-500">Sign Out</span>
                </div>
            </div>
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-500 transition-colors" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 w-72 h-full shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
            <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-slate-800">SAZO Admin</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 active:bg-slate-200">
                <Menu className="w-6 h-6" />
            </button>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
             {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
