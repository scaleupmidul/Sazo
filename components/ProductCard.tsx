import React, { useState, memo } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useAppStore } from '../store';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
    const regularPrice = product.regularPrice || product.price + 200;
    const navigate = useAppStore(state => state.navigate);
    const isOutOfStock = product.isOutOfStock ?? false;

    const linkId = product.productId || product.id;
    const infoLabel = product.category.toLowerCase() === 'cosmetics' ? 'Type' : 'Fabric';

    return (
        <div 
            className={`bg-white rounded-lg border border-stone-200 overflow-hidden transition duration-500 ease-in-out shadow-lg sm:hover:shadow-2xl sm:hover:-translate-y-2 group cursor-pointer h-full flex flex-col ${isOutOfStock ? 'opacity-80 grayscale-[0.3]' : ''}`}
            onClick={() => navigate(`/product/${linkId}`)}
        >
            <div
                className="relative w-full bg-stone-200 flex-shrink-0"
                style={{ aspectRatio: '3/4' }}
            >
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isOutOfStock ? 'opacity-50' : ''}`}
                    loading={priority ? "eager" : "lazy"}
                    // @ts-ignore
                    fetchPriority={priority ? "high" : "auto"}
                    decoding="async"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Out of Stock Overlay - REMOVED the central 'Sold Out' text per user request */}

                <div className="absolute top-3 left-3 flex flex-col items-start space-y-1.5 z-10">
                    {product.isNewArrival && !isOutOfStock && (
                        <span className="bg-pink-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow tracking-wider uppercase">NEW</span>
                    )}
                    {product.isTrending && !isOutOfStock && (
                        <span className="bg-amber-400 text-stone-900 text-[9px] font-bold px-2.5 py-1 rounded-full shadow tracking-wider uppercase">BEST</span>
                    )}
                    {isOutOfStock && (
                        <span className="bg-stone-800 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow tracking-wider uppercase">OUT OF STOCK</span>
                    )}
                </div>
            </div>
            <div className="p-3 sm:p-4 space-y-1.5 flex flex-col flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-stone-900 truncate" title={product.name}>{product.name}</h3>
                <p className={`text-xs font-medium ${isOutOfStock ? 'text-stone-400' : 'text-pink-600'}`}>{infoLabel}: {product.fabric}</p>

                <div className="pt-2 flex flex-col items-start mt-auto">
                    <div className="flex items-center space-x-2 mb-3">
                        {product.onSale ? (
                            <>
                                <span className={`text-base sm:text-xl font-bold ${isOutOfStock ? 'text-stone-500' : 'text-stone-900'}`}>
                                    ৳{product.price.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs sm:text-sm text-stone-400 line-through">
                                    ৳{regularPrice.toLocaleString('en-IN')}
                                </span>
                            </>
                        ) : (
                             <span className={`text-base sm:text-xl font-bold ${isOutOfStock ? 'text-stone-500' : 'text-stone-900'}`}>
                                ৳{product.price.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/product/${linkId}`);
                        }}
                        disabled={isOutOfStock}
                        className={`w-full rounded-full transition duration-300 flex items-center justify-center space-x-2 active:scale-95 text-sm sm:text-base font-bold py-[0.4rem] sm:py-2 
                            ${isOutOfStock 
                                ? 'bg-stone-200 text-stone-500 cursor-not-allowed' 
                                : 'bg-pink-600 text-white hover:bg-pink-700'}`}
                    >
                        <span>{isOutOfStock ? 'Out of Stock' : 'View Item'}</span>
                        {!isOutOfStock && <ArrowRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default memo(ProductCard);
