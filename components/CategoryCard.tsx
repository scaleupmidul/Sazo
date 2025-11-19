
import React, { useState, memo } from 'react';

interface CategoryCardProps {
    categoryName: string;
    imageUrl: string;
    onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ categoryName, imageUrl, onClick }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative overflow-hidden rounded-lg group cursor-pointer aspect-[3.5/4] bg-stone-200" onClick={onClick}>
            {!isLoaded && (
                <div className="absolute inset-0 bg-stone-200 animate-pulse"></div>
            )}
            <img
                src={imageUrl}
                alt={categoryName}
                className={`object-cover w-full h-full transition-opacity duration-500 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
                decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:bg-black/50 transition duration-300 flex items-center justify-center p-8">
                <h3 className="text-2xl font-semibold text-white tracking-wider text-center">
                    {categoryName}
                </h3>
            </div>
        </div>
    );
};

export default memo(CategoryCard);
