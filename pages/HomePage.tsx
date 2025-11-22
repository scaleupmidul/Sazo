import React from 'react';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import CategoryCard from '../components/CategoryCard';
import { useAppStore } from '../store';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-3xl sm:text-4xl text-center text-stone-900 mb-8 sm:mb-12">
    {title}
  </h2>
);

// Robust, clean box-structure skeleton without card container
const ProductCardSkeleton: React.FC = () => (
  <div className="flex flex-col w-full h-full">
    {/* Image Box */}
    <div className="aspect-[3.5/4] bg-stone-200 rounded-lg w-full animate-pulse mb-4" />
    {/* Content Boxes */}
    <div className="flex flex-col space-y-2">
      {/* Title */}
      <div className="h-6 bg-stone-200 rounded w-3/4 animate-pulse" />
      {/* Price */}
      <div className="h-6 bg-stone-200 rounded w-1/4 animate-pulse" />
      {/* Button */}
      <div className="h-10 bg-stone-200 rounded-full w-full animate-pulse mt-2" />
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const { products, navigate, settings, loading } = useAppStore(state => ({
    products: state.products,
    navigate: state.navigate,
    settings: state.settings,
    loading: state.loading
  }));
  const { categoryImages, categories, homepageNewArrivalsCount, homepageTrendingCount } = settings;

  const getCategoryImage = (categoryName: string) => {
    const category = categoryImages.find(c => c.categoryName === categoryName);
    return category ? category.image : 'https://picsum.photos/seed/sazo-default-category/600/800';
  };

  // Explicitly sort products by their specific displayOrder on the frontend
  // Using || 1000 ensures that 0, null, or undefined are all treated as 1000 (default/last)
  // This fixes the issue where an accidental '0' would come before '1' or '2'
  const allNewArrivals = products
    .filter(p => p.isNewArrival)
    .sort((a, b) => {
        const orderA = a.newArrivalDisplayOrder || 1000;
        const orderB = b.newArrivalDisplayOrder || 1000;
        
        if (orderA !== orderB) return orderA - orderB;
        // Secondary sort by ID descending ensures newest products come first when displayOrder is equal
        return b.id.localeCompare(a.id);
    });
    
  const allTrendingProducts = products
    .filter(p => p.isTrending)
    .sort((a, b) => {
        const orderA = a.trendingDisplayOrder || 1000;
        const orderB = b.trendingDisplayOrder || 1000;
        
        if (orderA !== orderB) return orderA - orderB;
        return b.id.localeCompare(a.id);
    });
  
  const newArrivalsDisplay = allNewArrivals.slice(0, homepageNewArrivalsCount || 4);
  const trendingProductsDisplay = allTrendingProducts.slice(0, homepageTrendingCount || 4);

  return (
    <>
      <HeroSlider />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <section className="mb-16 sm:mb-24">
          <SectionTitle title="New Arrivals" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
               // Show 4 full-size skeletons during loading
               [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
               newArrivalsDisplay.map(p => <ProductCard key={p.id} product={p} />)
            )}
          </div>
          {!loading && allNewArrivals.length > (homepageNewArrivalsCount || 4) && (
            <div className="text-center mt-8 sm:mt-12">
              <button
                onClick={() => navigate('/shop')}
                className="border border-pink-600 text-pink-600 font-medium px-8 py-3 rounded-full hover:bg-pink-600 hover:text-white transition duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                View All New Arrivals
              </button>
            </div>
          )}
        </section>

        <section className="mb-16 sm:mb-24">
          <SectionTitle title="Trending Products" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
               // Show 4 full-size skeletons during loading
               [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
               trendingProductsDisplay.map(p => <ProductCard key={p.id} product={p} />)
            )}
          </div>
          {!loading && allTrendingProducts.length > (homepageTrendingCount || 4) && (
            <div className="text-center mt-8 sm:mt-12">
              <button
                onClick={() => navigate('/shop')}
                 className="border border-pink-600 text-pink-600 font-medium px-8 py-3 rounded-full hover:bg-pink-600 hover:text-white transition duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                View All Trending Products
              </button>
            </div>
          )}
        </section>

        <section className="mb-16 sm:mb-24">
          <SectionTitle title="Explore By Category" />
          <div className="flex flex-wrap justify-center -mx-2 sm:-mx-3">
            {categories.map(cat => (
              <div key={cat} className="w-1/2 md:w-1/3 lg:w-1/4 p-2 sm:p-3">
                <CategoryCard 
                  categoryName={cat}
                  imageUrl={getCategoryImage(cat)}
                  onClick={() => navigate('/shop')}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;
