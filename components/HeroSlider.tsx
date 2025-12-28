
// components/HeroSlider.tsx

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAppStore } from '../store';

const HeroSlider: React.FC = () => {
    const navigate = useAppStore(state => state.navigate);
    // Combined selector to access multiple values from settings
    const { sliderImages, showSliderText } = useAppStore(state => ({
        sliderImages: state.settings.sliderImages,
        showSliderText: state.settings.showSliderText ?? true
    }));
    const loading = useAppStore(state => state.loading);
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});
    // Track if we have done the first render interaction
    const [hasInteracted, setHasInteracted] = useState(false);
    
    const slides = Array.isArray(sliderImages) ? sliderImages : [];
    const totalSlides = slides.length;

    const nextSlide = useCallback(() => {
        if (totalSlides > 0) {
            setHasInteracted(true);
            setCurrentSlide(prev => (prev + 1) % totalSlides);
        }
    }, [totalSlides]);

    useEffect(() => {
        const slideTimer = setInterval(nextSlide, 5000); 
        return () => clearInterval(slideTimer);
    }, [nextSlide]);

    const goToSlide = (index: number) => {
        setHasInteracted(true);
        setCurrentSlide(index);
    };
    
    const handleImageLoad = (index: number) => {
        setLoadedSlides(prev => ({...prev, [index]: true}));
    }

    if (totalSlides === 0 && loading) {
        return (
            <section className="relative w-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/7] lg:aspect-[16/6] xl:aspect-[16/6] bg-stone-200 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-10 md:p-16">
                    <div className="max-w-md space-y-4 w-full">
                        <div className="h-10 sm:h-14 bg-stone-300 rounded w-3/4"></div>
                        <div className="h-4 sm:h-6 bg-stone-300 rounded w-1/2"></div>
                        <div className="h-10 sm:h-12 bg-stone-300 rounded-full w-32 mt-6"></div>
                    </div>
                </div>
            </section>
        );
    }
    
    if (totalSlides === 0) return null;

    const activeSlide = slides[currentSlide];
    const isCurrentSlideImageLoaded = loadedSlides[currentSlide] || false;

    // Optimization: If it's the very first render of the first slide, show text INSTANTLY (no animation).
    const shouldAnimateText = hasInteracted || currentSlide !== 0;

    // Helper to optimize Picsum URLs for faster mobile loading
    const getOptimizedUrl = (url: string, isMobile: boolean) => {
        if (url.includes('picsum.photos')) {
            // Replace standard sizes with optimized mobile sizes
            if (isMobile) return url.replace('1200/500', '400/600');
        }
        return url;
    }

    return (
        <section className="relative w-full h-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/7] lg:aspect-[16/6] xl:aspect-[16/6] bg-stone-200">
            <div className="w-full h-full relative overflow-hidden">
                {slides.map((slide, index) => {
                    const isFirstSlide = index === 0;
                    const isLoaded = loadedSlides[index];
                    
                    const imageOpacity = isFirstSlide ? 1 : (isLoaded ? 1 : 0);
                    const transitionStyle = isFirstSlide ? 'none' : 'opacity 0.5s';

                    return (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'}`}
                        >
                            {/* Improved Picture Tag for LCP */}
                            <picture className="w-full h-full block">
                                {/* Mobile Source First - Optimization: Using smaller 400x600 for mobile LCP */}
                                {slide.mobileImage && (
                                    <source 
                                        media="(max-width: 640px)" 
                                        srcSet={getOptimizedUrl(slide.mobileImage, true)} 
                                        sizes="100vw"
                                    />
                                )}
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="object-cover w-full h-full block"
                                    onLoad={() => handleImageLoad(index)}
                                    // CRITICAL: First slide gets high priority, eager load, and sync decoding
                                    loading={isFirstSlide ? "eager" : "lazy"}
                                    // @ts-ignore
                                    fetchPriority={isFirstSlide ? "high" : "auto"}
                                    decoding={isFirstSlide ? "sync" : "async"}
                                    style={{ opacity: imageOpacity, transition: transitionStyle }}
                                />
                            </picture>
                            {showSliderText && (
                                <div className={`absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent transition-opacity duration-300 ${isFirstSlide || isLoaded ? 'opacity-100' : 'opacity-0'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {showSliderText && (
                <div className={`absolute inset-0 flex items-center justify-start p-6 sm:p-10 md:p-16 z-20 transition-opacity duration-700 ${currentSlide === 0 || isCurrentSlideImageLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div 
                        key={currentSlide} 
                        className={`max-w-md space-y-3 sm:space-y-4 text-white ${shouldAnimateText ? 'animate-fadeInUp' : ''}`}
                    >
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
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, index) => (
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
