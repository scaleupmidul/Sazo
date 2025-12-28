
import React, { useState, useMemo, useEffect } from 'react';
import { Order, CartItem, OrderStatus } from '../../types';
import { Search, X, Trash2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store';

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Confirmed': return 'bg-blue-100 text-blue-800';
        case 'Shipped': return 'bg-indigo-100 text-indigo-800';
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
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

    // Display ID: Use orderId if available, otherwise fallback to system id
    const displayId = order.orderId || order.id;
    const shippingCharge = order.shippingCharge || 0;
    
    // FIX: Calculate products total by summing items directly to avoid negative values
    // caused by inconsistent total/shipping charge logic in different payment modes.
    const productsTotal = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const fullName = `${order.firstName} ${order.lastName || ''}`.trim();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-black">Order Details: {displayId}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto text-black">
                    {/* CUSTOMER & BILLING INFO GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-pink-600 mb-2 uppercase text-xs tracking-wider">Customer Information</h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold">Name:</span> {fullName}</p>
                                <p><span className="font-semibold">Email:</span> {order.email}</p>
                                <p><span className="font-semibold">Phone:</span> {order.phone}</p>
                                <p><span className="font-semibold">District:</span> {order.city}</p>
                                <p><span className="font-semibold">Address:</span> {order.address}</p>
                                {order.note && (
                                    <div className="mt-2 p-2 bg-stone-50 border border-stone-200 rounded text-stone-700 text-[11px]">
                                        <span className="font-bold uppercase text-[9px] block mb-0.5 text-stone-500">Customer Note:</span>
                                        {order.note}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-pink-600 mb-2 uppercase text-xs tracking-wider">Billing Details</h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold">Payment Method:</span> {
                                    order.paymentMethod === 'COD' 
                                        ? 'Cash on Delivery (COD)' 
                                        : `Online (${order.paymentDetails?.method || 'Advance'})`
                                }</p>
                                <p><span className="font-semibold">Delivery Charge:</span> ৳{shippingCharge.toLocaleString()}</p>
                                
                                {order.paymentMethod === 'Online' && order.paymentDetails && (
                                    <div className="mt-3 p-3 bg-pink-50 rounded-lg border border-pink-100 text-xs shadow-sm">
                                        <p className="font-bold text-pink-800 mb-1.5 uppercase tracking-tighter">Transaction Details</p>
                                        <div className="space-y-1">
                                            <p><span className="font-semibold text-stone-600">Sender:</span> {order.paymentDetails.paymentNumber}</p>
                                            <p><span className="font-semibold text-stone-600">TrxID:</span> <span className="font-mono bg-white px-1 border rounded">{order.paymentDetails.transactionId}</span></p>
                                            {/* UPDATED: Show delivery charge as the paid amount for online advance payments */}
                                            <p><span className="font-semibold text-stone-600">Paid:</span> ৳{shippingCharge.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-pink-600 mb-2 uppercase text-xs tracking-wider">Update Order Status</h3>
                        <select 
                            value={order.status} 
                            onChange={handleStatusChange} 
                            className="p-2 border rounded-lg w-full md:w-1/2 bg-white text-black focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="font-semibold text-pink-600 mb-3 uppercase text-xs tracking-wider">Items Ordered</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {(order.cartItems || []).map((item: CartItem) => (
                            <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4 border-b border-stone-50 pb-2 last:border-0">
                                <img src={item.image} alt={item.name} className="w-14 h-16 object-cover rounded shadow-sm border border-stone-100"/>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-stone-900 line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-stone-500">Size: {item.size} | Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-sm text-stone-800">৳{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                        </div>
                        
                        <div className="flex flex-col items-end mt-6 pt-4 border-t-2 border-stone-50">
                            <div className="w-full md:w-64 space-y-1.5 text-right">
                                <div className="font-extrabold text-2xl text-black">
                                    <span className="text-sm text-stone-500 font-bold uppercase mr-2">Products Total:</span>
                                    <span>৳{productsTotal.toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-stone-400 italic">Delivery charge (৳{shippingCharge}) is excluded from this total.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <button onClick={handleDelete} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition flex items-center space-x-2 active:scale-95 font-bold text-sm">
                        <Trash2 className="w-4 h-4"/>
                        <span>Delete Order</span>
                    </button>
                    <button onClick={onClose} className="bg-stone-800 text-white px-8 py-2 rounded-lg hover:bg-black transition font-bold active:scale-95 shadow-lg text-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, refreshOrders, markOrdersAsSeen } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    markOrdersAsSeen();
  }, [markOrdersAsSeen]);

  useEffect(() => {
    if (selectedOrder) {
      const updatedOrderInList = orders.find(o => o.id === selectedOrder.id);
      if (updatedOrderInList) {
        if (JSON.stringify(updatedOrderInList) !== JSON.stringify(selectedOrder)) {
            setSelectedOrder(updatedOrderInList);
        }
      } else {
        setSelectedOrder(null);
      }
    }
  }, [orders, selectedOrder]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm]);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refreshOrders();
      markOrdersAsSeen();
      setIsRefreshing(false);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      (order.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
        const dateComparison = timeB - timeA;
        if (dateComparison !== 0) return dateComparison;
        return b.id.localeCompare(a.id);
    });
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const formatOrderDateTime = (order: Order) => {
      const dateSource = order.createdAt || order.date;
      const date = new Date(dateSource);
      if (isNaN(date.getTime())) return { date: order.date, time: '' };
      const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });
      const hasTime = !!order.createdAt;
      const timeStr = hasTime ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Dhaka' }) : '';
      return { date: dateStr, time: timeStr };
  };

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-pink-50 hover:text-pink-600 rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-lg text-sm bg-white text-black shadow-sm outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500" />
            </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Products Total</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedOrders.map(order => {
                            const { date, time } = formatOrderDateTime(order);
                            const displayPrice = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
                            const fullName = `${order.firstName} ${order.lastName || ''}`.trim();
                            return (
                                <tr key={order.id} className="bg-white hover:bg-stone-50 cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)}>
                                    <td className="px-6 py-4 font-bold text-pink-600">#{order.orderId || order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{fullName}</div>
                                        <div className="text-[11px] text-gray-500">{order.phone} • {order.city}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{date}</div>
                                        {time && <div className="text-[10px] text-gray-400">{time}</div>}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">৳{displayPrice.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${getStatusColor(order.status)} shadow-sm border border-black/5`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm">
                <span className="text-gray-600">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold">Previous</button>
                    <span className="font-bold text-gray-700 mx-2">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold">Next</button>
                </div>
            </div>
        )}

        {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} updateOrderStatus={updateOrderStatus} deleteOrder={deleteOrder} />}
    </div>
  );
};

export default AdminOrdersPage;
