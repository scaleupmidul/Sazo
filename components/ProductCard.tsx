
import React, { useState, memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useAppStore } from '../store';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
    // We removed isImageLoaded state to allow progressive rendering without hiding the image
    const regularPrice = product.regularPrice || product.price + 200; // Fallback only if not set in DB yet
    const navigate = useAppStore(state => state.navigate);

    // Use productId (numeric) for the URL if available, fallback to id
    const linkId = product.productId || product.id;

    // Dynamic label based on category to support both Fashion and Cosmetics
    const infoLabel = product.category.toLowerCase() === 'cosmetics' ? 'Type' : 'Fabric';

    return (
        <div 
            className="bg-white rounded-lg border border-stone-200 overflow-hidden transition duration-500 ease-in-out shadow-lg sm:hover:shadow-2xl sm:hover:-translate-y-2 group cursor-pointer h-full flex flex-col"
            onClick={() => navigate(`/product/${linkId}`)}
        >
            <div
                className="relative w-full bg-stone-200 flex-shrink-0"
                style={{ aspectRatio: '3/4' }}
            >
                {/* 
                   OPTIMIZATION: Removed the conditional skeleton overlay and opacity transition.
                   This allows the browser to render the image progressively as it downloads,
                   giving immediate visual feedback ("Age img load") instead of waiting for full load.
                */}
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    // Optimized loading: Only use eager for top items (priority=true), else lazy
                    loading={priority ? "eager" : "lazy"}
                    // @ts-ignore
                    fetchPriority={priority ? "high" : "auto"}
                    decoding="async"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute top-3 left-3 flex flex-col items-start space-y-1.5 z-10">
                    {product.isNewArrival && (
                        <span className="bg-pink-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow tracking-wider uppercase">NEW</span>
                    )}
                    {product.isTrending && (
                        <span className="bg-amber-400 text-stone-900 text-[9px] font-bold px-2.5 py-1 rounded-full shadow tracking-wider uppercase">BEST</span>
                    )}
                </div>
            </div>
            <div className="p-3 sm:p-4 space-y-1.5 flex flex-col flex-1">
                <h3 className="text-sm sm:text-lg font-medium text-stone-900 truncate" title={product.name}>{product.name}</h3>
                <p className="text-xs text-pink-600 font-medium">{infoLabel}: {product.fabric}</p>

                <div className="pt-2 flex flex-col items-start mt-auto">
                    <div className="flex items-center space-x-2 mb-3">
                        {product.onSale ? (
                            <>
                                <span className="text-base sm:text-xl font-bold text-stone-900">
                                    ৳{product.price.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs sm:text-sm text-stone-500 line-through">
                                    ৳{regularPrice.toLocaleString('en-IN')}
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
                            navigate(`/product/${linkId}`);
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
