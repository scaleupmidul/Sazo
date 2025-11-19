import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingCart, ChevronDown, X } from 'lucide-react';
import { useAppStore } from '../store';

const ProductDetailsPageSkeleton: React.FC = () => (
  <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 animate-pulse">
    <div className="h-6 bg-stone-200 rounded w-32 mb-6 sm:mb-8"></div>
    <div className="lg:grid lg:grid-cols-2 lg:gap-12 bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-stone-200">
      <div className="space-y-4">
        <div className="aspect-[3.5/4] bg-stone-200 rounded-xl"></div>
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

  const [selectedImage, setSelectedImage] = useState(product?.images[0]);
  const [quantity, setQuantity] = useState(1);
  const isFreeSizeOnly = product?.sizes.length === 1 && product.sizes[0] === 'Free';
  const [selectedSize, setSelectedSize] = useState<string | null>(isFreeSizeOnly ? 'Free' : null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (product) {
        setSelectedImage(product.images[0]);
        const isFreeSize = product.sizes.length === 1 && product.sizes[0] === 'Free';
        setSelectedSize(isFreeSize ? 'Free' : null);

        // Push view_item event to dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'view_item',
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

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      <button onClick={() => navigate('/shop')} className="mb-6 sm:mb-8 flex items-center text-stone-600 hover:text-stone-900 transition text-sm w-full">
        <ChevronDown className="w-4 h-4 transform rotate-90" /> Back to Shop
      </button>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12 bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-stone-200">
        <div className="space-y-4">
          <div className="aspect-[3.5/4] overflow-hidden rounded-xl">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex space-x-3 overflow-x-auto p-1">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer transition duration-300 ${selectedImage === img ? 'ring-2 ring-pink-600 scale-105' : 'opacity-75 hover:opacity-100'}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
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
              {product.sizes.map(size => (
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
            <p><strong>Colors Available:</strong> {product.colors.join(', ')}</p>
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