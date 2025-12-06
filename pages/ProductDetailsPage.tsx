
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { ShoppingCart, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';

const ProductDetailsPageSkeleton: React.FC = () => (
  <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 animate-pulse">
    <div className="h-6 bg-stone-200 rounded w-32 mb-6 sm:mb-8"></div>
    <div className="lg:grid lg:grid-cols-2 lg:gap-12 bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-stone-200">
      <div className="space-y-4">
        <div className="bg-stone-200 rounded-xl" style={{ aspectRatio: '3.5/4' }}></div>
        <div className="flex space-x-3 p-1">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-200 rounded-lg"></div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-200 rounded-lg"></div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-stone-200 rounded-lg"></div>
        </div>
      </div>
      <div className="mt-6 lg:mt-0 space-y-6">
        <div className="h-10 bg-stone-200 rounded w-3/4"></div>
        <div className="h-8 bg-stone-200 rounded w-1/4"></div>
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-stone-200 rounded"></div>
          <div className="h-4 bg-stone-200 rounded"></div>
          <div className="h-4 bg-stone-200 rounded w-5/6"></div>
        </div>
        <div className="space-y-4 pt-4 pb-6 border-b border-stone-200">
          <div className="h-6 bg-stone-200 rounded w-1/3"></div>
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-20 bg-stone-200 rounded-lg"></div>
            <div className="h-10 w-20 bg-stone-200 rounded-lg"></div>
            <div className="h-10 w-20 bg-stone-200 rounded-lg"></div>
          </div>
        </div>
        <div className="space-y-3 py-4">
          <div className="h-4 bg-stone-200 rounded w-1/2"></div>
          <div className="h-4 bg-stone-200 rounded w-2/3"></div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <div className="h-12 w-32 bg-stone-200 rounded-full"></div>
          <div className="h-12 flex-1 bg-stone-200 rounded-full"></div>
        </div>
      </div>
    </div>
  </main>
);

const ProductDetailsPage: React.FC = () => {
  const { product, settings, navigate, addToCart, notify, loading } = useAppStore(state => ({
    product: state.selectedProduct,
    settings: state.settings,
    navigate: state.navigate,
    addToCart: state.addToCart,
    notify: state.notify,
    loading: state.loading
  }));

  // Display exactly what is available in product.images. 
  // No automatic duplication/repeating logic.
  const images = useMemo(() => {
    if (!product || !product.images) return [];
    return product.images.filter(img => img && img !== "");
  }, [product]);

  const sizes = product?.sizes || [];
  const displayColors = product?.colors || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const isFreeSizeOnly = sizes.length === 1 && sizes[0] === 'Free';
  const [selectedSize, setSelectedSize] = useState<string | null>(isFreeSizeOnly ? 'Free' : null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Swipe state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (product) {
        setCurrentImageIndex(0);
        const productSizes = product.sizes || [];
        const isFreeSize = productSizes.length === 1 && productSizes[0] === 'Free';
        setSelectedSize(isFreeSize ? 'Free' : null);
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'view_item',
            page_location: window.location.href,
            page_path: window.location.pathname,
            page_title: document.title,
            ecommerce: {
                currency: 'BDT',
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    item_category: product.category,
                    price: product.price
                }]
            }
        });
    }
  }, [product]);

  const handleNextImage = useCallback(() => {
    if (images.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    if (images.length > 0) {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  // Swipe handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
  }

  if (loading && !product) {
    return <ProductDetailsPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="p-10 text-center text-red-500">
        Error: Product not found. <button onClick={() => navigate('/shop')} className="text-pink-600 underline">Go to Shop</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
        notify("Please select a size.", "error"); 
        return;
    }
    addToCart(product, quantity, selectedSize);
    navigate('/cart');
  };

  const originalPrice = product.price + 200;
  const selectedImage = images[currentImageIndex] || '';

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
      <button onClick={() => navigate('/shop')} className="mb-6 sm:mb-8 flex items-center text-stone-600 hover:text-stone-900 transition text-sm w-full">
        <ChevronDown className="w-4 h-4 transform rotate-90" /> Back to Shop
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12 bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-stone-200">
        <div className="space-y-4">
          <div 
            className="w-full relative bg-stone-100 rounded-xl overflow-hidden group touch-pan-y"
            style={{ aspectRatio: '3.5/4' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {images.length > 0 ? (
                <img 
                    src={selectedImage} 
                    alt={product.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
                />
            ) : (
                 <div className="absolute inset-0 w-full h-full flex items-center justify-center text-stone-400">No Image Available</div>
            )}

            {/* Navigation Arrows (Show only if multiple images) */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 z-20"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95 z-20"
                         aria-label="Next image"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                        {images.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex ? 'bg-pink-600 w-6' : 'bg-white/70 w-2 hover:bg-white'}`}
                            />
                        ))}
                    </div>
                </>
            )}
          </div>
          
          {/* Thumbnails - Always show if at least 1 image exists to confirm loaded state */}
          {images.length > 0 && (
              <div className="flex space-x-3 overflow-x-auto p-1 scrollbar-hide">
                {images.map((img, index) => (
                  <div 
                    key={index}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg cursor-pointer transition duration-300 border-2 overflow-hidden ${index === currentImageIndex ? 'border-pink-600 ring-2 ring-pink-100 scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:border-stone-200'}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
          )}
        </div>

        <div className="mt-6 lg:mt-0 space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">{product.name}</h1>
          <div className="flex items-baseline space-x-3">
            {product.onSale && <span className="text-lg text-stone-500 line-through">৳{originalPrice.toLocaleString('en-IN')}</span>}
            <span className="text-3xl font-medium text-pink-600">৳{product.price.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">{product.description}</p>
            
          <div className="space-y-4 pt-4 pb-6 border-b border-stone-200">
             <div className="flex justify-between items-center">
                <p className="text-base font-bold text-stone-800">Size: <span className="text-pink-600">{selectedSize === 'Free' ? 'Free Size' : (selectedSize || 'Select')}</span></p>
                {settings.productPagePromoImage && (
                    <button onClick={() => setIsSizeGuideOpen(true)} className="text-sm text-pink-600 underline hover:text-pink-800 transition">
                        View size guide
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-3">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => !isFreeSizeOnly && setSelectedSize(size)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition duration-200 ${selectedSize === size ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-stone-700 border-stone-300 hover:bg-pink-50 hover:border-pink-400'} ${isFreeSizeOnly && size !== 'Free' ? 'opacity-50 cursor-not-allowed' : ''} ${isFreeSizeOnly && size === 'Free' ? 'shadow-lg ring-2 ring-pink-600' : ''}`}
                  disabled={isFreeSizeOnly && size !== 'Free'}
                >
                  {size === 'Free' ? 'Free Size' : size}
                </button>
              ))}
            </div>
            {isFreeSizeOnly && <p className="text-xs text-green-700 font-semibold mt-2">This item is only available in Free Size.</p>}
          </div>

          <div className="space-y-3 py-4 text-sm text-stone-800">
            <p><strong>Fabric:</strong> {product.fabric}</p>
            <p><strong>Colors Available:</strong> {displayColors.join(', ')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <div className="flex items-center border border-stone-300 rounded-full w-full sm:w-auto justify-center">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-stone-600 hover:bg-pink-100 rounded-l-full transition active:scale-95">-</button>
              <span className="w-8 text-center font-bold text-lg text-stone-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-stone-600 hover:bg-pink-100 rounded-r-full transition active:scale-95">+</button>
            </div>
            <button onClick={handleAddToCart} className="flex-1 bg-pink-600 text-white text-base font-bold px-6 py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow flex items-center justify-center space-x-2 active:scale-95">
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
      
      {isSizeGuideOpen && settings.productPagePromoImage && (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-scaleIn"
            onClick={() => setIsSizeGuideOpen(false)}
        >
            <div
                className="relative bg-white p-2 sm:p-4 rounded-lg shadow-2xl w-full max-w-3xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsSizeGuideOpen(false)}
                    className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-white p-2 rounded-full text-stone-700 hover:text-pink-600 transition shadow-lg z-10"
                    aria-label="Close size guide"
                >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="overflow-hidden rounded-md">
                   <img
                        src={settings.productPagePromoImage}
                        alt="Size Guide"
                        className="w-full h-auto object-contain max-h-[85vh]"
                    />
                </div>
            </div>
        </div>
    )}
    </main>
  );
};

export default ProductDetailsPage;
