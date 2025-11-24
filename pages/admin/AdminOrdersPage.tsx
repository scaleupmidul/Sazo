

import React, { useState, useEffect, useMemo } from 'react';
import { Order, CartItem, OrderStatus } from '../../types';
import { Search, X, Trash2, ChevronLeft, ChevronRight, User, MapPin, Phone, Calendar, CreditCard, Eye, RefreshCcw } from 'lucide-react';
import { useAppStore } from '../../store';
import TableSkeleton from '../../components/admin/TableSkeleton';

const getStatusBadge = (status: OrderStatus) => {
    const styles = {
        'Pending': 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
        'Confirmed': 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
        'Shipped': 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
        'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
        'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    };
    const style = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.replace('bg-', 'bg-current text-opacity-50 ')}`}></span>
            {status}
        </span>
    );
}

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, updateOrderStatus, deleteOrder }) => {
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await updateOrderStatus(order.id, e.target.value as OrderStatus);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
            await deleteOrder(order.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleIn">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-800">Order #{order.orderId || order.id}</h2>
                        {getStatusBadge(order.status)}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar bg-white">
                    {/* Customer & Order Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                <User className="w-4 h-4 text-pink-600" /> Customer Details
                            </h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{order.customerName}</p>
                                        <p className="text-xs text-slate-500">Customer</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{order.phone}</p>
                                        <p className="text-xs text-slate-500">Contact</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{order.address}</p>
                                        {order.city && <p className="text-xs text-slate-500">{order.city}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-pink-600" /> Order Info
                            </h3>
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 flex items-center gap-2"><Calendar className="w-3.5 h-3.5"/> Date</span>
                                    <span className="text-sm font-medium text-slate-800">{order.date}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">Payment</span>
                                    <span className="text-sm font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{order.paymentMethod}</span>
                                </div>
                                 <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                                    <span className="text-sm font-bold text-slate-700">Update Status</span>
                                    <select 
                                        value={order.status} 
                                        onChange={handleStatusChange} 
                                        className="text-sm border-slate-300 rounded-lg shadow-sm focus:border-pink-500 focus:ring-pink-500 py-1.5 pl-3 pr-8 bg-white"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Order Items</h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">Size</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-4 py-3 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(order.cartItems || []).map((item: CartItem, index) => (
                                        <tr key={`${item.id}-${index}`} className="bg-white">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                                    <span className="font-medium text-slate-900">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{item.size}</td>
                                            <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-700">Total Amount</td>
                                        <td className="px-4 py-3 text-right font-bold text-pink-600 text-lg">৳{order.total.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <button onClick={handleDelete} className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-2 px-3 py-2 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4"/> Delete Order
                    </button>
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminOrdersPage: React.FC = () => {
  const { orders, ordersPagination, loadAdminOrders, updateOrderStatus, deleteOrder } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Use ID tracking instead of object reference to prevent render loops
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // SAFEGUARD: Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  const selectedOrder = useMemo(() => safeOrders.find(o => o.id === selectedOrderId), [safeOrders, selectedOrderId]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
        await loadAdminOrders(currentPage, debouncedSearchTerm);
    } catch (error) {
        console.error("Error fetching orders:", error);
    } finally {
        setIsLoading(false);
    }
  };

  // Fetch orders when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearchTerm, loadAdminOrders]);

  const PaginationControls = () => {
    const { page, pages, total } = ordersPagination;
    if (pages <= 1 && total === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <p className="text-sm text-slate-500">
                Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, total)}</span> of <span className="font-medium">{total}</span> results
            </p>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm">{page} of {pages}</span>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(pages, p + 1))} 
                    disabled={page === pages}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                <p className="text-slate-500 text-sm mt-1">Track and manage customer orders.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                 <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Search by name, phone or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all shadow-sm"
                    />
                </div>
                <button 
                    onClick={fetchOrders}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-sm transition-colors"
                    title="Refresh Orders"
                >
                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Order ID</th>
                            <th className="px-6 py-4 font-semibold">Customer</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Total</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    {isLoading ? (
                        <TableSkeleton cols={6} rows={10} />
                    ) : (
                        <tbody className="divide-y divide-slate-100">
                            {safeOrders.length > 0 ? (
                                safeOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedOrderId(order.id)}>
                                        <td className="px-6 py-4 font-medium text-slate-700 group-hover:text-pink-600 transition-colors">#{order.orderId || order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 font-medium">{order.customerName}</div>
                                            <div className="text-xs text-slate-500">{order.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{order.date}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">৳{order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedOrderId(order.id); }}
                                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="w-10 h-10 mb-2 opacity-20" />
                                            <p>No orders found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
        
        <PaginationControls />

        {selectedOrder && (
            <OrderDetailsModal 
                order={selectedOrder} 
                onClose={() => setSelectedOrderId(null)} 
                updateOrderStatus={updateOrderStatus}
                deleteOrder={deleteOrder}
            />
        )}
    </div>
  );
};

export default AdminOrdersPage;
