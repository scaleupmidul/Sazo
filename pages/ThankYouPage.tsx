import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { CheckCircle, LoaderCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order } from '../types';

interface ThankYouPageProps {
  orderId: string;
}

const ThankYouPageSkeleton: React.FC = () => (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 animate-pulse">
        <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg mt-10 border border-stone-100 w-full">
            <div className="w-20 h-20 bg-stone-200 rounded-full mx-auto mb-6"></div>
            <div className="h-10 bg-stone-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-stone-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="my-6 text-left bg-stone-50 p-6 rounded-lg border border-stone-200 space-y-4">
                <div className="h-6 bg-stone-200 rounded w-full"></div>
                <div className="h-20 bg-stone-200 rounded w-full"></div>
                <div className="h-6 bg-stone-200 rounded w-full"></div>
            </div>
            <div className="h-14 bg-stone-200 rounded-full w-full sm:w-64 mx-auto"></div>
        </div>
    </main>
);

const ThankYouPage: React.FC<ThankYouPageProps> = ({ orderId }) => {
    const { navigate } = useAppStore();
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
                // The backend is configured to find orders by numeric orderId first
                const res = await fetch(`/api/orders/${orderId}`);
                if (!res.ok) {
                    throw new Error('Order not found');
                }
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
                    transaction_id: order.orderId || order.id, // Prefer the short numeric ID
                    value: order.total,
                    shipping: shippingCharge,
                    currency: 'BDT',
                    items: (order.cartItems || []).map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        item_variant: item.size
                    })),
                    customer: {
                        name: order.customerName,
                        phone: order.phone,
                        address: order.address,
                        city: order.city
                    }
                }
            });
        }
    }, [order]);

    if (loading) {
        return <ThankYouPageSkeleton />;
    }
    
    if (error || !order) {
        return (
             <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 sm:p-12 bg-white rounded-2xl shadow-xl border border-stone-200 w-full">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                         <ShoppingBag className="w-10 h-10 text-pink-300" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3">Order Not Found</h2>
                    <p className="text-sm sm:text-base text-stone-500 mb-8 leading-relaxed">
                        We couldn't retrieve the details for this order. If you just placed it, please check your SMS/Email for confirmation or contact support.
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
    // Prefer the short numeric orderId, fallback to system id
    const displayOrderId = order.orderId || order.id;

    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden mt-8">
            <div className="p-8 sm:p-10 text-center">
                 <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 rounded-full mb-6 animate-scaleIn">
                    <CheckCircle className="w-10 h-10 text-pink-600" strokeWidth={3} />
                 </div>
                 <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">Thank You!</h1>
                 <p className="text-base text-stone-500 mb-6">Your order has been placed successfully.</p>
                 
                 <div className="inline-block bg-stone-100 rounded-full px-4 py-1.5 mb-8">
                    <span className="text-sm font-medium text-stone-500">Order ID: <span className="text-stone-900 font-bold">#{displayOrderId}</span></span>
                 </div>

                 {/* Order Summary Box */}
                 <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden text-left">
                     <div className="p-4 sm:p-6 border-b border-stone-200">
                        <h3 className="font-bold text-stone-800 text-lg">Order Summary</h3>
                     </div>
                     <div className="p-4 sm:p-6 space-y-4">
                        {(order.cartItems || []).map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex items-center py-2">
                                <div className="w-16 h-20 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-white">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-4 flex-1 min-w-0">
                                    <p className="font-bold text-stone-800 text-sm sm:text-base truncate">{item.name}</p>
                                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">Size: {item.size} <span className="mx-1">•</span> Qty: {item.quantity}</p>
                                </div>
                                <p className="font-bold text-stone-900 text-sm sm:text-base ml-4">৳{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                     </div>
                     <div className="bg-stone-100 p-4 sm:p-6 border-t border-stone-200 space-y-2">
                        <div className="flex justify-between text-sm text-stone-600">
                            <span>Subtotal</span>
                            <span>৳{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-stone-600">
                            <span>Shipping</span>
                            <span>৳{shipping.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-extrabold text-stone-900 pt-2 border-t border-stone-200 mt-2">
                            <span>Total</span>
                            <span className="text-pink-600">৳{order.total.toLocaleString('en-IN')}</span>
                        </div>
                     </div>
                 </div>
            </div>
            
            <div className="p-6 bg-stone-50 border-t border-stone-100 text-center">
                <p className="text-sm text-stone-500 mb-6">We will contact you shortly to confirm your order details.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full sm:w-auto bg-pink-600 text-white font-bold px-8 py-3.5 rounded-full hover:bg-pink-700 transition duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 mx-auto"
                >
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </main>
    );
};

export default ThankYouPage;