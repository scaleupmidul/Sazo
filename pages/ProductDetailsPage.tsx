
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product } from '../types';
import { ShoppingCart, ShoppingBag, ChevronLeft, ChevronRight, Share2, Plus, Minus, ChevronDown, Truck, ShieldCheck, Ruler, Heart, ArrowRight, X, Star, CreditCard, RefreshCw, Beaker, AlertCircle, Tag } from 'lucide-react';
import { useAppStore } from '../store';

// --- Reusable Components ---

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ElementType }> = ({ title, children, defaultOpen = false, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full py-4 flex justify-between items-center text-left hover:bg-stone-50/50 transition px-2 -mx-2 group rounded-lg"
      >
        <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-pink-500" />}
            <span className="font-semibold text-stone-800 text-sm tracking-wide">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <div className="text-stone-600 text-sm leading-relaxed px-2">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Trust Badge Component ---
const TrustBadge: React.FC<{ icon: React.ElementType, title: string, sub: string }> = ({ icon: Icon, title, sub }) => (
    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
        <div className="p-2 bg-white rounded-full shadow-sm text-pink-600">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs font-bold text-stone-800 uppercase tracking-wide">{title}</p>
            <p className="text-[10px] text-stone-500">{sub}</p>
        </div>
    </div>
);

// --- Skeleton Loader ---
const ProductDetailsPageSkeleton: React.FC = () => (
  <main className="max-w-[1280px] mx-auto px-4 lg:px-8 pt-6 lg:pt-12 animate-pulse min-h-screen">
    <div className="lg:grid lg:grid-cols-2 lg:gap-16">
      <div className="w-full">
        <div className="aspect-[3/4] bg-stone-300 w-full rounded-2xl mb-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
        </div>
        <div className="hidden lg:flex gap-4">
             <div className="w-20 h-24 bg-stone-200 rounded-lg"></div>
             <div className="w-20 h-24 bg-stone-200 rounded-lg"></div>
             <div className="w-20 h-24 bg-stone-200 rounded-lg"></div>
        </div>
      </div>
      <div className="mt-8 lg:mt-0 space-y-6">
        <div className="h-8 bg-stone-300 rounded w-3/4"></div>
        <div className="h-6 bg-stone-200 rounded w-1/4"></div>
        <div className="space-y-3 pt-6">
            <div className="h-12 bg-stone-200 rounded w-full"></div>
            <div className="h-12 bg-stone-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  </main>
);

const ProductDetailsPage: React.FC = () => {
  const { product, settings, navigate, addToCart, notify, loading, refreshProduct } = useAppStore(state => ({
    product: state.selectedProduct,
    settings: state.settings,
    navigate: state.navigate,
    addToCart: state.addToCart,
    notify: state.notify,
    loading: state.loading,
    refreshProduct: state.refreshProduct
  }));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const isOutOfStock = product?.isOutOfStock ?? false;
  const analyticsFiredId = useRef<string | null>(null);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchProductData = async () => {
        const pathParts = window.location.pathname.split('/');
        const pathId = pathParts[pathParts.length - 1];
        
        if (pathId && pathId !== 'product') {
             await refreshProduct(pathId);
        }
        if (isMounted) setIsFetching(false);
    };

    fetchProductData();
    return () => { isMounted = false; };
  }, [refreshProduct]);

  const images = useMemo(() => {
    if (!product || !product.images) return [];
    return product.images.filter(img => img && img !== "");
  }, [product]);

  const sizes = product?.sizes || [];
  const isFreeSizeOnly = sizes.length === 1 && sizes[0] === 'Free';
  const singleAvailableSize = sizes.length === 1 ? sizes[0] : null;

  const isCosmetics = useMemo(() => product?.category.toLowerCase() === 'cosmetics', [product]);

  useEffect(() => {
    if (product) {
        const currentId = product.productId || product.id;
        if (analyticsFiredId.current !== currentId) {
            setCurrentImageIndex(0);
            setSelectedSize(singleAvailableSize);
            window.scrollTo(0, 0); 
            
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: 'view_item',
                ecommerce: {
                    currency: 'BDT',
                    items: [{
                        item_id: currentId,
                        item_name: product.name,
                        item_category: product.category,
                        price: product.price
                    }]
                }
            });
            
            analyticsFiredId.current = currentId;
        }
    }
  }, [product, singleAvailableSize]);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 4000); 

    return () => clearInterval(interval);
  }, [images.length, currentImageIndex, isPaused]);

  const handleNextImage = useCallback(() => {
    if (images.length > 0) setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    if (images.length > 0) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
  }

  const validateSelection = () => {
      if (isOutOfStock) return false;
      if (!selectedSize) {
        notify("Please select a size first.", "error"); 
        return false;
    }
    if (!product) return false;
    return true;
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    if (!product) return;
    
    addToCart(product, quantity, selectedSize!);
    navigate('/cart');
  };

  const handleBuyNow = () => {
      if (!validateSelection()) return;
      if (!product) return;

      addToCart(product, quantity, selectedSize!);
      navigate('/checkout');
  }

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: product?.name || 'SAZO Product',
                  text: `Check out this amazing ${product?.name} on SAZO!`,
                  url: window.location.href,
              });
          } catch (error) {
              console.log('Error sharing', error);
          }
      } else {
          navigator.clipboard.writeText(window.location.href);
          notify("Link copied to clipboard!", "success");
      }
  };

  if ((loading || isFetching) && !product) return <ProductDetailsPageSkeleton />;
  
  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="p-6 bg-stone-50 rounded-full">
            <ShoppingBag className="w-12 h-12 text-stone-300"/>
        </div>
        <p className="text-stone-600 text-xl font-medium">Product not found.</p>
        <button onClick={() => navigate('/shop')} className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-700 transition shadow-lg active:scale-95">
            Continue Shopping
        </button>
      </div>
    );
  }

  const regularPrice = product.regularPrice || (product.onSale ? product.price + 500 : product.price);
  const hasDiscount = regularPrice > product.price;
  const savingsAmount = regularPrice - product.price;

  const ProductTags = () => (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
        {product.isNewArrival && !isOutOfStock && <span className="bg-pink-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-sm rounded-sm">NEW</span>}
        {product.isTrending && !isOutOfStock && <span className="bg-amber-400 text-stone-900 text-[10px] font-bold px-3 py-1 uppercase tracking-wider shadow-sm rounded-sm">BEST</span>}
        {isOutOfStock && <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm rounded-sm">SOLD OUT</span>}
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-28 lg:pb-12 relative"> 
      
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden flex items-center justify-between p-4 pointer-events-none">
        <button onClick={() => navigate('/shop')} className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm text-stone-800 pointer-events-auto active:scale-90 transition">
             <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm text-stone-800 pointer-events-auto active:scale-90 transition">
            <Share2 className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-[1280px] mx-auto lg:px-8 lg:pt-8">
        <nav className="hidden lg:flex items-center space-x-2 text-xs font-medium text-stone-500 mb-8 uppercase tracking-wider">
            <span onClick={() => navigate('/')} className="cursor-pointer hover:text-pink-600 transition">Home</span>
            <ChevronRight className="w-3 h-3 text-stone-300"/>
            <span onClick={() => navigate('/shop')} className="cursor-pointer hover:text-pink-600 transition">Shop</span>
            <ChevronRight className="w-3 h-3 text-stone-300"/>
            <span className="text-stone-900 line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            <div className="w-full select-none">
                <div 
                    className="lg:hidden relative bg-stone-100 w-full aspect-[3/4] overflow-hidden group touch-pan-y"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {images.length > 0 ? (
                        <>
                            <img 
                                src={images[currentImageIndex]} 
                                alt={product.name} 
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isOutOfStock ? 'grayscale-[0.5] opacity-60' : ''}`} 
                            />
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400">No Image</div>
                    )}
                    <ProductTags />
                </div>

                <div className="hidden lg:flex flex-col gap-4">
                    <div 
                        className={`relative w-full aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden group shadow-sm border border-stone-100 cursor-zoom-in ${isOutOfStock ? 'grayscale-[0.5]' : ''}`}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <ProductTags />
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={product.name}
                                    className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${isOutOfStock ? 'opacity-60' : ''}`}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-stone-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 hover:-translate-x-1">
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-stone-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 hover:translate-x-1">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-stone-400">No Image</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto p-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`relative w-20 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ${currentImageIndex === idx ? 'ring-2 ring-pink-600 ring-offset-2 opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                                    <img src={img} alt={`Thumbnail ${idx}`} className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale-[0.5]' : ''}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 pt-6 lg:pt-0">
                <div className="mb-6 border-b border-stone-100 pb-6">
                    <div className="flex justify-between items-start">
                        <h1 className="text-2xl lg:text-4xl font-bold text-stone-900 leading-tight mb-2">{product.name}</h1>
                        <button onClick={handleShare} className="hidden lg:flex p-2 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition">
                            <Share2 className="w-5 h-5"/>
                        </button>
                    </div>
                    
                    {/* --- TARGET PRICE DISPLAY SECTION --- */}
                    <div className="flex flex-col gap-1 mt-4">
                         <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-[2rem] lg:text-[2.5rem] font-black ${isOutOfStock ? 'text-stone-400' : 'text-pink-600'} tracking-tighter leading-none lg:leading-[1.5rem]`}>
                                ৳{product.price.toLocaleString('en-IN')}
                            </span>
                            
                            {hasDiscount && !isOutOfStock && (
                                <div className="flex flex-col gap-1.5 animate-fadeIn">
                                    <span className="text-xl lg:text-2xl text-stone-300 line-through font-bold leading-none">
                                        ৳{regularPrice.toLocaleString('en-IN')}
                                    </span>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 shadow-sm w-fit">
                                        <Tag className="w-3 h-3" />
                                        <span className="text-sm font-black uppercase tracking-widest leading-none">
                                            Save ৳{savingsAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

                {isOutOfStock && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-pulse">
                        <div className="bg-red-600 text-white p-2 rounded-full">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-red-700 uppercase tracking-widest">Out of Stock</p>
                            <p className="text-xs text-red-600 font-medium">This product is currently unavailable for purchase.</p>
                        </div>
                    </div>
                )}

                <div className={`mb-6 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-center mb-3">
                         <span className="text-sm font-bold text-stone-900">{isCosmetics ? 'Select Volume' : 'Select Size'}</span>
                         {!isCosmetics && settings.productPagePromoImage && (
                            <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center text-xs font-semibold text-pink-600 hover:text-pink-700 transition">
                                <Ruler className="w-3.5 h-3.5 mr-1"/> Size Guide
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {sizes.map(size => {
                             const isSelected = selectedSize === size;
                             return (
                                <button
                                    key={size}
                                    onClick={() => !isFreeSizeOnly && setSelectedSize(size)}
                                    disabled={isFreeSizeOnly && size !== 'Free'}
                                    className={`
                                        h-10 sm:h-12 min-w-[3.5rem] px-4 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 border
                                        ${isSelected 
                                            ? 'bg-stone-900 text-white border-stone-900 shadow-md transform scale-105' 
                                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                                        }
                                        ${isFreeSizeOnly && size !== 'Free' ? 'opacity-40 cursor-not-allowed bg-stone-50 border-stone-100 text-stone-400 decoration-slice line-through' : ''}
                                    `}
                                >
                                    {size === 'Free' ? 'One Size' : size}
                                </button>
                             );
                        })}
                    </div>
                </div>
                
                {!isOutOfStock && (
                    <div className="lg:hidden mb-8">
                         <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                            <span className="font-semibold text-stone-700 text-sm">Quantity</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-sm text-stone-600 active:scale-90 transition hover:border-pink-300 hover:text-pink-600">
                                    <Minus className="w-4 h-4"/>
                                </button>
                                <span className="text-lg font-bold text-stone-900 w-6 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-sm text-stone-600 active:scale-90 transition hover:border-pink-300 hover:text-pink-600">
                                    <Plus className="w-4 h-4"/>
                                </button>
                            </div>
                         </div>
                    </div>
                )}

                {!isOutOfStock && (
                    <div className="hidden lg:block mb-10">
                         <div className="flex items-center gap-4 mb-4">
                            <span className="text-sm font-bold text-stone-700">Quantity</span>
                            <div className="flex items-center border border-stone-200 rounded-lg w-32 justify-between px-2 h-11 bg-white">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-stone-500 hover:text-stone-900 transition"><Minus className="w-4 h-4"/></button>
                                <span className="font-bold text-stone-900 text-lg">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-stone-500 hover:text-stone-900 transition"><Plus className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleAddToCart} className="flex-1 bg-white border-2 border-stone-200 text-stone-900 font-bold text-sm uppercase tracking-widest h-14 rounded-xl hover:bg-stone-50 transition duration-300 flex items-center justify-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span>Add to Cart</span>
                            </button>
                            <button onClick={handleBuyNow} className="flex-1 bg-pink-600 text-white font-bold text-sm uppercase tracking-widest h-14 rounded-xl hover:bg-pink-700 transition duration-300 flex items-center justify-center gap-2 shadow-xl shadow-pink-200 hover:shadow-2xl transform hover:-translate-y-0.5">
                                <span>Buy It Now</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <TrustBadge icon={ShieldCheck} title="Authentic" sub="100% Original Product" />
                    <TrustBadge icon={Truck} title="Fast Delivery" sub="All over Bangladesh" />
                    <TrustBadge icon={RefreshCw} title="Easy Return" sub="If goods are damaged" />
                    <TrustBadge icon={CreditCard} title="Secure Payment" sub="COD & Online Payment" />
                </div>

                <div className="space-y-2">
                    <Accordion title="Product Description" defaultOpen>
                        <p className="mb-4 text-stone-600 font-light">{product.description}</p>
                    </Accordion>
                    {isCosmetics ? (
                        <Accordion title="Usage & Storage" icon={Beaker}>
                            <div className="space-y-2">
                                <p>Optimized for {product.fabric} routines. Follow these steps for the best results:</p>
                                <ul className="list-disc pl-5 space-y-1 text-stone-500 marker:text-pink-300">
                                     <li>Apply on clean, dry skin or hair</li>
                                     <li>Store in a cool, dry place away from direct sunlight</li>
                                     <li>Always perform a patch test before first full use</li>
                                     <li>Keep the cap tightly closed after each application</li>
                                </ul>
                            </div>
                        </Accordion>
                    ) : (
                        <Accordion title="Material & Care" icon={ShieldCheck}>
                            <div className="space-y-2">
                                <p>Crafted from premium {product.fabric} for maximum comfort and longevity.</p>
                                <ul className="list-disc pl-5 space-y-1 text-stone-500 marker:text-pink-300">
                                     <li>Machine wash cold with like colors</li>
                                     <li>Do not bleach</li>
                                     <li>Tumble dry low</li>
                                     <li>Cool iron if needed</li>
                                </ul>
                            </div>
                        </Accordion>
                    )}
                    <Accordion title="Delivery & Returns" icon={Truck}>
                         <div className="space-y-3">
                             <div className="flex items-start gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2"></div>
                                 <p><strong>Inside Dhaka:</strong> 2-3 Business Days</p>
                             </div>
                             <div className="flex items-start gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2"></div>
                                 <p><strong>Outside Dhaka:</strong> 2-4 Business Days</p>
                             </div>
                             <div className="bg-amber-50 p-3 rounded-lg text-amber-800 text-xs border border-amber-100 mt-2">
                                 Please check the product in front of the delivery man. Returns are only accepted instantly upon delivery if there is a defect.
                             </div>
                         </div>
                    </Accordion>
                </div>
            </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 lg:hidden z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
         <div className="grid grid-cols-6 gap-3 max-w-md mx-auto">
              {isOutOfStock ? (
                <button disabled className="col-span-6 h-12 bg-stone-100 text-stone-400 font-black uppercase tracking-widest text-sm rounded-full flex items-center justify-center gap-2 border border-stone-200">
                    <AlertCircle className="w-5 h-5" />
                    Currently Unavailable
                </button>
              ) : (
                <>
                    <button onClick={handleAddToCart} className="col-span-2 h-12 bg-white border border-stone-200 text-stone-700 rounded-full hover:bg-stone-50 hover:border-stone-300 active:scale-90 transition flex items-center justify-center" aria-label="Add to Cart">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button onClick={handleBuyNow} className="col-span-4 bg-pink-600 text-white font-bold text-base h-12 rounded-full hover:bg-pink-700 active:scale-95 transition flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
                        <span>Buy Now</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </>
              )}
         </div>
      </div>

       {isSizeGuideOpen && !isCosmetics && settings.productPagePromoImage && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setIsSizeGuideOpen(false)}>
                <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-stone-100 bg-stone-50">
                        <h3 className="text-lg font-bold text-stone-900">Size Guide</h3>
                        <button onClick={() => setIsSizeGuideOpen(false)} className="p-2 bg-white rounded-full hover:bg-stone-200 text-stone-600 transition shadow-sm">
                            <X className="w-5 h-5" /> 
                        </button>
                    </div>
                    <div className="overflow-y-auto p-4 flex-1 bg-white">
                        <img src={settings.productPagePromoImage} alt="Size Guide" className="w-full h-auto rounded-lg" />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProductDetailsPage;
