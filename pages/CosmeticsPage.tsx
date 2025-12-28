
import React, { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '../store';
import ProductCard from '../components/ProductCard';
import { 
  ShoppingBag, 
  Sparkles, 
  X, 
  Plus, 
  Minus,
  ChevronRight,
  ArrowRight,
  Gift,
  Info
} from 'lucide-react';

const PRODUCTS_PER_PAGE = 12;

const ProductCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-lg w-full h-full flex flex-col">
      <div className="aspect-[3/4] bg-stone-200 w-full animate-pulse relative" />
      <div className="p-3 sm:p-4 space-y-1.5 flex flex-col flex-1">
        <div className="h-5 sm:h-7 bg-stone-200 rounded w-full animate-pulse" />
        <div className="h-4 bg-stone-100 rounded w-2/3 animate-pulse" />
        <div className="pt-2 flex flex-col items-start w-full mt-auto">
          <div className="h-6 sm:h-8 bg-stone-200 rounded w-1/3 animate-pulse mb-3" />
          <div className="w-full bg-stone-200 rounded-full h-[33px] sm:h-10 animate-pulse" />
        </div>
      </div>
    </div>
);

const CosmeticsPage: React.FC = () => {
    const { products, cart, updateCartQuantity, navigate, path, loading, ensureAllProductsLoaded, fullProductsLoaded, settings } = useAppStore();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const categories = [
        { name: 'All', label: 'All Essentials', slug: '' },
        { name: 'Skincare', label: 'Skincare', slug: 'skincare' },
        { name: 'Makeup', label: 'Makeup', slug: 'makeup' },
        { name: 'Hair Care', label: 'Hair Care', slug: 'hair-care' },
        { name: 'Fragrance', label: 'Fragrance', slug: 'fragrance' }
    ];

    // SYNC: Derive active filter from URL
    const activeFilter = useMemo(() => {
        const parts = path.split('/');
        if (parts.length > 2) {
            const slug = parts[2];
            const found = categories.find(c => c.slug === slug);
            return found ? found.name : 'All';
        }
        return 'All';
    }, [path]);

    useEffect(() => {
        if (!fullProductsLoaded) {
            ensureAllProductsLoaded();
        }
    }, [fullProductsLoaded, ensureAllProductsLoaded]);

    const cosmeticsProducts = useMemo(() => {
        const base = products.filter(p => 
          p.category.toLowerCase() === 'cosmetics'
        );
        if (activeFilter === 'All') return base;
        
        return base.filter(p => {
            const productType = p.fabric || '';
            return productType === activeFilter;
        });
    }, [products, activeFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    useEffect(() => {
        if (currentPage > 1) {
            const element = document.getElementById('shop-grid');
            if (element) {
                const yOffset = -100; 
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        }
    }, [currentPage]);

    const totalPages = Math.ceil(cosmeticsProducts.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return cosmeticsProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [cosmeticsProducts, currentPage]);

    const handleFilterClick = (slug: string) => {
        if (slug === '') {
            navigate('/cosmetics', { scroll: false });
        } else {
            navigate(`/cosmetics/${slug}`, { scroll: false });
        }
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <div className="bg-[#FFF9F9] min-h-screen relative">
            {/* --- LUXURY HERO --- */}
            <section className="relative w-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/7] lg:aspect-[16/6] xl:aspect-[16/6] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <picture>
                        <source media="(max-width: 640px)" srcSet={settings.cosmeticsMobileHeroImage} />
                        <img 
                            src={settings.cosmeticsHeroImage} 
                            alt="Cosmetics Hero" 
                            className="w-full h-full object-cover brightness-95"
                        />
                    </picture>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-50/90 via-white/20 to-transparent"></div>
                </div>

                {settings.showCosmeticsHeroText && (
                    <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 md:px-16 w-full">
                        <div className="max-w-xl animate-fadeInUp space-y-2 sm:space-y-4">
                            <span className="text-pink-600 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1 block">The Cosmetics Edit</span>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight">
                                {settings.cosmeticsHeroTitle || 'Nurturing Your Natural Glow.'}
                            </h1>
                            <p className="text-stone-600 text-xs sm:text-lg max-w-sm leading-relaxed">
                                {settings.cosmeticsHeroSubtitle || 'Curated professional beauty essentials for a timeless radiance.'}
                            </p>
                            <div className="pt-2">
                                <button 
                                    onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-stone-900 text-white px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-stone-800 transition shadow-xl flex items-center gap-2 group"
                                >
                                    <span>Explore Products</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* --- CATEGORY SUB-NAV --- */}
            <nav className="sticky top-16 sm:top-20 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar scrollbar-hide">
                    <div className="flex items-center justify-between h-14 sm:h-16 gap-8 min-w-max">
                        <div className="flex gap-6 sm:gap-10">
                            {categories.map((cat) => (
                                <button 
                                    key={cat.name}
                                    onClick={() => handleFilterClick(cat.slug)}
                                    className={`text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative py-2 ${
                                        activeFilter === cat.name ? 'text-pink-600' : 'text-stone-400 hover:text-stone-700'
                                    }`}
                                >
                                    {cat.label}
                                    {activeFilter === cat.name && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-600 rounded-full animate-scaleIn"></span>}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="flex items-center gap-2 bg-pink-50 px-4 py-1.5 rounded-full text-pink-600 border border-pink-100 hover:bg-pink-100 transition shadow-sm"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Bag ({cartCount})</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- LOYALTY TRIGGER / PROMO BANNER --- */}
            {settings.showCosmeticsPromo && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-pink-100 group">
                        {/* Background Promo Image */}
                        <div className="absolute inset-0 z-0">
                            <picture>
                                <source media="(max-width: 640px)" srcSet={settings.cosmeticsMobilePromoImage || settings.cosmeticsPromoImage} />
                                <img 
                                    src={settings.cosmeticsPromoImage} 
                                    alt="Special Promotion" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                                />
                            </picture>
                            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent"></div>
                        </div>

                        {/* Promo Content */}
                        <div className="relative z-10 p-8 sm:p-12 lg:p-16 flex flex-col items-start justify-center min-h-[300px] sm:min-h-[400px]">
                            <div className="flex items-center gap-2 bg-pink-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 animate-pulse">
                                <Gift className="w-3.5 h-3.5" />
                                <span>Exclusive Reward</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 uppercase italic">
                                {settings.cosmeticsPromoTitle || 'Master Your Morning Glow'}
                            </h2>
                            <p className="text-stone-200 text-sm sm:text-lg max-w-md mb-8 leading-relaxed">
                                {settings.cosmeticsPromoDescription || `Unlock a special gift when you spend ৳${settings.cosmeticsPromoThreshold || 2500} or more.`}
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <button 
                                    onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-white text-stone-900 px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-pink-600 hover:text-white transition shadow-2xl active:scale-95"
                                >
                                    Shop Collection
                                </button>
                                <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-tighter">
                                    <Info className="w-4 h-4" />
                                    <span>Applicable on orders over ৳{settings.cosmeticsPromoThreshold}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* --- MAIN PRODUCT GRID --- */}
            <main id="shop-grid" className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-end mb-10 px-2">
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900">
                           {activeFilter === 'All' ? 'Cosmetics Essentials' : activeFilter}
                        </h2>
                        <div className="w-12 h-1 bg-pink-500 mt-2 rounded-full"></div>
                    </div>
                    <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">
                        {cosmeticsProducts.length} Results
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
                    {loading && cosmeticsProducts.length === 0 ? (
                        [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        paginatedProducts.map((product, index) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                priority={index < 4}
                            />
                        ))
                    )}
                </div>

                {/* Pagination UI */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-12 mb-8 sm:mt-16 sm:mb-12">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="border border-pink-600 text-pink-600 font-medium px-6 py-2 rounded-full hover:bg-pink-600 hover:text-white transition duration-300 active:scale-95 text-sm disabled:bg-transparent disabled:text-pink-300 disabled:border-pink-300 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-stone-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="border border-pink-600 text-pink-600 font-medium px-6 py-2 rounded-full hover:bg-pink-600 hover:text-white transition duration-300 active:scale-95 text-sm disabled:bg-transparent disabled:text-pink-300 disabled:border-pink-300 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            {/* --- SIDE CART PREVIEW --- */}
            <aside 
                className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[100] transform transition-transform duration-500 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-6 border-b border-pink-50 flex items-center justify-between bg-stone-50/50">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-stone-800" />
                        <h2 className="text-lg font-extrabold text-stone-900 uppercase tracking-tighter">Your Bag ({cartCount})</h2>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition"><X className="w-5 h-5 text-black" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-black">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Sparkles className="w-8 h-8 text-stone-200 mb-4" />
                            <p className="font-bold text-stone-800 uppercase text-sm">Bag is empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4">
                                <div className="w-16 h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-stone-800 text-sm line-clamp-1">{item.name}</h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateCartQuantity(item.id, item.size, item.quantity - 1)} className="p-1 hover:text-pink-600"><Minus className="w-3 h-3" /></button>
                                            <span className="text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => updateCartQuantity(item.id, item.size, item.quantity + 1)} className="p-1 hover:text-pink-600"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <span className="font-bold text-pink-600 text-sm">৳{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-pink-50 bg-stone-50/50">
                        <div className="flex justify-between mb-6">
                            <span className="text-stone-500 font-bold text-sm uppercase">Total</span>
                            <span className="text-xl font-extrabold text-stone-900">৳{cartTotal.toLocaleString()}</span>
                        </div>
                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-pink-600 text-white font-extrabold py-4 rounded-xl shadow-lg hover:bg-pink-700 transition flex items-center justify-center gap-2"
                        >
                            <span>Checkout Now</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </aside>
            {isCartOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" onClick={() => setIsCartOpen(false)}></div>}
        </div>
    );
};

export default CosmeticsPage;
