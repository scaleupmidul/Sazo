


import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Search, Trash2, RefreshCcw } from 'lucide-react';
import TableSkeleton from '../../components/admin/TableSkeleton';

// Helper to format date and time in Bangladesh Time
const getFormattedDateTime = (isoString?: string) => {
    if (!isoString) return { date: 'N/A', time: '' };
    const dateObj = new Date(isoString);
    
    // Format Date: 24 Nov 2025
    const date = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Dhaka'
    });

    // Format Time: 05:30 PM
    const time = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Dhaka'
    });

    return { date, time };
};

const AdminPaymentInfoPage: React.FC = () => {
    // Use dedicated paymentRecords state instead of shared orders state
    const { paymentRecords, paymentRecordsPagination, loadPaymentRecords, deleteOrder } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Safe access to paymentRecords
    const safeRecords = Array.isArray(paymentRecords) ? paymentRecords : [];

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchOnlineOrders = async () => {
        setIsLoading(true);
        try {
            await loadPaymentRecords(currentPage, debouncedSearchTerm);
        } catch (error) {
            console.error("Error fetching payment records:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch ONLY Online orders
    useEffect(() => {
        fetchOnlineOrders();
    }, [currentPage, debouncedSearchTerm, loadPaymentRecords]);

    const handleDelete = async (orderId: string) => {
        if (window.confirm('Are you sure you want to delete this payment record and its associated order?')) {
            await deleteOrder(orderId);
            // Refetch current page
            await fetchOnlineOrders();
        }
    };

    const PaginationControls = () => {
        const { page, pages, total } = paymentRecordsPagination;
        if (pages <= 1 && total === 0) return null;
    
        return (
            <div className="flex justify-between items-center mt-6 text-sm">
                <span className="text-gray-600">Total Records: {total}</span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={page === 1}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <span className="font-medium text-gray-700">Page {page} of {pages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(pages, p + 1))} 
                        disabled={page === pages}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Online Payment Records</h1>
                <div className="flex gap-2 w-full md:w-auto">
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
                    <button 
                        onClick={fetchOnlineOrders}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm transition-colors"
                        title="Refresh Records"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
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
                    {isLoading ? (
                         <TableSkeleton cols={8} rows={10} />
                    ) : (
                        <tbody>
                            {safeRecords.length > 0 ? safeRecords.map(order => {
                                // For new orders with deliveryCharge field
                                // For older orders, fallback to calculating (Total - Cart Subtotal)
                                const cartSubtotal = order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                                const deliveryCharge = (typeof order.deliveryCharge === 'number') 
                                    ? order.deliveryCharge 
                                    : (order.total - cartSubtotal);

                                const { date, time } = getFormattedDateTime(order.createdAt || order.date);

                                return (
                                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.orderId || order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-700">{date}</span>
                                                <span className="text-xs text-gray-500">{time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{order.customerName}</div>
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
                                    <td colSpan={8} className="text-center py-10 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="w-8 h-8 mb-2 opacity-20" />
                                            <p>No online payment records found.</p>
                                        </div>
                                    </td>
                            </tr>
                            )}
                        </tbody>
                    )}
                </table>
            </div>
            
            <PaginationControls />
        </div>
    );
};

export default AdminPaymentInfoPage;
