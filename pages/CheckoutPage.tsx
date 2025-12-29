
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { LoaderCircle, ChevronDown } from 'lucide-react';

// Bangladesh 64 Districts List
const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria", "Chandpur",
  "Chapainawabganj", "Chattogram", "Chuadanga", "Cumilla", "Cox's Bazar", "Dhaka", "Dinajpur",
  "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore",
  "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram",
  "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur",
  "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi",
  "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
  "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur",
  "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
].sort();

// Improved InputField with strictly white background and autofill fix
const InputField: React.FC<{ 
    label: string; 
    name: string; 
    type?: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; 
    required?: boolean; 
    error?: boolean;
}> = ({ label, name, type = 'text', value, onChange, required = true, error }) => {
    return (
        <div className="space-y-1.5">
          <label htmlFor={name} className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">
            {label} {required && label && <span className="text-red-500">*</span>}
          </label>
          <input 
            type={type} 
            id={name} 
            name={name} 
            value={value || ''} 
            onChange={onChange} 
            required={required} 
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-out bg-white
              ${error ? 'border-red-500 ring-4 ring-red-100' : 'border-stone-200 focus:ring-pink-500/10 focus:border-pink-500'} 
              text-stone-800 text-sm shadow-sm hover:border-stone-300
              [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] 
              [&:-webkit-autofill]:text-stone-800`} 
          />
        </div>
    );
};

const CheckoutPageSkeleton: React.FC = () => (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        <div className="h-10 bg-stone-200 rounded w-48 mx-auto mb-8"></div>
        <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-8 xl:gap-12">
            <div className="lg:col-span-2 h-fit order-1 lg:order-2 mb-8 lg:mb-0">
                <div className="h-7 bg-stone-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="w-16 h-20 bg-stone-200 rounded"></div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                            <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="h-px bg-stone-200 my-4"></div>
                    <div className="flex justify-between items-center"><div className="h-6 bg-stone-200 rounded w-1/3"></div><div className="h-8 bg-stone-200 rounded w-1/3"></div></div>
                </div>
            </div>
            <div className="lg:col-span-3 space-y-8 order-2 lg:order-1">
                <div className="space-y-4">
                    <div className="h-12 bg-stone-200 rounded-lg w-full"></div>
                    <div className="h-12 bg-stone-200 rounded-lg w-full"></div>
                </div>
                <div className="h-14 bg-stone-200 rounded-full mt-8 w-full"></div>
            </div>
        </div>
    </main>
);

const SafeHTML: React.FC<{ content: string; style?: React.CSSProperties }> = ({ content, style }) => {
    try {
        if (!content) return null;
        return (
            <div
                className="font-semibold text-stone-800"
                style={style}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    } catch (e) {
        return <div className="font-semibold text-stone-800" style={style}>{content}</div>;
    }
};

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, navigate, clearCart, notify, addOrder, settings: storeSettings, loading, products, ensureAllProductsLoaded, fullProductsLoaded } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [gtmFired, setGtmFired] = useState(false);
  const [isAttempted, setIsAttempted] = useState(false);
  
  useEffect(() => {
      if (!fullProductsLoaded) {
          ensureAllProductsLoaded();
      }
  }, [fullProductsLoaded, ensureAllProductsLoaded]);

  const safeSettings = useMemo(() => {
      if (!storeSettings) {
          return {
            codEnabled: true,
            onlinePaymentEnabled: true,
            shippingOptions: [],
            onlinePaymentMethods: [],
            onlinePaymentInfo: '',
            onlinePaymentInfoStyles: { fontSize: '0.875rem' },
          };
      }
      return {
        codEnabled: storeSettings.codEnabled ?? true,
        onlinePaymentEnabled: storeSettings.onlinePaymentEnabled ?? true,
        shippingOptions: Array.isArray(storeSettings.shippingOptions) ? storeSettings.shippingOptions : [],
        onlinePaymentMethods: Array.isArray(storeSettings.onlinePaymentMethods) ? storeSettings.onlinePaymentMethods : [],
        onlinePaymentInfo: typeof storeSettings.onlinePaymentInfo === 'string' ? storeSettings.onlinePaymentInfo : '',
        onlinePaymentInfoStyles: storeSettings.onlinePaymentInfoStyles || { fontSize: '0.875rem' },
      };
  }, [storeSettings]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '', // This acts as the District Selection
    address: '',
    note: '', // Acts as Comment
    paymentMethod: '',
    shippingOptionId: '',
    paymentNumber: '',
    onlinePaymentMethod: 'Choose',
    transactionId: '',
  });

  const safeCartTotal = Number.isFinite(cartTotal) ? cartTotal : 0;

  useEffect(() => {
    if (!loading && (!cart || cart.length === 0)) {
      navigate('/shop');
    }
  }, [loading, cart, navigate]);
  
  useEffect(() => {
    if (!loading && cart && cart.length > 0 && !gtmFired) {
        const pendingIdResolution = cart.some(item => {
            const productInStore = products.find(p => p.id === item.id);
            const idToCheck = item.productId || productInStore?.productId || item.id;
            return idToCheck.length === 24 && !fullProductsLoaded;
        });

        if (pendingIdResolution) return;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'begin_checkout',
            ecommerce: {
                currency: 'BDT',
                value: safeCartTotal,
                items: cart.map(item => {
                    const productInStore = products.find(p => p.id === item.id);
                    const finalId = item.productId || productInStore?.productId || item.id;
                    return {
                        item_id: finalId,
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
  }, [cart, safeCartTotal, loading, products, fullProductsLoaded, gtmFired]);
  
  const isOnlinePaymentVisible = safeSettings.onlinePaymentEnabled;

  useEffect(() => {
    if (loading) return; 
    
    setFormData(prev => {
        const newData = { ...prev };
        let changed = false;

        const isCodAvailable = safeSettings.codEnabled;
        const currentMethodValid = 
            (prev.paymentMethod === 'COD' && isCodAvailable) || 
            (prev.paymentMethod === 'Online' && isOnlinePaymentVisible);

        if (!currentMethodValid) {
            if (isCodAvailable) newData.paymentMethod = 'COD';
            else if (isOnlinePaymentVisible) newData.paymentMethod = 'Online';
            changed = true;
        }

        if (!prev.shippingOptionId && safeSettings.shippingOptions.length > 0) {
            newData.shippingOptionId = safeSettings.shippingOptions[0].id;
            changed = true;
        }

        return changed ? newData : prev;
    });
  }, [safeSettings, loading, isOnlinePaymentVisible]);

  const selectedShippingOption = useMemo(() => {
    if (!safeSettings.shippingOptions || safeSettings.shippingOptions.length === 0) return null;
    return safeSettings.shippingOptions.find(opt => opt.id === formData.shippingOptionId) || safeSettings.shippingOptions[0];
  }, [formData.shippingOptionId, safeSettings.shippingOptions]);

  const shippingCharge = selectedShippingOption?.charge || 0;
  const isOnlinePayment = formData.paymentMethod === 'Online';
  const effectiveShippingCharge = isOnlinePayment ? 0 : shippingCharge;
  const totalPayable = safeCartTotal + effectiveShippingCharge;

  const formattedPaymentInfo = useMemo(() => {
      const info = safeSettings.onlinePaymentInfo || '';
      return info.replace(/(<\/?br\s*\/?>)\s*[\r\n]+/gi, '$1');
  }, [safeSettings.onlinePaymentInfo]);
  
  if (loading || !cart || cart.length === 0) {
      return <CheckoutPageSkeleton />;
  }
  
  const noPaymentMethodAvailable = !safeSettings.codEnabled && !isOnlinePaymentVisible;
  const noShippingMethodAvailable = safeSettings.shippingOptions.length === 0;
  const safeOnlinePaymentMethods = safeSettings.onlinePaymentMethods;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = (() => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.address.trim()) {
        return false;
    }
    if (!formData.shippingOptionId) {
        return false;
    }
    if (formData.paymentMethod === 'Online' && isOnlinePaymentVisible) {
        if (!formData.paymentNumber.trim() || formData.onlinePaymentMethod === 'Choose') {
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
    if (isSubmittingRef.current || isSubmitting) return;

    if (!isFormValid) {
        setIsAttempted(true);
        notify("Please fill in all required fields.", "error");
        return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const paymentInfo = {
        paymentMethod: formData.paymentMethod as 'COD' | 'Online',
        paymentDetails: formData.paymentMethod === 'Online' ? {
            paymentNumber: formData.paymentNumber,
            method: formData.onlinePaymentMethod,
            amount: totalPayable,
            transactionId: formData.transactionId
        } : undefined
    };
    
    const cartForOrder = cart.map(item => {
        const productInStore = products.find(p => p.id === item.id);
        const finalId = item.productId || productInStore?.productId || item.id;
        return { ...item, productId: finalId };
    });
    
    try {
        const newOrder = await addOrder(
          { 
              firstName: formData.fullName, 
              lastName: '', 
              email: formData.email, 
              phone: formData.phone, 
              address: formData.address,
              city: formData.city, // Selected District
              note: formData.note // Comment
          },
          cartForOrder,
          totalPayable,
          paymentInfo,
          shippingCharge
        );
    
        const orderId = newOrder.orderId || newOrder.id;
        if (orderId) {
            clearCart();
            navigate(`/thank-you/${orderId}`);
        }
    } catch (error: any) {
        notify(error.message || "Failed to place order.", "error");
        isSubmittingRef.current = false;
        setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-40 lg:pb-24">
      <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8 text-center">Checkout</h2>
      
      <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-8 xl:gap-12">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-stone-200 lg:sticky top-24 h-fit order-1 lg:order-2 mb-6 lg:mb-0">
          <h3 className="text-xl font-bold text-stone-900 mb-4 sm:mb-6">Order Summary</h3>
          <div className="space-y-4 mb-6 max-h-60 sm:max-h-none overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3">
                <div className="w-16 aspect-[3.5/4] flex-shrink-0 overflow-hidden rounded-md border border-stone-100">
                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-stone-800 line-clamp-2 leading-tight">{item.name}</h4>
                   <p className="text-xs text-stone-500 mt-1">Size: {item.size} &bull; Quantity: {item.quantity}</p>
                  <p className="text-sm font-bold text-pink-600 mt-1">৳{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 pt-4 space-y-3 text-sm">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>৳{safeCartTotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-stone-600 border-b border-stone-200 pb-4">
              <span className="font-semibold w-2/3">Shipping ({selectedShippingOption?.label || 'Not selected'})</span>
              <span>{isOnlinePayment ? '(Advance)' : `৳${shippingCharge.toLocaleString()}`}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200 flex justify-between items-center shadow-sm">
            <span className="text-base font-bold text-stone-900">Total Payable</span>
            <span className="text-xl font-extrabold text-pink-600">৳{totalPayable.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-stone-200 order-2 lg:order-1">
          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-6">Shipping Information</h3>
            <div className="space-y-5">
              <InputField label="Full Name ( সম্পূন্ন নাম )" name="fullName" value={formData.fullName} onChange={handleChange} required error={isAttempted && !formData.fullName.trim()} />
              <InputField label="EMAIL ADDRESS ( ইমেল এড্রেস )" name="email" type="email" value={formData.email} onChange={handleChange} required error={isAttempted && !formData.email.trim()} />
              <InputField label="MOBILE NUMBER (মোবাইল নম্বর)" name="phone" type="tel" value={formData.phone} onChange={handleChange} required error={isAttempted && !formData.phone.trim()} />
              
              <div className="space-y-1.5">
                  <label htmlFor="city" className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">
                    SELECT DISTRICT (জেলা নির্বাচন করুন) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                      <select 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        required 
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-out bg-white
                          ${isAttempted && !formData.city ? 'border-red-500 ring-4 ring-red-100' : 'border-stone-200 focus:ring-pink-500/10 focus:border-pink-500'} 
                          text-stone-800 text-sm shadow-sm appearance-none cursor-pointer hover:border-stone-300`}
                      >
                        <option value="" disabled>Choose District</option>
                        {BANGLADESH_DISTRICTS.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="address" className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">
                    Delivery Address (ডেলিভারি ঠিকানা) <span className="text-red-500">*</span>
                </label>
                <textarea id="address" name="address" value={formData.address} onChange={handleChange} required rows={3} placeholder="Road, Area, Thana & District" 
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 ease-out bg-white
                  ${isAttempted && !formData.address.trim() ? 'border-red-500 ring-4 ring-red-100' : 'border-stone-200 focus:ring-pink-500/10 focus:border-pink-500'} 
                  text-stone-800 text-sm shadow-sm hover:border-stone-300 resize-none
                  [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset]`} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="note" className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">
                    COMMENT (মন্তব্য - OPTIONAL)
                </label>
                <textarea id="note" name="note" value={formData.note} onChange={handleChange} rows={3} className={`w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all duration-300 ease-out bg-white text-stone-800 text-sm shadow-sm hover:border-stone-300 resize-none`} />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4 pt-4">Delivery Charge</h3>
            <div className="space-y-3">
              {safeSettings.shippingOptions.map((option) => (
                <div key={option.id} className={`rounded-lg border transition-all duration-200 overflow-hidden ${formData.shippingOptionId === option.id ? 'bg-pink-50 border-pink-600' : 'bg-white border-stone-300'}`} onClick={() => setFormData(prev => ({ ...prev, shippingOptionId: option.id }))}>
                  <label className="flex items-center w-full p-4 cursor-pointer gap-3">
                    <input type="radio" name="shippingOptionId" value={option.id} checked={formData.shippingOptionId === option.id} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600" />
                    <div className="flex-1 flex justify-between items-center"><span className="font-semibold text-stone-700 text-sm">{option.label}</span><span className="font-bold text-stone-900 text-sm">{option.charge} ৳</span></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {!noPaymentMethodAvailable && (
              <div>
                <h3 className="text-xl font-bold text-pink-600 border-b pb-2 mb-4 pt-4">Payment Method</h3>
                <div className="space-y-3">
                   {safeSettings.codEnabled && (
                      <div className="rounded-lg border border-stone-300 bg-white" onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}>
                        <label className="flex items-start space-x-3 p-4 cursor-pointer">
                          <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600 mt-0.5" />
                          <div><span className="font-semibold text-stone-700 text-sm block">Cash on Delivery (COD)</span><p className="text-xs text-stone-500 mt-0.5">Pay upon receiving the product</p></div>
                        </label>
                      </div>
                    )}
                    {isOnlinePaymentVisible && (
                      <div className={`rounded-lg border transition-all duration-200 overflow-hidden ${formData.paymentMethod === 'Online' ? 'border-pink-600 bg-pink-50/30' : 'border-stone-300 bg-white'}`} onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Online' }))}>
                        <label className="flex items-center space-x-3 p-4 cursor-pointer">
                          <input type="radio" name="paymentMethod" value="Online" checked={formData.paymentMethod === 'Online'} onChange={handleChange} className="form-radio h-5 w-5 text-pink-600 focus:ring-pink-600 flex-shrink-0" />
                           <div className="min-w-0 w-full">{formData.paymentMethod !== 'Online' && <span className="font-semibold text-stone-700 text-sm block">Bkash / Nagad / Rocket</span>}</div>
                        </label>
                        {formData.paymentMethod === 'Online' && (
                            <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
                                 <div className="text-center py-3 px-4 bg-pink-100 rounded-lg text-stone-800 mb-4">
                                    <SafeHTML content={formattedPaymentInfo} style={{ fontSize: safeSettings.onlinePaymentInfoStyles?.fontSize || '0.875rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }} />
                                  </div>
                                  <div className="space-y-5">
                                    <InputField label="Your Sending Number (আপনার বিকাশ/নগদ নম্বর)" name="paymentNumber" type="tel" value={formData.paymentNumber} onChange={handleChange} required error={isAttempted && !formData.paymentNumber.trim()} />
                                    <div className="space-y-1.5">
                                        <label htmlFor="onlinePaymentMethod" className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Payment Method (পেমেন্ট পদ্ধতি) <span className="text-red-500">*</span></label>
                                        <select id="onlinePaymentMethod" name="onlinePaymentMethod" value={formData.onlinePaymentMethod} onChange={handleChange} required 
                                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white
                                            ${isAttempted && formData.onlinePaymentMethod === 'Choose' ? 'border-red-500 ring-4 ring-red-100' : 'border-stone-200 focus:ring-pink-500/10 focus:border-pink-500'} 
                                            text-stone-800 text-sm shadow-sm appearance-none cursor-pointer hover:border-stone-300`}
                                        >
                                            <option value="Choose" disabled>Choose</option>
                                            {safeOnlinePaymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                                        </select>
                                    </div>
                                    <InputField label="Transaction ID (ট্রানজেকশন আইডি - Optional)" name="transactionId" value={formData.transactionId} onChange={handleChange} required={false} />
                                  </div>
                            </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
          )}
          
          <div className="pt-4 pb-6">
              <button type="submit" disabled={isSubmitting} className={`w-full text-white text-lg font-bold px-6 py-3.5 rounded-full transition shadow flex items-center justify-center space-x-2 active:scale-95 bg-pink-600 hover:bg-pink-700 cursor-pointer disabled:bg-pink-300 disabled:cursor-not-allowed`}>
                {isSubmitting ? <><LoaderCircle className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <span>Place Order</span>}
              </button>
              {!isFormValid && isAttempted && <p className="text-red-500 text-xs text-center mt-3 font-medium animate-pulse mb-4">Fill all required fields</p>}
          </div>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;
