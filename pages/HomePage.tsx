
import React from 'react';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import { useAppStore } from '../store';
import { Product } from '../types';
import { ShieldCheck, Truck, Sparkles, ArrowRight, CreditCard } from 'lucide-react';

const SectionTitle: React.FC<{ title: string; subtitle?: string; align?: 'center' | 'left' }> = ({ title, subtitle, align = 'center' }) => (
  <div className={`flex flex-col ${align === 'center' ? 'items-center text-center' : 'items-start text-left'} mb-10 sm:mb-16`}>
    <p className="text-pink-600 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs mb-3">{subtitle}</p>
    <h2 className="text-3xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-none">
        {title}
    </h2>
    {/* Underline removed as per user request */}
  </div>
);

const TrustFactor: React.FC<{ icon: React.ElementType; title: string; desc: string; className?: string }> = ({ icon: Icon, title, desc, className = "" }) => (
    <div className={`flex flex-col items-center text-center p-3 sm:p-6 group ${className}`}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow-lg sm:shadow-xl flex items-center justify-center text-pink-600 mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-500 border border-stone-50">
            <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={1.5} />
        </div>
        <h4 className="font-bold text-stone-900 text-[10px] sm:text-sm uppercase tracking-widest mb-1 leading-tight">{title}</h4>
        <p className="text-stone-500 text-xs leading-relaxed hidden sm:block">{desc}</p>
    </div>
);

const BannerSkeleton = () => (
    <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-[1.7rem] sm:rounded-[2rem] mx-6 sm:mx-0 overflow-hidden bg-stone-100 animate-shimmer shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" style={{ backgroundSize: '200% 100%' }}></div>
    </div>
);

const HomePage: React.FC = () => {
  const { products, navigate, settings, loading } = useAppStore(state => ({
    products: state.products,
    navigate: state.navigate,
    settings: state.settings,
    loading: state.loading
  }));
  const { homepageNewArrivalsCount, homepageTrendingCount } = settings;

  const getSortedProducts = (items: Product[], key: 'newArrivalDisplayOrder' | 'trendingDisplayOrder') => {
      const pinned = items.filter(p => p[key] && p[key]! < 1000).sort((a, b) => (a[key] || 0) - (b[key] || 0));
      const others = items.filter(p => !p[key] || p[key]! >= 1000).sort((a, b) => b.id.localeCompare(a.id));
      return [...pinned, ...others];
  };

  const allNewArrivals = getSortedProducts(products.filter(p => p.isNewArrival), 'newArrivalDisplayOrder');
  const allTrendingProducts = getSortedProducts(products.filter(p => p.isTrending), 'trendingDisplayOrder');
  
  const newArrivalsDisplay = allNewArrivals.slice(0, homepageNewArrivalsCount || 4);
  const trendingProductsDisplay = allTrendingProducts.slice(0, homepageTrendingCount || 4);

  const isFashionBannerReady = settings.signatureFashionDesktopImage && settings.signatureFashionDesktopImage !== '';
  const isCosmeticsBannerReady = settings.signatureCosmeticsDesktopImage && settings.signatureCosmeticsDesktopImage !== '';

  return (
    <div className="overflow-x-hidden bg-[#FEF9F9]">
      <HeroSlider />

      {/* --- SECTION 1: TRUST BAR (4 Items) --- */}
      <section className="bg-white border-b border-stone-100 py-6 sm:py-10">
          <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-stone-100">
                  <TrustFactor 
                    icon={ShieldCheck} 
                    title="Authentic Quality" 
                    desc="Curated premium fabrics & original beauty essentials." 
                    className="border-r border-b lg:border-b-0 border-stone-50"
                  />
                  <TrustFactor 
                    icon={Truck} 
                    title="Express Delivery" 
                    desc="Swift delivery across Bangladesh, right to your doorstep." 
                    className="border-b lg:border-b-0 lg:border-r border-stone-50"
                  />
                  <TrustFactor 
                    icon={CreditCard} 
                    title="Secure Payment" 
                    desc="Safe and encrypted payment options for your peace of mind." 
                    className="border-r border-stone-50"
                  />
                  <TrustFactor 
                    icon={Sparkles} 
                    title="Exclusive Styles" 
                    desc="Limited edition designs for the modern elegance." 
                  />
              </div>
          </div>
      </section>

      <main className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        
        {/* --- SECTION 2: DUAL CATEGORY SPOTLIGHT --- */}
        <section className="mb-24 sm:mb-36">
            <SectionTitle title="Category" subtitle="Shop By Department" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                {/* Fashion Spotlight */}
                {!isFashionBannerReady ? <BannerSkeleton /> : (
                    <div 
                        className="relative aspect-[4/5] sm:aspect-[16/10] rounded-[1.7rem] sm:rounded-[2rem] mx-6 sm:mx-0 overflow-hidden group cursor-pointer shadow-2xl"
                        onClick={() => navigate('/women')}
                    >
                        <picture>
                            <source media="(max-width: 640px)" srcSet={settings.signatureFashionMobileImage} />
                            <img 
                                src={settings.signatureFashionDesktopImage} 
                                alt="Fashion Studio" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
                            <span className="text-pink-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-2">Exquisite Clothing</span>
                            <h3 className="text-white text-3xl sm:text-5xl font-black mb-6">The Fashion<br/>Studio</h3>
                            <div className="flex items-center gap-3 text-white font-bold group/btn">
                                <span className="border-b-2 border-white pb-1">Discover Collection</span>
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Beauty Spotlight */}
                {!isCosmeticsBannerReady ? <BannerSkeleton /> : (
                    <div 
                        className="relative aspect-[4/5] sm:aspect-[16/10] rounded-[1.7rem] sm:rounded-[2rem] mx-6 sm:mx-0 overflow-hidden group cursor-pointer shadow-2xl"
                        onClick={() => navigate('/cosmetics')}
                    >
                        <picture>
                            <source media="(max-width: 640px)" srcSet={settings.signatureCosmeticsMobileImage} />
                            <img 
                                src={settings.signatureCosmeticsDesktopImage} 
                                alt="Beauty Rituals" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 sm:p-12">
                            <span className="text-pink-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-2">Radiant Beauty</span>
                            <h3 className="text-white text-3xl sm:text-5xl font-black mb-6">The Beauty<br/>Rituals</h3>
                            <div className="flex items-center gap-3 text-white font-bold group/btn">
                                <span className="border-b-2 border-white pb-1">Shop Essentials</span>
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* --- SECTION 3: TRENDING --- */}
        <section className="mb-24 sm:mb-40">
          <SectionTitle title="Trending Now" subtitle="Most Loved Pieces" align="center" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
            {trendingProductsDisplay.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* --- SECTION 4: NEW ARRIVALS --- */}
        <section className="pb-32">
          <SectionTitle title="New Arrivals" subtitle="The Season's Best" align="center" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
            {newArrivalsDisplay.map((p, index) => (
                 <ProductCard key={p.id} product={p} priority={index < 2} />
            ))}
          </div>
          {!loading && allNewArrivals.length > 4 && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => navigate('/shop')}
                className="group px-12 py-4 bg-stone-900 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-pink-600 transition-all duration-500 shadow-2xl hover:shadow-pink-200"
              >
                Explore Full Gallery
              </button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default HomePage;
