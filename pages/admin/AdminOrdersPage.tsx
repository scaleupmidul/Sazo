import React, { useState, useMemo, useEffect } from 'react';
import { Order, CartItem, OrderStatus } from '../../types';
import { Search, X, Trash2, RefreshCw } from 'lucide-react';
// FIX: Corrected the import path for `useAppStore` from the non-existent 'StoreContext.tsx' to the correct location 'store/index.ts'.
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

    // Calculate financials
    const productTotal = order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const deliveryCharge = order.shippingCharge ?? 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-black">Order Details: {displayId}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto text-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-pink-600 mb-2">Customer Information</h3>
                            <p className="text-sm"><span className="font-semibold">Name:</span> {order.customerName}</p>
                            <p className="text-sm"><span className="font-semibold">Phone:</span> {order.phone}</p>
                            <p className="text-sm"><span className="font-semibold">Address:</span> {`${order.address}, ${order.city}`}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-pink-600 mb-2">Order Status & Payment</h3>
                            <div className="space-y-3">
                                <select value={order.status} onChange={handleStatusChange} className="p-2 border rounded-lg w-full bg-white text-black text-sm">
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <p className="text-sm">
                                    <span className="font-semibold">Method:</span> {order.paymentMethod}
                                    {order.paymentMethod === 'Online' && order.paymentDetails && (
                                        <span className="block text-xs text-gray-500 mt-1">
                                            {order.paymentDetails.method} | TxID: {order.paymentDetails.transactionId}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-pink-600 mb-2">Items Ordered</h3>
                        <div className="space-y-2 border-t border-gray-100 pt-2">
                        {(order.cartItems || []).map((item: CartItem) => (
                            <div key={item.id} className="flex items-center space-x-4 border-b border-gray-50 pb-2 last:border-0">
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded"/>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-sm">৳{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                        </div>
                        
                        <div className="mt-4 space-y-1 text-right text-sm">
                            <div className="text-gray-600">Subtotal (Products): <span className="font-medium text-gray-900">৳{productTotal.toLocaleString()}</span></div>
                            <div className="text-gray-600">Delivery Charge: <span className="font-medium text-gray-900">৳{deliveryCharge.toLocaleString()}</span></div>
                            <div className="font-bold text-lg text-pink-600 border-t inline-block pt-1 mt-1">
                                Total Amount: ৳{order.total.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2 text-sm">
                        <Trash2 className="w-4 h-4"/>
                        <span>Delete Order</span>
                    </button>
                    <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition text-sm">
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    // Mark orders as seen when entering the page
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

  // Reset to first page when search term changes
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
      (order.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
        
        const dateComparison = timeB - timeA;
        if (dateComparison !== 0) return dateComparison;
        
        return b.id.localeCompare(a.id);
    });
  }, [orders, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const formatOrderDateTime = (order: Order) => {
      const dateSource = order.createdAt || order.date;
      const date = new Date(dateSource);
      
      if (isNaN(date.getTime())) {
          return { date: order.date, time: '' };
      }

      const dateStr = date.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          timeZone: 'Asia/Dhaka'
      });
      
      const hasTime = !!order.createdAt;
      const timeStr = hasTime ? date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true,
          timeZone: 'Asia/Dhaka'
      }) : '';

      return { date: dateStr, time: timeStr };
  };

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                <button 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-pink-50 hover:text-pink-600 rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh Orders List"
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text"
                    placeholder="Search by name or ID..."
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
                        <th scope="col" className="px-6 py-3">Customer</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Delivery</th>
                        <th scope="col" className="px-6 py-3">Products Total</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedOrders.map(order => {
                        const { date, time } = formatOrderDateTime(order);
                        const productTotal = order.cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                        const deliveryCharge = order.shippingCharge ?? 0;

                        return (
                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                <td className="px-6 py-4 font-medium text-gray-900">{order.orderId || order.id}</td>
                                <td className="px-6 py-4">
                                    <div>{order.customerName}</div>
                                    <div className="text-xs text-gray-500">{order.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{date}</div>
                                    {time && <div className="text-xs text-gray-500">{time}</div>}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-600">৳{deliveryCharge.toLocaleString()}</td>
                                <td className="px-6 py-4 font-bold text-pink-600">৳{productTotal.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                    {paginatedOrders.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                No orders found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-sm">
                <span className="text-gray-600">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders</span>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Previous
                    </button>
                    <span className="font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}

        {selectedOrder && <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            updateOrderStatus={updateOrderStatus}
            deleteOrder={deleteOrder}
        />}
    </div>
  );
};

export default AdminOrdersPage;
