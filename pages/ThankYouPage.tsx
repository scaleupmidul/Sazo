import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { CheckCircle, LoaderCircle, ShoppingBag, ArrowRight, Copy, Printer, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface ThankYouPageProps {
  orderId: string;
}

const ThankYouPageSkeleton: React.FC = () => (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl h-48 bg-stone-200"></div>
                <div className="bg-white p-6 rounded-xl h-64 bg-stone-200"></div>
            </div>
            <div className="lg:col-span-1">
                 <div className="bg-white p-6 rounded-xl h-96 bg-stone-200"></div>
            </div>
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
            const shippingCharge = order.total - (order.cartItems || []).reduce((acc, item) => acc + item.price * item.quantity, 0);
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'purchase',
                ecommerce: {
                    transaction_id: order.orderId || order.id,
                    value: order.total,
                    shipping: shippingCharge,
                    currency: 'BDT',
                    items: (order.cartItems || []).map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        item_variant: item.size
                    }))
                }
            });
        }
    }, [order]);

    const handleCopyOrderId = () => {
        const displayId = order?.orderId || order?.id || '';
        navigator.clipboard.writeText(displayId);
        notify("Order ID copied to clipboard!", "success");
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <ThankYouPageSkeleton />;
    
    if (error || !order) {
        return (
             <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 sm:p-12 bg-white rounded-2xl shadow-xl border border-stone-200 w-full">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <ShoppingBag className="w-10 h-10 text-pink-300" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3">Order Not Found</h2>
                    <p className="text-sm sm:text-base text-stone-500 mb-8 leading-relaxed">
                        We couldn't retrieve the details for this order. Please check your SMS/Email for confirmation.
                    </p>
                    <button onClick={() => navigate('/')} className="bg-pink-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-pink-700 transition duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 w-full sm:w-auto mx-auto">
                        <span>Return to Homepage</span>
                    </button>
                </div>
            </main>
        );
    }

    const subtotal = (order.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = order.total - subtotal;
    const displayOrderId = order.orderId || order.id;

    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
            <div>
                <h1 className="text-3xl font-bold text-stone-900">Order Confirmed</h1>
                <p className="text-stone-500 mt-1">Thank you for shopping with SAZO!</p>
            </div>
            <div className="flex gap-3">
                 <button onClick={handlePrint} className="flex items-center space-x-2 px-4 py-2 bg-white border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium transition text-sm">
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                </button>
                <button onClick={() => navigate('/shop')} className="flex items-center space-x-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 font-medium transition text-sm shadow-md">
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Order Details */}
            <div className="lg:col-span-2 space-y-6">
                {/* Status Banner */}
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
                    <div className="bg-pink-50 p-6 border-b border-pink-100 flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <CheckCircle className="w-8 h-8 text-pink-600" fill="currentColor" fillOpacity={0.1} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-stone-800">Order Placed Successfully</h2>
                            <p className="text-stone-600 text-sm">Estimated delivery: 3-5 business days</p>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Progress Bar (Visual Only) */}
                        <div className="relative flex items-center justify-between mb-2">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-100 rounded-full -z-10"></div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[15%] h-1 bg-pink-600 rounded-full -z-10"></div>
                            
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">1</div>
                                <span className="text-xs font-bold text-stone-800">Ordered</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 text-stone-400 flex items-center justify-center text-xs font-bold">2</div>
                                <span className="text-xs font-medium text-stone-500 hidden sm:block">Processing</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 text-stone-400 flex items-center justify-center text-xs font-bold">3</div>
                                <span className="text-xs font-medium text-stone-500 hidden sm:block">Shipped</span>
                            </div>
                             <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 text-stone-400 flex items-center justify-center text-xs font-bold">4</div>
                                <span className="text-xs font-medium text-stone-500">Delivered</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product List */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                    <div className="p-6 border-b border-stone-100">
                        <h3 className="font-bold text-stone-800">Items Ordered</h3>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {(order.cartItems || []).map((item, index) => (
                            <div key={`${item.id}-${index}`} className="p-6 flex gap-4">
                                <div className="w-20 h-24 bg-stone-100 rounded-lg border border-stone-200 overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-stone-800 text-sm sm:text-base">{item.name}</h4>
                                            <p className="text-sm text-stone-500 mt-1">Size: <span className="font-medium text-stone-700">{item.size}</span></p>
                                            <p className="text-sm text-stone-500">Qty: <span className="font-medium text-stone-700">{item.quantity}</span></p>
                                        </div>
                                        <p className="font-bold text-stone-900">৳{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Summary & Info */}
            <div className="lg:col-span-1 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-stone-800">Order Summary</h3>
                        <div className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full cursor-pointer hover:bg-stone-200 transition" onClick={handleCopyOrderId}>
                            <span className="text-xs font-mono text-stone-600">#{displayOrderId}</span>
                            <Copy className="w-3 h-3 text-stone-500" />
                        </div>
                    </div>
                    
                    <div className="space-y-3 text-sm border-b border-stone-100 pb-6 mb-6">
                        <div className="flex justify-between text-stone-600">
                            <span>Subtotal</span>
                            <span>৳{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                            <span>Shipping</span>
                            <span>৳{shipping.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-stone-800">Total</span>
                        <span className="text-xl font-extrabold text-pink-600">৳{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-stone-500 text-right mb-6">Including VAT & Tax</p>
                    
                    <div className="space-y-4">
                         <div className="flex items-start gap-3 text-sm">
                            <CreditCard className="w-4 h-4 text-stone-400 mt-0.5" />
                            <div>
                                <p className="font-semibold text-stone-700">Payment Method</p>
                                <p className="text-stone-500">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : `Online (${order.paymentDetails?.method})`}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-stone-400 mt-0.5" />
                            <div>
                                <p className="font-semibold text-stone-700">Order Date</p>
                                <p className="text-stone-500">{order.date}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
                    <h3 className="font-bold text-stone-800 mb-4">Shipping Details</h3>
                    <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                        <div>
                            <p className="font-semibold text-stone-700">{order.customerName}</p>
                            <p className="text-stone-500">{order.phone}</p>
                            <p className="text-stone-500 mt-1">{order.address}</p>
                            {order.city && <p className="text-stone-500">{order.city}</p>}
                        </div>
                    </div>
                </div>
                
                <div className="bg-pink-50 rounded-xl p-4 text-center print:hidden">
                     <p className="text-xs text-pink-800 font-medium">Need help? Contact us at <span className="underline cursor-pointer">support@sazo.com</span></p>
                </div>
            </div>
        </div>
      </main>
    );
};

export default ThankYouPage;
