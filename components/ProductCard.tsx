import React, { useState, memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useAppStore } from '../store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const originalPrice = product.price + 200;
    const navigate = useAppStore(state => state.navigate);

    return (
        <div 
            className="bg-white rounded-lg border border-stone-200 overflow-hidden transition duration-500 ease-in-out shadow-lg hover:shadow-2xl hover:-translate-y-2 group cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div
                className="relative aspect-[3.5/4] overflow-hidden bg-stone-200"
            >
                {!isImageLoaded && <div className="absolute inset-0 bg-stone-200 animate-pulse"></div>}
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className={`object-cover w-full h-full transition-opacity duration-500 group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsImageLoaded(true)}
                />
                <div className="absolute top-3 left-3 flex flex-col items-start space-y-1.5">
                    {product.isNewArrival && (
                        <span className="bg-pink-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow tracking-wider uppercase">NEW</span>
                    )}
                    {product.isTrending && (
                        <span className="bg-amber-400 text-stone-900 text-[9px] font-bold px-2.5 py-1 rounded-full shadow tracking-wider uppercase">BEST</span>
                    )}
                </div>
            </div>
            <div className="p-3 sm:p-4 space-y-1.5">
                <h3 className="text-sm sm:text-lg font-medium text-stone-900 truncate">{product.name}</h3>
                <p className="text-xs text-pink-600 font-medium">Fabric: {product.fabric}</p>

                <div className="pt-2 flex flex-col items-start">
                    <div className="flex items-center space-x-2 mb-3">
                        {product.onSale ? (
                            <>
                                <span className="text-xs sm:text-sm text-stone-500 line-through">
                                    ৳{originalPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-base sm:text-xl font-bold text-stone-900">
                                    ৳{product.price.toLocaleString('en-IN')}
                                </span>
                            </>
                        ) : (
                             <span className="text-base sm:text-xl font-bold text-stone-900">
                                ৳{product.price.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/product/${product.id}`);
                        }}
                        className="w-full bg-pink-600 text-white rounded-full hover:bg-pink-700 transition duration-300 flex items-center justify-center space-x-2 active:scale-95 text-sm sm:text-base font-bold py-[0.4rem] sm:py-2"
                    >
                        <span>View Item</span>
                        <ArrowRight className="w-4 h-4" /> 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(ProductCard);