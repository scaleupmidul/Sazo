import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingCart, X, ArrowRight } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  addToCart: (product: Product, quantity: number, size: string) => void;
  navigate: (path: string) => void;
  notify: (message: string, type?: 'success' | 'error') => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, addToCart, navigate, notify }) => {
  const [quantity, setQuantity] = useState(1);
  const isFreeSizeOnly = product?.sizes.length === 1 && product.sizes[0] === 'Free';
  const [selectedSize, setSelectedSize] = useState<string | null>(isFreeSizeOnly ? 'Free' : null);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      const isFreeSize = product.sizes.length === 1 && product.sizes[0] === 'Free';
      setSelectedSize(isFreeSize ? 'Free' : null);
    }
  }, [product]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      notify("Please select a size.", "error");
      return;
    }
    addToCart(product, quantity, selectedSize);
    onClose();
    navigate('/cart');
  };
  
  const handleNavigateToDetails = () => {
      onClose();
      navigate(`/product/${product.id}`);
  }

  const originalPrice = product.price + 200;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-scaleIn"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition z-10" aria-label="Close">
          <X className="w-6 h-6" />
        </button>

        <div className="aspect-[3.5/4] overflow-hidden rounded-xl">
            {/* FIX: Corrected property access from `product.image` to `product.images[0]` to match the Product type. */}
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col space-y-4 overflow-y-auto pr-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{product.name}</h2>
            <div className="flex items-baseline space-x-3 mt-2">
              <span className="text-base text-gray-500 line-through">৳{originalPrice.toLocaleString('en-IN')}</span>
              <span className="text-2xl font-bold text-pink-600">৳{product.price.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mt-4">{product.description}</p>
          </div>
            
          <div className="space-y-3 pt-2 pb-4 border-y border-pink-100">
            <p className="text-base font-bold text-gray-800">Size: <span className="text-pink-600">{selectedSize === 'Free' ? 'Free Size' : (selectedSize || 'Select')}</span></p>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => !isFreeSizeOnly && setSelectedSize(size)}
                  className={`${size === 'Free' ? 'px-2 py-1' : 'px-4 py-2'} text-sm font-medium rounded-lg border transition duration-200 ${selectedSize === size ? 'bg-pink-600 text-white border-pink-600 shadow-md' : 'bg-white text-gray-700 border-gray-300 hover:bg-pink-100'} ${isFreeSizeOnly && size !== 'Free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isFreeSizeOnly && size !== 'Free'}
                >
                  {size === 'Free' ? 'Free Size' : size}
                </button>
              ))}
            </div>
            {isFreeSizeOnly && <p className="text-xs text-green-600 font-semibold mt-2">This item is only available in Free Size.</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
            <div className="flex items-center border border-pink-300 rounded-full w-full sm:w-auto justify-center">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-pink-600 hover:bg-pink-100 rounded-l-full transition active:scale-95">-</button>
              <span className="w-8 text-center font-bold text-lg text-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-pink-600 hover:bg-pink-100 rounded-r-full transition active:scale-95">+</button>
            </div>
            <button onClick={handleAddToCart} className="flex-1 bg-pink-600 text-white text-base font-bold px-6 py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow-xl flex items-center justify-center space-x-2 active:scale-95">
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
          
          <button onClick={handleNavigateToDetails} className="text-pink-600 hover:text-pink-800 transition text-sm font-medium flex items-center justify-center space-x-1 pt-4">
             <span>View Full Details</span>
             <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;