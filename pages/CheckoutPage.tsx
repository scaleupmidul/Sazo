
import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store';

// Improved InputField with text-base on mobile to prevent iOS zoom
const InputField: React.FC<{ label: string; name: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; required?: boolean; placeholder?: string; }> = 
({ label, name, type = 'text', value, onChange, required = true, placeholder }) => (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-stone-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <input 
        type={type} 
        id={name} 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        required={required} 
        placeholder={placeholder} 
        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-base sm:text-sm bg-white text-black" 
      />
    </div>
);

const CheckoutPageSkeleton: React.FC = () => (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 animate-pulse">
        {/* Page Title Box */}
        <div className="h-10 bg-stone-200 rounded w-48 mx-auto mb-8"></div>
        
        <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-8">
            
            {/* Order Summary Skeleton (Right Column - Wider) */}
            <div className="lg:col-span-2 h-fit order-1 lg:order-2 mb-8 lg:mb-0">
                <div className="h-7 bg-stone-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                    {/* Item Skeletons */}
                    <div className="flex gap-3">
                        <div className="w-16 h-20 bg-stone-200 rounded"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                            <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                            <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                        </div>
                    </div>
                     <div className="flex gap-3">
                        <div className="w-16 h-20 bg-stone-200 rounded"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                            <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                            <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                        </div>
                    </div>
                    
                    <div className="h-px bg-stone-200 my-4"></div>
                    
                    {/* Totals */}
                    <div className="flex justify-between"><div className="h-4 bg-stone-200 rounded w-1/3"></div><div className="h-4 bg-stone-200 rounded w-1/4"></div></div>
                    <div className="flex justify-between mt-2"><div className="h-4 bg-stone-200 rounded w-1/2"></div><div className="h-4 bg-stone-200 rounded w-1/4"></div></div>
                    
                    <div className="h-px bg-stone-200 my-4"></div>
                    <div className="flex justify-between items-center"><div className="h-6 bg-stone-200 rounded w-1/3"></div><div className="h-8 bg-stone-200 rounded w-1/3"></div></div>
                </div>
            </div>

            {/* Form Skeleton (Left Column) */}
            <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
                {/* Shipping Info Section */}
                <div>
                    <div className="h-7 bg-stone-200 rounded w-1/3 mb-6 pb-2"></div>
                    <div className="space-y-4">
                        <div className="h-12 bg-stone-200 rounded-lg w-full"></div>
                        <div className="h-12 bg-stone-200 rounded-lg w-full"></div>
                        <div className="h-12 bg-stone-200 rounded-lg w-full"></div>
                        <div className="h-12 bg-stone-200 rounded-lg w-full"></div>
                    </div>
                </div>

                {/* Delivery Area Section */}
                <div>
                    <div className="h-7 bg-stone-200 rounded w-1/3 mb-6 pt-4"></div>
                    <div className="space-y-3">
                        <div className="h-14 bg-stone-200 rounded-lg w-full"></div>
                        <div className="h-14 bg-stone-200 rounded-lg w-full"></div>
                    </div>
                </div>

                {/* Payment Method Section */}
                <div>
                    <div className="h-7 bg-stone-200 rounded w-1/3 mb-6 pt-4"></div>
                     <div className="space-y-3">
                        <div className="h-14 bg-stone-200 rounded-lg w-full"></div>
                        <div className="h-14 bg-stone-200 rounded-lg w-full"></div>
                    </div>
                </div>
                
                {/* Submit Button */}
                <div className="h-14 bg-stone-200 rounded-full mt-8 w-full"></div>
            </div>
        </div>
    </main>
);

// Component to safely render HTML content to prevent crashes
const SafeHTML: React.FC<{ content: string; style?: React.CSSProperties }> = ({ content, style }) => {
    try {
        if (!content) return null;
        return (
            <div
                className="font-semibold"
                style={style}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    } catch (e) {
        // Fallback to plain text if HTML parsing fails
        return <div className="font-semibold" style={style}>{content}</div>;
    }
};

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, navigate, clearCart, notify, addOrder, settings: storeSettings, loading } = useAppStore();
  
  // Robustly handle settings to prevent crashes if data is missing or malformed
  const safeSettings = useMemo(() => {
      if (!storeSettings) {
          // Return a safe default object if storeSettings is null/undefined
          return {
            codEnabled: true,
            onlinePaymentEnabled: true,
            shippingOptions: [],
            onlinePaymentMethods: [],
            onlinePaymentInfo: '',
            onlinePaymentInfoStyles: { fontSize: '0.875rem' },
            showCityField: true,
          };
      }
      return {
        codEnabled: storeSettings.codEnabled ?? true,
        onlinePaymentEnabled: storeSettings.onlinePaymentEnabled ?? true,
        shippingOptions: Array.isArray(storeSettings.shippingOptions) ? storeSettings.shippingOptions : [],
        onlinePaymentMethods: Array.isArray(storeSettings.onlinePaymentMethods) ? storeSettings.onlinePaymentMethods : [],
        onlinePaymentInfo: typeof storeSettings.onlinePaymentInfo === 'string' ? storeSettings.onlinePaymentInfo : '',
        onlinePaymentInfoStyles: storeSettings.onlinePaymentInfoStyles || { fontSize: '0.875rem' },
        showCityField: storeSettings.showCityField ?? true,
      };
  }, [storeSettings]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: '', // Initialize empty, let effect handle default
    shippingOptionId: '', // Initialize empty
    paymentNumber: '',
    onlinePaymentMethod: 'Choose',
    transactionId: '',
  });

  // Calculate safe values for render
  const safeCartTotal = Number.isFinite(cartTotal) ? cartTotal : 0;

  useEffect(() => {
    // After the initial data load is complete, check if the cart is empty.
    // If it is, redirect the user to the shop page.
    if (!loading && (!cart || cart.length === 0)) {
      navigate('/shop');
      notify("Your cart is empty. Let's find something for you!", 'error');
    }
  }, [loading, cart, navigate, notify]);
  
  useEffect(() => {
    if (!loading && cart && cart.length > 0) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'begin_checkout',
            ecommerce: {
                currency: 'BDT',
                value: safeCartTotal,
                items: cart.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    item_variant: item.size
                }))
            }
        });
    }
  }, [cart, safeCartTotal, loading]);
  
  // Effect to set default form values once settings are loaded
  useEffect(() => {
    if (loading) return; 
    
    setFormData(prev => {
        const newData = { ...prev };
        let changed = false;

        // Set default payment method if not set or current selection is invalid
        const isCodAvailable = safeSettings.codEnabled;
        const isOnlineAvailable = safeSettings.onlinePaymentEnabled;
        
        const currentMethodValid = 
            (prev.paymentMethod === 'COD' && isCodAvailable) || 
            (prev.paymentMethod === 'Online' && isOnlineAvailable);

        if (!currentMethodValid) {
            if (isCodAvailable) newData.paymentMethod = 'COD';
            else if (isOnlineAvailable) newData.paymentMethod = 'Online';
            else newData.paymentMethod = '';
            changed = true;
        }

        // Set default shipping option if not set
        if (!prev.shippingOptionId && safeSettings.shippingOptions.length > 0) {
            newData.shippingOptionId = safeSettings.shippingOptions[0].id;
            changed = true;
        }

        return changed ? newData : prev;
    });
  }, [safeSettings, loading]);

  const selectedShippingOption = useMemo(() => {
    if (!safeSettings.shippingOptions || safeSettings.shippingOptions.length === 0) return null;
    return safeSettings.shippingOptions.find(opt => opt.id === formData.shippingOptionId) || safeSettings.shippingOptions[0];
  }, [formData.shippingOptionId, safeSettings.shippingOptions]);

  // Calculate derived values safely
  const shippingCharge = selectedShippingOption?.charge || 0;
  const totalPayable = safeCartTotal + shippingCharge;
  const formattedPaymentInfo = useMemo(() => {
      return (safeSettings.onlinePaymentInfo || '').replace(/\n/g, '<br />');
  }, [safeSettings.onlinePaymentInfo]);
  
  if (loading) {
      return <CheckoutPageSkeleton />;
  }
  
  // Guard against rendering an empty page while waiting for the redirect effect to run.
  if (!cart || cart.length === 0) {
    return <CheckoutPageSkeleton />;
  }
  
  const noPaymentMethodAvailable = !safeSettings.codEnabled && !safeSettings.onlinePaymentEnabled;
  const noShippingMethodAvailable = safeSettings.shippingOptions.length === 0;
  const safeOnlinePaymentMethods = safeSettings.onlinePaymentMethods;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = (() => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || (safeSettings.showCityField && !formData.city.trim())) {
        return false;
    }
    if (!formData.shippingOptionId) {
        return false;
    }
    if (formData.paymentMethod === 'Online' && safeSettings.onlinePaymentEnabled) {
        if (!formData.paymentNumber.trim() || formData.onlinePaymentMethod === 'Choose' || !formData.transactionId.trim()) {
            return false;
        }
    }
    if (noPaymentMethodAvailable || noShippingMethodAvailable) {
        return false;
    }
    return true;
  })();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) {
        notify("Please fill in all required fields.", "error");
        return;
    }
    if (safeCartTotal === 0) {
      notify("Your cart is empty. Cannot place an order.", "error");
      return;
    }

    const paymentInfo = {
        paymentMethod: formData.paymentMethod as 'COD' | 'Online',
        paymentDetails: formData.paymentMethod === 'Online' ? {
            paymentNumber: formData.paymentNumber,
            method: formData.onlinePaymentMethod,
            amount: totalPayable,
            transactionId: formData.transactionId
        } : undefined
    };
    
    try {
        const newOrder = await addOrder(
          { name: formData.name, phone: formData.phone, address: formData.address, city: formData.city },
          cart,
          totalPayable,
          paymentInfo
        );
    
        // Priority: Use the friendly orderId if available (numeric 5-7 chars)
        // Fallback: Use the system id
        const orderId = newOrder.orderId || newOrder.id || (newOrder as any)._id;
        
        if (orderId) {
            clearCart();
            navigate(`/thank-you/${orderId}`);
        } else {
            // Fallback if no ID is found (should not happen if backend works)
            notify("Order placed but ID missing. Please contact support.", "error");
            navigate('/'); 
        }
    } catch (error: any) {
        console.error("Order creation failed:", error);
        notify(error.message || "Failed to place order. Please try again.", "error");
    }
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8 text-center">Checkout</h2>
      
      {/* UPDATED GRID: lg:grid-cols-5 gives Order Summary 40% width (2 cols) and Form 60% width (3 cols) */}
      <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-8">
        
        {/* Order Summary Column (Wider - 2 columns) */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-stone-200 lg:sticky top-24 h-fit order-1 lg:order-2 mb-6 lg:mb-0">
          <h3 className="text-xl font-bold text-stone-900 mb-4 sm:mb-6">Order Summary</h3>
          
          {/* Cart Items List - Scrollable on mobile to save space */}
          <div className="space-y-4 mb-6 max-h-60 sm:max-h-none overflow-y-auto pr-1 custom-scrollbar">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3">
                <div className="w-16 aspect-[3.5/4] flex-shrink-0 overflow-hidden rounded-md border border-stone-100">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
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

          <div className="border-t border-stone-200 pt-4 space-y-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>৳{safeCartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-600 border-b border-stone-200 pb-4">
              <span className="font-semibold w-2/3">Shipping ({selectedShippingOption?.label || 'Not selected'})</span>
              <span>৳{shippingCharge.toLocaleString('en-IN')}</span>
            </div>
          </div>
          {/* UPDATED: Reduced font size to text-xl sm:text-2xl to prevent overlapping */}
          <div className="mt-6 flex justify-between items-center">
            <span className="text-lg font-bold text-stone-900">Total Payable</span>
            <span className="text-xl sm:text-2xl font-extrabold text-pink-600">৳{totalPayable.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Checkout Form Column (3 columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-stone-200 order-2 lg:order-1">
          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Your Name" />
              <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="e.g., 017XX XXX XXX" />
              <InputField label="Full Delivery Address" name="address" value={formData.address} onChange={handleChange} placeholder="e.g., House 1, Road 2, Block A, Gulshan" />
              {safeSettings.showCityField && (
                <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Dhaka" />
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4 pt-4">Select Delivery Area</h3>
            <div className="space-y-3">
              {safeSettings.shippingOptions.length > 0 ? safeSettings.shippingOptions.map((option) => {
                 if (!option || !option.id) return null;
                 const isSelected = formData.shippingOptionId === option.id;
                 return (
                    <div 
                        key={option.id} 
                        className={`rounded-lg border transition-all duration-200 overflow-hidden ${isSelected ? 'bg-pink-50 border-pink-600' : 'bg-white border-stone-300'}`}
                        onClick={() => setFormData(prev => ({ ...prev, shippingOptionId: option.id }))}
                    >
                      <label className="flex items-center w-full p-4 cursor-pointer gap-3">
                        <input 
                            type="radio" 
                            name="shippingOptionId" 
                            value={option.id} 
                            checked={isSelected} 
                            onChange={handleChange} 
                            className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600 flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <span className="font-semibold text-stone-700 text-sm break-words">{option.label || 'Standard Shipping'}</span>
                                <span className="font-bold text-stone-900 text-sm flex-shrink-0">{(option.charge || 0).toLocaleString('en-IN')} ৳</span>
                            </div>
                        </div>
                      </label>
                    </div>
                 );
              }) : (
                   <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                       No shipping options are currently available. Please contact our support team for assistance.
                   </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4 pt-4">Payment Method</h3>
            <div className="space-y-3">
               {safeSettings.codEnabled && (
                  <div 
                    className="rounded-lg border border-stone-300 bg-white transition-all duration-200 overflow-hidden"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}
                  >
                    <label className="flex items-start space-x-3 p-4 cursor-pointer">
                      <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-700 text-sm block">Cash on Delivery (COD)</span>
                        <p className="text-xs text-stone-500 mt-0.5">Pay upon receiving the product</p>
                      </div>
                    </label>
                  </div>
                )}
                {safeSettings.onlinePaymentEnabled && (
                  <div 
                    className="rounded-lg border border-stone-300 bg-white transition-all duration-200 overflow-hidden"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Online' }))}
                  >
                    <label className="flex items-start space-x-3 p-4 cursor-pointer">
                      <input type="radio" name="paymentMethod" value="Online" checked={formData.paymentMethod === 'Online'} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600 mt-0.5 flex-shrink-0" />
                       <div className="min-w-0">
                         <span className="font-semibold text-stone-700 text-sm block">Online Payment</span>
                         {safeOnlinePaymentMethods.length > 0 && (
                            <p className="text-xs text-stone-500 mt-0.5 truncate">{safeOnlinePaymentMethods.join(' / ')}</p>
                         )}
                       </div>
                    </label>
                  </div>
                )}
                 {noPaymentMethodAvailable && (
                   <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                       No payment methods are currently available. Please contact our support team for assistance.
                   </div>
                )}
            </div>
          </div>
            
          {formData.paymentMethod === 'Online' && safeSettings.onlinePaymentEnabled && (
            <div className="mt-6 pt-6 border-t border-stone-200 animate-scaleIn bg-pink-50/50 rounded-xl shadow-inner">
              <div className="text-center py-3 px-4 sm:p-4 bg-pink-100 sm:rounded-lg text-stone-800 mb-4">
                <SafeHTML 
                    content={formattedPaymentInfo} 
                    style={{
                        fontSize: safeSettings.onlinePaymentInfoStyles?.fontSize || '0.875rem',
                        lineHeight: '1.625'
                    }}
                />
              </div>

              <div className="px-4 sm:px-6 pb-6 space-y-4">
                <div className="space-y-1">
                  <label htmlFor="paymentNumber" className="text-sm font-medium text-stone-700">Your sending number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    id="paymentNumber" 
                    name="paymentNumber" 
                    value={formData.paymentNumber} 
                    onChange={handleChange} 
                    required={formData.paymentMethod === 'Online'} 
                    placeholder="e.g., 017XX XXX XXX" 
                    className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-base sm:text-sm bg-white text-black" 
                  />
                </div>

                <div className="space-y-1">
                    <label htmlFor="onlinePaymentMethod" className="text-sm font-medium text-stone-700">Payment Method <span className="text-red-500">*</span></label>
                    <select 
                        id="onlinePaymentMethod" 
                        name="onlinePaymentMethod" 
                        value={formData.onlinePaymentMethod} 
                        onChange={handleChange} 
                        required={formData.paymentMethod === 'Online'} 
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-base sm:text-sm bg-white text-black"
                    >
                        <option value="Choose" disabled>Choose</option>
                        {safeOnlinePaymentMethods.map(method => (
                           <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label htmlFor="transactionId" className="text-sm font-medium text-stone-700">Transaction ID <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        id="transactionId" 
                        name="transactionId" 
                        value={formData.transactionId} 
                        onChange={handleChange} 
                        required={formData.paymentMethod === 'Online'} 
                        placeholder="e.g., 9K8G7F6H5J" 
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-pink-600 focus:border-pink-600 transition text-base sm:text-sm bg-white text-black" 
                    />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!isFormValid} 
            className={`w-full text-white text-lg font-bold px-6 py-3.5 rounded-full transition duration-300 shadow flex items-center justify-center space-x-2 active:scale-95 mt-6 ${isFormValid ? 'bg-pink-600 hover:bg-pink-700 cursor-pointer' : 'bg-pink-300 cursor-not-allowed'}`}
          >
            <span>Place Order</span>
          </button>
        </form>

      </div>
    </main>
  );
};

export default CheckoutPage;
