
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { Search, Trash2 } from 'lucide-react';
import TableSkeleton from '../../components/admin/TableSkeleton';

const AdminPaymentInfoPage: React.FC = () => {
    const { orders, ordersPagination, loadAdminOrders, deleteOrder } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch ONLY Online orders
    useEffect(() => {
        const fetchOnlineOrders = async () => {
            setIsLoading(true);
            await loadAdminOrders(currentPage, debouncedSearchTerm, 'Online');
            setIsLoading(false);
        };
        fetchOnlineOrders();
    }, [currentPage, debouncedSearchTerm, loadAdminOrders]);

    const handleDelete = async (orderId: string) => {
        if (window.confirm('Are you sure you want to delete this payment record and its associated order?')) {
            await deleteOrder(orderId);
            // Refetch current page
            await loadAdminOrders(currentPage, debouncedSearchTerm, 'Online');
        }
    };

    const PaginationControls = () => {
        const { page, pages, total } = ordersPagination;
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
                    {isLoading ? (
                         <TableSkeleton cols={8} rows={10} />
                    ) : (
                        <tbody>
                            {orders.length > 0 ? orders.map(order => {
                                const cartSubtotal = order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                                const deliveryCharge = order.total - cartSubtotal;

                                return (
                                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.orderId || order.id}</td>
                                        <td className="px-6 py-4">{order.date}</td>
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
                                    <td colSpan={8} className="text-center py-10 text-gray-500">No online payment records found.</td>
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
