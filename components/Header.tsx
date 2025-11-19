import React, { useState, useEffect, memo } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useAppStore } from '../store';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useAppStore(state => state.navigate);
  const cartItemCount = useAppStore(state => state.cart.reduce((total, item) => total + item.quantity, 0));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
        <h1 onClick={() => handleNavClick('/')} className="sazo-logo text-2xl sm:text-3xl lg:text-4xl font-semibold text-stone-800 cursor-pointer transition hover:text-pink-600 tracking-wider lg:tracking-[2px]">
          SAZO
        </h1>
        <nav className="hidden md:flex space-x-10">
          <button onClick={() => handleNavClick('/')} className="text-stone-700 hover:text-pink-600 transition font-medium text-base">Home</button>
          <button onClick={() => handleNavClick('/shop')} className="text-stone-700 hover:text-pink-600 transition font-medium text-base">Shop All</button>
          <button onClick={() => handleNavClick('/contact')} className="text-stone-700 hover:text-pink-600 transition font-medium text-base">Contact</button>
        </nav>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button onClick={() => handleNavClick('/cart')} className="relative p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* New Mobile Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 w-full bg-white shadow-lg md:hidden transition-all duration-300 ease-in-out transform origin-top ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-95 opacity-0 pointer-events-none'}`}
      >
        <nav className="flex flex-col p-4 space-y-2 border-t border-pink-100">
          <button onClick={() => handleNavClick('/')} className="text-left text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition font-medium p-3 rounded-lg text-base">Home</button>
          <button onClick={() => handleNavClick('/shop')} className="text-left text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition font-medium p-3 rounded-lg text-base">Shop All</button>
          <button onClick={() => handleNavClick('/contact')} className="text-left text-stone-700 hover:bg-pink-50 hover:text-pink-600 transition font-medium p-3 rounded-lg text-base">Contact</button>
        </nav>
      </div>
    </header>
  );
};

export default memo(Header);