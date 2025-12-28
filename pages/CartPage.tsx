
// pages/CartPage.tsx

import React, { useEffect, useState } from 'react';
import { CartItem } from '../types';
import { ShoppingCart, Truck, X, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useAppStore } from '../store';

const CartItemComponent: React.FC<{ item: CartItem, updateCartQuantity: (id: string, size: string, newQuantity: number) => void }> = ({ item, updateCartQuantity }) => (
  <div className="
    group flex gap-4 
    bg-white p-4 rounded-xl shadow-sm border border-stone-100
    lg:bg-transparent lg:p-0 lg:rounded-none lg:shadow-none lg:border-0 lg:border-b lg:border-stone-100 lg:py-6 lg:first:pt-0 lg:last:border-0
    transition-all duration-300 hover:shadow-md lg:hover:shadow-none lg:hover:bg-stone-50/30
  ">
    
    {/* Image Section */}
    <div className="w-24 sm:w-28 lg:w-32 aspect-[3/4] flex-shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-50 shadow-sm">
      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    </div>

    {/* Details Section */}
    <div className="flex flex-col flex-1 justify-between min-w-0">
      
      {/* Top: Name & Remove */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-stone-800 line-clamp-2 leading-snug">{item.name}</h3>
          <p className="text-xs sm:text-sm text-stone-500 font-medium inline-flex items-center bg-stone-50 px-2 py-1 rounded border border-stone-100">
            Size: <span className="text-stone-900 ml-1 font-bold">{item.size === 'Free' ? 'Free Size' : item.size}</span>
          </p>
        </div>
        {/* Remove Button */}
        <button 
          onClick={() => updateCartQuantity(item.id, item.size, 0)} 
          className="text-stone-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 flex-shrink-0 -mr-2 -mt-2 bg-stone-50 sm:bg-transparent"
          aria-label="Remove item"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom: Price & Quantity - Added gap-3 and shrink control to prevent overlap */}
      <div className="flex items-end justify-between mt-4 pt-3 border-t border-dashed border-stone-100 lg:border-none lg:pt-0 lg:mt-2 gap-3">
        <div className="flex flex-col min-w-0">
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-0.5">Total</span>
            <span className="text-xl font-extrabold text-pink-600 leading-none whitespace-nowrap">৳{(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </div>

        {/* Quantity Controller - Slightly more compact on mobile (w-9) to allow space for price */}
        <div className="flex items-center bg-white border border-stone-200 rounded-lg h-9 sm:h-10 shadow-sm flex-shrink-0">
          <button 
            onClick={() => updateCartQuantity(item.id, item.size, item.quantity - 1)} 
            className="w-9 sm:w-10 h-full flex items-center justify-center text-stone-500 hover:text-pink-600 active:bg-pink-50 rounded-l-lg transition border-r border-stone-100 hover:bg-pink-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-9 sm:w-10 text-center font-bold text-base text-stone-800 select-none">{item.quantity}</span>
          <button 
            onClick={() => updateCartQuantity(item.id, item.size, item.quantity + 1)} 
            className="w-9 sm:w-10 h-full flex items-center justify-center text-stone-500 hover:text-pink-600 active:bg-pink-50 rounded-r-lg transition border-l border-stone-100 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  </div>
);

const CartPage: React.FC = () => {
  const { cart, updateCartQuantity, navigate, cartTotal, products, loading, ensureAllProductsLoaded, fullProductsLoaded } = useAppStore(state => ({
    cart: state.cart,
    updateCartQuantity: state.updateCartQuantity,
    navigate: state.navigate,
    cartTotal: state.cartTotal,
    products: state.products,
    loading: state.loading,
    ensureAllProductsLoaded: state.ensureAllProductsLoaded,
    fullProductsLoaded: state.fullProductsLoaded
  }));

  const [gtmFired, setGtmFired] = useState(false);

  // Ensure full product list is loaded to get correct productIds for analytics
  useEffect(() => {
      if (!fullProductsLoaded) {
          ensureAllProductsLoaded();
      }
  }, [fullProductsLoaded, ensureAllProductsLoaded]);

  // GTM Event Trigger - Wait for product IDs to be resolved
  useEffect(() => {
    if (!loading && cart && cart.length > 0 && !gtmFired) {
        
        // Check if any cart item is missing a short numeric ID
        const pendingIdResolution = cart.some(item => {
            const productInStore = products.find(p => p.id === item.id);
            const idToCheck = item.productId || productInStore?.productId || item.id;
            // If ID looks like a Mongo ObjectID (24 hex chars) and we haven't loaded all products yet, we wait.
            return idToCheck.length === 24 && !fullProductsLoaded;
        });

        if (pendingIdResolution) return;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
        window.dataLayer.push({
            event: 'view_cart',
            ecommerce: {
                currency: 'BDT',
                value: cartTotal,
                items: cart.map(item => {
                    const productInStore = products.find(p => p.id === item.id);
                    const finalId = item.productId || productInStore?.productId || item.id;

                    return {
                        item_id: finalId, // Use dynamic numeric ID
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        item_variant: item.size
                    };
                })
            }
        });
        setGtmFired(true);
    }
  }, [cart, cartTotal, loading, products, fullProductsLoaded, gtmFired]);

  if (cart.length === 0) {
    return (
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 sm:p-16 bg-white rounded-xl shadow-lg border border-stone-200 w-full max-w-lg mx-4">
          <ShoppingCart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">Your Cart is Empty</h2>
          <p className="text-sm sm:text-base text-stone-600 mb-6">It looks like you haven't added any SAZO items yet.</p>
          <button onClick={() => navigate('/shop')} className="bg-pink-600 text-white font-medium px-8 py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow active:scale-95 w-full sm:w-auto">
            Start Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-screen-2xl mx-auto px-2 sm:px-6 lg:px-8 pt-4 sm:pt-12 pb-12">
      <h2 className="text-2xl sm:text-4xl font-bold text-stone-900 mb-5 sm:mb-8 text-center">Your Shopping Cart</h2>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
        {/* Cart Items Column */}
        <div className="lg:col-span-8 mb-6 lg:mb-0">
           {/* Mobile: Space between cards. Desktop: White container with dividers */}
           <div className="space-y-4 lg:space-y-0 lg:bg-white lg:p-6 lg:rounded-xl lg:shadow-lg lg:border lg:border-stone-200">
              {cart.map(item => <CartItemComponent key={`${item.id}-${item.size}`} item={item} updateCartQuantity={updateCartQuantity} />)}
           </div>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-xl shadow-lg border border-stone-200 lg:sticky top-24 h-fit">
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-4 sm:mb-6">Order Summary</h3>
          
          {/* Detailed Items List in Summary - Hidden on mobile, shown on desktop for reference */}
          <div className="hidden lg:block space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3">
                <div className="w-12 aspect-[3/4] flex-shrink-0 overflow-hidden rounded-md border border-stone-100">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h4 className="text-xs font-bold text-stone-800 line-clamp-2 leading-tight">{item.name}</h4>
                   <p className="text-[10px] text-stone-500 mt-0.5">
                    Size: {item.size === 'Free' ? 'Free' : item.size} &bull; Quantity: {item.quantity}
                  </p>
                  <p className="text-xs font-bold text-pink-600 mt-0.5">
                    ৳{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 text-sm border-t border-stone-200 pt-4">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal ({cart.length} items)</span>
              <span className="font-medium">৳{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping (Est.)</span>
              <span>—</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center shadow-sm">
            <span className="text-base font-bold text-stone-900">Total Payable</span>
            <span className="text-xl font-extrabold text-pink-600">৳{cartTotal.toLocaleString('en-IN')}</span>
          </div>

          <p className="text-[10px] sm:text-xs text-stone-400 mt-3 text-center">Shipping & taxes calculated at checkout.</p>
          
          <div className="mt-6 space-y-3">
            <button onClick={() => navigate('/checkout')} className="w-full bg-pink-600 text-white text-base font-bold px-6 py-3.5 rounded-full hover:bg-pink-700 transition duration-300 shadow flex items-center justify-center space-x-2 active:scale-95">
              <Truck className="w-5 h-5" />
              <span>Proceed to Checkout</span>
            </button>

            <button onClick={() => navigate('/shop')} className="w-full bg-white text-stone-600 border border-stone-300 text-base font-bold px-6 py-3.5 rounded-full hover:bg-stone-50 hover:text-pink-600 transition duration-300 shadow-sm flex items-center justify-center space-x-2 active:scale-95">
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;

