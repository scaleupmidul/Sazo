
import React, { useState, useMemo } from 'react';
// FIX: Corrected the import path for `useAppStore` from the non-existent 'StoreContext.tsx' to the correct location 'store/index.ts'.
import { useAppStore } from '../../store';
import { Order } from '../../types';
import { Search, Trash2 } from 'lucide-react';

const AdminPaymentInfoPage: React.FC = () => {
    const { orders, deleteOrder } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');

    const paymentRecords = useMemo(() => {
        return orders
            .filter(order => order.paymentMethod === 'Online' && order.paymentDetails)
            .sort((a, b) => {
                // Sort by Date Descending (Newest first)
                // Use createdAt for better precision if available
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
                return timeB - timeA;
            });
    }, [orders]);

    const filteredRecords = useMemo(() => {
        if (!searchTerm) return paymentRecords;
        return paymentRecords.filter(order =>
            (order.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.paymentDetails?.transactionId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (order.paymentDetails?.paymentNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
    }, [paymentRecords, searchTerm]);

    const handleDelete = (orderId: string) => {
        if (window.confirm('Are you sure you want to delete this payment record and its associated order? This action cannot be undone.')) {
            deleteOrder(orderId);
        }
    };

    const formatOrderDateTime = (order: Order) => {
        const dateSource = order.createdAt || order.date;
        const date = new Date(dateSource);
        
        // If date is invalid (e.g. parsing issue), return original string
        if (isNaN(date.getTime())) {
            return { date: order.date, time: '' };
        }
  
        const dateStr = date.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            timeZone: 'Asia/Dhaka'
        });
        
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true,
            timeZone: 'Asia/Dhaka'
        });
  
        return { date: dateStr, time: timeStr };
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
                <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 border rounded-lg text-sm bg-white text-black"
                    />
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Method</th>
                            <th scope="col" className="px-6 py-3">Sender No.</th>
                            <th scope="col" className="px-6 py-3">TxID</th>
                            <th scope="col" className="px-6 py-3">Delivery Charge</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? filteredRecords.map(order => {
                            const cartSubtotal = order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                            // Prefer the explicitly stored shippingCharge. 
                            // If missing (old records), fallback to calculation: Total - Subtotal
                            // If online payment where total == subtotal, fallback will be 0, which is correct for legacy data logic
                            const deliveryCharge = order.shippingCharge !== undefined 
                                ? order.shippingCharge 
                                : (order.total - cartSubtotal);

                            const { date, time } = formatOrderDateTime(order);
                            const fullName = `${order.firstName} ${order.lastName || ''}`.trim();

                            return (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.orderId || order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{date}</div>
                                        {time && <div className="text-xs text-gray-500">{time}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{fullName}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">{order.paymentDetails?.method}</td>
                                    <td className="px-6 py-4">{order.paymentDetails?.paymentNumber}</td>
                                    <td className="px-6 py-4 text-gray-800 font-mono text-xs">{order.paymentDetails?.transactionId}</td>
                                    <td className="px-6 py-4 font-semibold">৳{deliveryCharge.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(order.id)}
                                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                                            aria-label="Delete Record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                           <tr>
                                <td colSpan={8} className="text-center py-10 text-gray-500">No online payment records found.</td>
                           </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPaymentInfoPage;
