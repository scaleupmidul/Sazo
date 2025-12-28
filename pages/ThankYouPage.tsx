
import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { CheckCircle, ShoppingBag, ArrowRight, Copy, Printer, MapPin, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface ThankYouPageProps {
  orderId: string;
}

const ThankYouPageSkeleton: React.FC = () => (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 animate-pulse">
        <div className="flex flex-col items-center space-y-4 mb-12">
             <div className="w-20 h-20 bg-stone-200 rounded-full"></div>
             <div className="h-8 bg-stone-200 rounded w-64"></div>
             <div className="h-4 bg-stone-200 rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-stone-200 h-64"></div>
            <div className="lg:col-span-1 p-6 rounded-2xl bg-stone-200 h-64"></div>
        </div>
    </main>
);

const ThankYouPage: React.FC<ThankYouPageProps> = ({ orderId }) => {
    const { navigate, notify } = useAppStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || orderId === 'undefined') {
                setError(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(false);
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) throw new Error('Order not found');
                const data: Order = await res.json();
                setOrder(data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (order) {
            const itemSubtotal = (order.cartItems || []).reduce((acc, item) => acc + item.price * item.quantity, 0);
            const shippingValue = order.shippingCharge !== undefined 
                ? order.shippingCharge 
                : Math.max(0, order.total - itemSubtotal);

            window.dataLayer = window.dataLayer || [];
            
            window.dataLayer.push({
                event: 'purchase',
                ecommerce: {
                    transaction_id: `order_${order.orderId || order.id}`,
                    value: order.total,
                    shipping: shippingValue,
                    currency: 'BDT',
                    items: (order.cartItems || []).map(item => ({
                        item_id: item.productId || item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        item_variant: item.size
                    }))
                },
                customer: {
                    firstName: order.firstName,
                    lastName: order.lastName || '',
                    email: order.email,
                    phone: order.phone,
                    address: order.address,
                    city: order.city || '',
                    paymentMethod: order.paymentMethod
                }
            });
        }
    }, [order]);

    const handleCopyOrderId = () => {
        const displayId = order?.orderId || order?.id || '';
        navigator.clipboard.writeText(displayId);
        notify("Order ID copied!", "success");
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <ThankYouPageSkeleton />;
    
    if (error || !order) {
        return (
             <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 sm:p-12 bg-white rounded-2xl shadow-xl border border-stone-100 w-full">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-pink-300" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3">Order Not Found</h2>
                    <p className="text-sm sm:text-base text-stone-500 mb-8 leading-relaxed">
                        We couldn't retrieve the details for this order. Please check your SMS/Email for confirmation.
                    </p>
                    <button onClick={() => navigate('/')} className="bg-pink-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-pink-700 transition shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 w-full sm:w-auto mx-auto">
                        <span>Return to Homepage</span>
                    </button>
                </div>
            </main>
        );
    }

    const subtotal = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = order.total - subtotal;
    const displayOrderId = order.orderId || order.id;
    const isOnlinePayment = order.paymentMethod === 'Online';

    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 sm:pb-20 overflow-x-hidden">
        <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-pink-50 mb-4 sm:mb-6 shadow-sm">
                <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-pink-600" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mb-2 sm:mb-3">Thank You!</h1>
            <p className="text-stone-600 text-base sm:text-lg">Your order has been placed successfully.</p>
            
            <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-stone-200 shadow-sm hover:shadow-md transition cursor-pointer group active:scale-95" onClick={handleCopyOrderId}>
                <span className="text-stone-500 text-xs sm:text-sm font-medium">Order ID:</span>
                <span className="text-stone-900 text-sm sm:text-base font-bold font-mono">{displayOrderId}</span>
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 group-hover:text-pink-600 transition" />
            </div>
        </div>

        <div className="hidden sm:block max-w-3xl mx-auto mb-6 animate-fadeIn">
             <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-100 rounded-full -z-10"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[15%] h-1 bg-pink-600 rounded-full -z-10"></div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-sm font-bold shadow-md ring-4 ring-white">1</div>
                    <span className="text-xs font-bold text-stone-800">Ordered</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-stone-300 ring-4 ring-white"></div>
                    <span className="text-xs font-medium text-stone-400">Processing</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-stone-300 ring-4 ring-white"></div>
                    <span className="text-xs font-medium text-stone-400">Shipped</span>
                </div>
                    <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-stone-300 ring-4 ring-white"></div>
                    <span className="text-xs font-medium text-stone-400">Delivered</span>
                </div>
            </div>
        </div>
        
        <p className="text-center text-xs sm:text-sm font-medium text-stone-500 mb-8 sm:mb-16 animate-fadeIn">
            Estimated delivery: 2-4 business days
        </p>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 animate-fadeInUp">
            <div className="order-1 lg:order-2 lg:col-span-5 space-y-6 min-w-0">
                <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden relative">
                    <div className="h-1.5 sm:h-2 bg-pink-600 w-full"></div>
                    <div className="p-5 sm:p-8">
                        <h3 className="font-bold text-stone-900 text-lg sm:text-xl mb-4 sm:mb-6">Order Summary</h3>
                        <div className="space-y-4 mb-6 sm:mb-8 text-sm">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="p-2 bg-stone-50 rounded-lg flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-pink-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">Shipping Address</p>
                                    <p className="text-stone-800 font-semibold break-all">{order.firstName} {order.lastName || ''}</p>
                                    <p className="text-stone-500 mt-1 leading-relaxed break-all whitespace-pre-wrap">{order.address}</p>
                                    <p className="text-stone-500 mt-1 font-medium">{order.phone}</p>
                                    {order.city && <p className="text-stone-500 font-medium">{order.city}</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="p-2 bg-stone-50 rounded-lg flex-shrink-0">
                                    <CreditCard className="w-4 h-4 text-pink-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-1">Payment Method</p>
                                    <p className="text-stone-500 font-medium">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : `Online (${order.paymentDetails?.method || 'Advance'})`}</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-dashed border-stone-200 my-5 sm:my-6"></div>
                        <div className="space-y-2 sm:space-y-3 text-sm">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-stone-900">৳{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                                <span>Shipping</span>
                                <span className="font-medium text-stone-900">{isOnlinePayment ? '(Advance)' : `৳${shipping.toLocaleString('en-IN')}`}</span>
                            </div>
                        </div>
                        <div className="border-t border-stone-200 mt-4 pt-4">
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-stone-800 text-base sm:text-lg">Total Payable</span>
                                <span className="text-xl sm:text-2xl font-extrabold text-pink-600">৳{order.total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-stone-50 p-5 sm:p-6 border-t border-stone-100 flex flex-col gap-3">
                         <button onClick={() => navigate('/shop')} className="w-full bg-pink-600 text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-pink-700 transition shadow-md flex items-center justify-center gap-2 active:scale-95">
                            <span>Continue Shopping</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                         <button onClick={handlePrint} className="w-full bg-white text-stone-700 font-bold py-3 sm:py-3.5 rounded-xl border border-stone-200 hover:bg-stone-100 transition flex items-center justify-center gap-2 print:hidden active:scale-95">
                            <Printer className="w-4 h-4" />
                            <span>Print Receipt</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="order-2 lg:order-1 lg:col-span-7 space-y-6 sm:space-y-8 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                        <h3 className="font-bold text-stone-800 text-sm sm:text-base">Items in your order</h3>
                        <span className="text-xs sm:text-sm text-stone-500 bg-white px-2 py-1 rounded border border-stone-200">{order.cartItems?.length} items</span>
                    </div>
                    <div className="divide-y divide-stone-50">
                        {(order.cartItems || []).map((item, index) => (
                            <div key={`${item.id}-${index}`} className="p-4 sm:p-6 flex gap-3 sm:gap-5 items-start sm:items-center min-w-0">
                                <div className="w-16 h-20 sm:w-24 sm:h-32 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 border border-stone-100">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="font-bold text-stone-900 text-sm sm:text-lg line-clamp-2 break-all">{item.name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-2 text-[10px] sm:text-sm text-stone-500">
                                        <span className="bg-stone-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">Size: <strong className="text-stone-700">{item.size}</strong></span>
                                        <span className="bg-stone-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">Qty: <strong className="text-stone-700">{item.quantity}</strong></span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-stone-900 text-sm sm:text-lg">৳{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </main>
    );
};

export default ThankYouPage;
