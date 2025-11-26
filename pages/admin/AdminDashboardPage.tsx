
import React from 'react';
import { Order } from '../../types';
import { ShoppingBag, ListOrdered, DollarSign, CreditCard } from 'lucide-react';
import { useAppStore } from '../../store';

const getStatusColor = (status: Order['status']) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Confirmed': return 'bg-blue-100 text-blue-800';
        case 'Shipped': return 'bg-indigo-100 text-indigo-800';
        case 'Delivered': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-pink-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-pink-600" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminDashboardPage: React.FC = () => {
    const { products, orders, navigate, dashboardStats } = useAppStore();
    
    // Use server-side stats if available for 100% accuracy across all records
    // Fallback to 0 if loading or not set
    const totalRevenue = dashboardStats?.totalRevenue ?? 0;
    const totalOrdersCount = dashboardStats?.totalOrders ?? 0;
    const totalProductsCount = dashboardStats?.totalProducts ?? 0;
    const onlineTransactionsCount = dashboardStats?.onlineTransactions ?? 0;

    // Recent orders still use the loaded orders array, which is fine for "Recent" lists
    // We sort by date descending to get the newest ones
    const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
    const recentPaymentRecords = orders
        .filter(o => o.paymentMethod === 'Online' && o.paymentDetails)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Products" value={totalProductsCount.toLocaleString()} icon={ShoppingBag} />
                <StatCard title="Total Orders" value={totalOrdersCount.toLocaleString()} icon={ListOrdered} />
                <StatCard title="Total Revenue" value={`৳${totalRevenue.toLocaleString('en-IN')}`} icon={DollarSign} />
                <StatCard title="Online Transactions" value={onlineTransactionsCount.toLocaleString()} icon={CreditCard} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Orders</h2>
                    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Total</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/admin/orders')}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.orderId || order.id}</td>
                                        <td className="px-6 py-4">{order.customerName}</td>
                                        <td className="px-6 py-4">৳{order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Payment Records</h2>
                    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                         <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">TxID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPaymentRecords.map(order => (
                                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/admin/payment-info')}>
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.orderId || order.id}</td>
                                        <td className="px-6 py-4">{order.customerName}</td>
                                        <td className="px-6 py-4 font-semibold">৳{order.paymentDetails?.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 truncate max-w-xs font-mono text-xs">{order.paymentDetails?.transactionId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
