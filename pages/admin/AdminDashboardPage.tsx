
import React, { useState } from 'react';
import { Order } from '../../types';
import { 
    ShoppingBag, ListOrdered, DollarSign, CreditCard, RefreshCw, 
    TrendingUp, ArrowUpRight, ArrowDownRight, Package, 
    AlertCircle, Sparkles, User, ChevronRight, Phone, Wallet
} from 'lucide-react';
import { useAppStore } from '../../store';

const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'Confirmed': return 'bg-sky-50 text-sky-600 border-sky-100';
        case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        default: return 'bg-stone-50 text-stone-500 border-stone-100';
    }
}

const PrimaryStatCard: React.FC<{ title: string, value: string, icon: React.ElementType, trend?: string, color: 'pink' | 'purple' | 'blue' | 'orange' }> = ({ title, value, icon: Icon, trend, color }) => {
    const colorClasses = {
        pink: 'bg-pink-600 shadow-pink-200',
        purple: 'bg-purple-600 shadow-purple-200',
        blue: 'bg-blue-600 shadow-blue-200',
        orange: 'bg-orange-500 shadow-orange-200'
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-stone-50 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${colorClasses[color]}`}></div>
            
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl text-white shadow-lg ${colorClasses[color]}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">
                        <TrendingUp size={10} /> {trend}
                    </div>
                )}
            </div>
            
            <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.15em] mb-1">{title}</p>
            <p className="text-3xl font-black text-stone-900 tracking-tighter">{value}</p>
        </div>
    );
};

const SecondaryStatCard: React.FC<{ title: string, value: string | number, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 flex items-center gap-4 hover:bg-white hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-stone-100 text-stone-500">
            <Icon size={16} />
        </div>
        <div>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
            <p className="text-sm font-black text-stone-800 leading-none">{value}</p>
        </div>
    </div>
);

const CategoryPerformanceItem: React.FC<{ label: string, revenue: number, orders: number, icon: React.ElementType, color: string }> = ({ label, revenue, orders, icon: Icon, color }) => (
    <div className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-stone-100 hover:border-pink-200 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-pink-100/30">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div>
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-tight">{label}</h4>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{orders} Orders</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-black text-stone-900 tracking-tight">৳{revenue.toLocaleString()}</p>
            <div className="flex items-center justify-end gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                <ArrowUpRight size={10} /> Active
            </div>
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
    const { orders, navigate, dashboardStats, loadAdminData, notify } = useAppStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const stats = dashboardStats || {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        onlineTransactions: 0,
        outOfStockCount: 0,
        fashionRevenue: 0,
        cosmeticsRevenue: 0,
        fashionOrders: 0,
        cosmeticsOrders: 0,
        customerCount: 0
    };

    const recentOrders = [...orders].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
        return dateB - dateA;
    }).slice(0, 7);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadAdminData();
            notify("Dashboard metrics updated.", "success");
        } catch (e) {
            notify("Refresh failed.", "error");
        } finally {
            setIsRefreshing(false);
        }
    };

    // --- DYNAMIC INSIGHTS ENGINE ---
    const getSystemInsight = () => {
        if (stats.totalOrders === 0) return "Launch your first campaign to see sales insights here.";
        
        const fashionLead = stats.fashionRevenue > stats.cosmeticsRevenue;
        const avgOrder = stats.totalRevenue / stats.totalOrders;
        
        if (fashionLead) {
            return `Clothing is dominating with ৳${stats.fashionRevenue.toLocaleString()} in sales. Consider launching a new Winter collection soon.`;
        } else {
            return `Beauty Essentials are trending! Your cosmetics wing is generating high volume. Stock up on top-selling serums.`;
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto animate-fadeIn pb-24">
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase leading-none">
                        Pulse <span className="text-pink-600">Command</span>
                    </h1>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live System Stats
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                         <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Last Sync</span>
                         <span className="text-[11px] font-bold text-stone-500">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <button 
                        onClick={handleRefresh} 
                        disabled={isRefreshing}
                        className="bg-white border border-stone-200 p-3 rounded-2xl shadow-sm hover:shadow-xl hover:text-pink-600 transition-all active:scale-95 group"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <button onClick={() => navigate('/admin/orders')} className="bg-stone-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-stone-200 hover:bg-pink-600 transition-all active:scale-95">
                        Manage Orders
                    </button>
                </div>
            </div>

            {/* --- MAIN METRICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <PrimaryStatCard title="Gross Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="pink" trend="+12%" />
                <PrimaryStatCard title="Total Volume" value={stats.totalOrders.toLocaleString()} icon={ListOrdered} color="purple" trend="+8%" />
                <PrimaryStatCard title="Online Pay" value={stats.onlineTransactions.toLocaleString()} icon={Wallet} color="blue" />
                <PrimaryStatCard title="Inventory" value={stats.totalProducts.toLocaleString()} icon={Package} color="orange" />
            </div>

            {/* --- SECONDARY METRICS (SMART BAR) --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <SecondaryStatCard title="Stock Alerts" value={`${stats.outOfStockCount} Out`} icon={AlertCircle} />
                <SecondaryStatCard title="Avg Basket" value={`৳${stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}`} icon={TrendingUp} />
                <SecondaryStatCard title="Active Orders" value={orders.filter(o => o.status === 'Pending').length} icon={Sparkles} />
                <SecondaryStatCard title="Unique Buyers" value={stats.customerCount || 0} icon={User} />
            </div>

            {/* --- CORE DATA SPLIT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* CATEGORY BREAKDOWN */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Performance Split</h3>
                        <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest bg-pink-50 px-2 py-0.5 rounded">Real-time</span>
                    </div>
                    <div className="space-y-4">
                        <CategoryPerformanceItem 
                            label="Fashion Studio" 
                            revenue={stats.fashionRevenue} 
                            orders={stats.fashionOrders} 
                            icon={Package} 
                            color="bg-purple-50 text-purple-600"
                        />
                        <CategoryPerformanceItem 
                            label="Beauty Rituals" 
                            revenue={stats.cosmeticsRevenue} 
                            orders={stats.cosmeticsOrders} 
                            icon={Sparkles} 
                            color="bg-pink-50 text-pink-600"
                        />
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl text-white relative overflow-hidden group shadow-2xl">
                         <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-pink-600/10 transition-all duration-700"></div>
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-4 relative z-10">AI Merchant Insights</h4>
                         <p className="text-sm font-bold leading-relaxed text-stone-200 relative z-10">
                             {getSystemInsight()}
                         </p>
                         <button onClick={() => navigate('/admin/products')} className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-pink-400 hover:text-pink-300 transition-colors relative z-10">
                             Optimise Inventory <ChevronRight size={12} />
                         </button>
                    </div>
                </div>

                {/* RECENT ORDERS TABLE */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Incoming Pipeline</h3>
                        <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-pink-600 transition-colors">See all history</button>
                    </div>
                    
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-stone-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50/50 border-b border-stone-100">
                                    <tr>
                                        <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Identification</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Merchant Data</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Product Value</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-stone-400 uppercase tracking-[0.15em]">Pipeline Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group cursor-pointer" onClick={() => navigate('/admin/orders')}>
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-xs font-black text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg">#{order.orderId || order.id.slice(-6)}</span>
                                                <div className="text-[10px] text-stone-400 mt-2 font-bold uppercase tracking-tighter">{order.date}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-black text-stone-900 text-sm uppercase tracking-tight">{order.firstName} {order.lastName}</div>
                                                <div className="flex items-center gap-2 mt-1 text-stone-400">
                                                    <Phone size={10} />
                                                    <span className="text-[11px] font-bold">{order.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-black text-stone-900 text-base tracking-tighter">৳{(order.total - (order.shippingCharge || 0)).toLocaleString()}</div>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {order.paymentMethod === 'Online' ? (
                                                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-blue-100">Paid Advance</span>
                                                    ) : (
                                                        <span className="text-[9px] font-black bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">COD</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1.5 text-[9px] font-black rounded-xl uppercase tracking-widest border shadow-sm ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-20">
                                                    <Package size={40} />
                                                    <span className="text-xs font-black uppercase tracking-widest">No active orders found</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboardPage;
