import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAppStore } from '../store';

const HeroSlider: React.FC = () => {
    const navigate = useAppStore(state => state.navigate);
    const sliderImages = useAppStore(state => state.settings.sliderImages);
    const loading = useAppStore(state => state.loading);
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});
    const totalSlides = sliderImages.length;

    const nextSlide = useCallback(() => {
        if (totalSlides > 0) {
            setCurrentSlide(prev => (prev + 1) % totalSlides);
        }
    }, [totalSlides]);

    useEffect(() => {
        const slideTimer = setInterval(nextSlide, 5000); 
        return () => clearInterval(slideTimer);
    }, [nextSlide]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };
    
    const handleImageLoad = (index: number) => {
        setLoadedSlides(prev => ({...prev, [index]: true}));
    }

    // Show Big Skeleton while loading settings OR if no slides are found
    // This removes the ugly text and keeps the layout consistent
    if (loading || totalSlides === 0) {
        return (
            <section className="relative w-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/7] lg:aspect-[16/6] xl:aspect-[16/6] bg-stone-200 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-10 md:p-16">
                    <div className="max-w-md space-y-4 w-full">
                        {/* Title Skeleton */}
                        <div className="h-10 sm:h-14 bg-stone-300 rounded w-3/4"></div>
                        {/* Subtitle Skeleton */}
                        <div className="h-4 sm:h-6 bg-stone-300 rounded w-1/2"></div>
                        {/* Button Skeleton */}
                        <div className="h-10 sm:h-12 bg-stone-300 rounded-full w-32 mt-6"></div>
                    </div>
                </div>
            </section>
        );
    }

    const activeSlide = sliderImages[currentSlide];
    const isCurrentSlideImageLoaded = loadedSlides[currentSlide] || false;

    return (
        <section className="relative w-full h-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/7] lg:aspect-[16/6] xl:aspect-[16/6] bg-stone-200">
            <div className="w-full h-full relative overflow-hidden">
                {sliderImages.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}
                    >
                        <picture className="w-full h-full">
                            {slide.mobileImage && <source media="(max-width: 640px)" srcSet={slide.mobileImage} />}
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="object-cover w-full h-full transition-opacity duration-500"
                                onLoad={() => handleImageLoad(index)}
                                decoding="async"
                                style={{ opacity: loadedSlides[index] ? 1 : 0 }}
                            />
                        </picture>
                        <div className={`absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent transition-opacity duration-300 ${loadedSlides[index] ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                ))}
            </div>
            
            <div className={`absolute inset-0 flex items-center justify-start p-6 sm:p-10 md:p-16 z-20 transition-opacity duration-700 ${isCurrentSlideImageLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div key={currentSlide} className="max-w-md space-y-3 sm:space-y-4 text-white animate-fadeInUp">
                    <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-shadow ${activeSlide.color}`}>
                        {activeSlide.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-100 font-medium text-shadow">
                        {activeSlide.subtitle}
                    </p>
                    <div>
                      <button
                          onClick={() => navigate('/shop')}
                          className="mt-4 bg-pink-600 text-white text-sm sm:text-base font-bold px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-pink-700 transition duration-300 shadow-lg transform hover:scale-105 active:scale-95"
                      >
                          Shop Now
                      </button>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {sliderImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-pink-600 w-6' : 'bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default memo(HeroSlider);