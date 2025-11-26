
import React, { useState, useMemo, useEffect } from 'react';
import { Order, CartItem, OrderStatus } from '../../types';
import { Search, X, Trash2 } from 'lucide-react';
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-black">Order Details: {displayId}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto text-black">
                    <div>
                        <h3 className="font-semibold text-pink-600 mb-2">Customer Information</h3>
                        <p><span className="font-semibold">Name:</span> {order.customerName}</p>
                        <p><span className="font-semibold">Phone:</span> {order.phone}</p>
                        <p><span className="font-semibold">Address:</span> {`${order.address}, ${order.city}`}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-pink-600 mb-2">Order Status</h3>
                        <select value={order.status} onChange={handleStatusChange} className="p-2 border rounded-lg w-full md:w-1/2 bg-white text-black">
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <h3 className="font-semibold text-pink-600 mb-2">Items Ordered</h3>
                        <div className="space-y-2">
                        {(order.cartItems || []).map((item: CartItem) => (
                            <div key={item.id} className="flex items-center space-x-4 border-b pb-2">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded"/>
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">৳{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                        </div>
                        <div className="text-right mt-4 font-bold text-lg">
                            Total: ৳{order.total.toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2">
                        <Trash2 className="w-4 h-4"/>
                        <span>Delete Order</span>
                    </button>
                    <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, refreshAdminData } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Ensure fresh data is loaded when accessing this page
  useEffect(() => {
      refreshAdminData();
  }, [refreshAdminData]);

  useEffect(() => {
    // This effect syncs the selected order with the main orders list.
    // This is crucial for reflecting status updates in the modal in real-time.
    if (selectedOrder) {
      const updatedOrderInList = orders.find(o => o.id === selectedOrder.id);
      if (updatedOrderInList) {
        // Only update state if the order data has actually changed to prevent infinite loops.
        if (JSON.stringify(updatedOrderInList) !== JSON.stringify(selectedOrder)) {
            setSelectedOrder(updatedOrderInList);
        }
      } else {
        // If the order is no longer in the list (e.g., deleted), close the modal.
        setSelectedOrder(null);
      }
    }
  }, [orders, selectedOrder]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderId || order.id).toLowerCase().includes(searchTerm.toLowerCase()) // Search by new numeric ID too
    ).sort((a, b) => {
        // Sort by Date Descending (Newest first)
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        // Fallback to ID Descending (assuming Mongo ID is roughly time-sequential)
        return b.id.localeCompare(a.id);
    });
  }, [orders, searchTerm]);

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
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
                        <th scope="col" className="px-6 py-3">Total</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                        <tr key={order.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            <td className="px-6 py-4 font-medium text-gray-900">{order.orderId || order.id}</td>
                            <td className="px-6 py-4">
                                <div>{order.customerName}</div>
                                <div className="text-xs text-gray-500">{order.phone}</div>
                            </td>
                            <td className="px-6 py-4">{order.date}</td>
                            <td className="px-6 py-4">৳{order.total.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No orders found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
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
