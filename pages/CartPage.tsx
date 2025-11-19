import React from 'react';
import { CartItem } from '../types';
import { ShoppingCart, Truck, XCircle } from 'lucide-react';
import { useAppStore } from '../store';

const CartItemComponent: React.FC<{ item: CartItem, updateCartQuantity: (id: string, size: string, newQuantity: number) => void }> = ({ item, updateCartQuantity }) => (
  <div className="flex items-start border-b border-stone-200 py-4 last:border-b-0">
    <div className="w-16 sm:w-24 aspect-[3.5/4] flex-shrink-0 overflow-hidden rounded-lg">
      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
    </div>
    <div className="ml-4 flex-1 min-w-0">
      <h3 className="text-sm sm:text-base font-semibold text-stone-900 truncate">{item.name}</h3>
      <p className="text-xs text-pink-600 font-medium mt-0.5">Size: {item.size === 'Free' ? 'Free Size' : item.size}</p>
      <p className="text-xs sm:text-sm text-stone-600">Price: <span>৳{item.price.toLocaleString('en-IN')}</span></p>
      <p className="text-sm font-bold text-pink-600 sm:hidden mt-1">Total: <span>৳{(item.price * item.quantity).toLocaleString('en-IN')}</span></p>
    </div>
    <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 ml-4">
      <div className="flex items-center border border-stone-300 rounded-full">
        <button onClick={() => updateCartQuantity(item.id, item.size, item.quantity - 1)} className="p-1 text-stone-600 hover:bg-pink-100 rounded-l-full transition w-7 h-7 active:scale-95">-</button>
        <span className="w-6 text-center font-medium text-sm text-stone-900">{item.quantity}</span>
        <button onClick={() => updateCartQuantity(item.id, item.size, item.quantity + 1)} className="p-1 text-stone-600 hover:bg-pink-100 rounded-r-full transition w-7 h-7 active:scale-95">+</button>
      </div>
      <p className="text-sm font-bold text-stone-900 w-24 text-right hidden sm:block">৳{(item.price * item.quantity).toLocaleString('en-IN')}</p>
      <button onClick={() => updateCartQuantity(item.id, item.size, 0)} className="text-gray-400 hover:text-red-500 transition p-1 sm:p-2" aria-label="Remove item">
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const CartPage: React.FC = () => {
  const { cart, updateCartQuantity, navigate, cartTotal } = useAppStore(state => ({
    cart: state.cart,
    updateCartQuantity: state.updateCartQuantity,
    navigate: state.navigate,
    cartTotal: state.cartTotal,
  }));

  const tempShipping = 100;

  if (cart.length === 0) {
    return (
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 sm:p-16 bg-white rounded-xl shadow-lg border border-stone-200">
          <ShoppingCart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">Your Cart is Empty</h2>
          <p className="text-sm sm:text-base text-stone-600 mb-6">It looks like you haven't added any SAZO items yet.</p>
          <button onClick={() => navigate('/shop')} className="bg-pink-600 text-white font-medium px-8 py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow active:scale-95">
            Start Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
      <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8 text-center">Your Shopping Cart</h2>
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-stone-200">
          {cart.map(item => <CartItemComponent key={`${item.id}-${item.size}`} item={item} updateCartQuantity={updateCartQuantity} />)}
        </div>
        <div className="lg:col-span-1 mt-6 lg:mt-0 bg-white p-6 rounded-xl shadow-lg border border-stone-200 lg:sticky top-24 h-fit">
          <h3 className="text-xl font-bold text-stone-900 mb-6">Order Summary</h3>
          
          {/* Detailed Items List in Summary */}
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3">
                <div className="w-14 aspect-[3.5/4] flex-shrink-0 overflow-hidden rounded-md border border-stone-100">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h4 className="text-sm font-bold text-stone-800 line-clamp-2 leading-tight">{item.name}</h4>
                   <p className="text-xs text-stone-500 mt-1">
                    Size: {item.size === 'Free' ? 'Free' : item.size} &bull; Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-pink-600 mt-1">
                    ৳{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 text-sm border-t border-stone-200 pt-4">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal ({cart.length} unique items)</span>
              <span>৳{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping (Est.)</span>
              <span>৳{tempShipping}</span>
            </div>
          </div>
          <div className="border-t-2 border-stone-300 mt-4 pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-stone-900">Total Payable</span>
            <span className="text-xl sm:text-2xl font-extrabold text-pink-600">৳{(cartTotal + tempShipping).toLocaleString('en-IN')}</span>
          </div>
          <p className="text-xs text-stone-500 mt-2 text-center">Final shipping charge is calculated at checkout.</p>
          <button onClick={() => navigate('/checkout')} className="mt-6 w-full bg-pink-600 text-white text-base font-bold px-6 py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow flex items-center justify-center space-x-2 active:scale-95">
            <Truck className="w-5 h-5" />
            <span>Proceed to Checkout</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default CartPage;