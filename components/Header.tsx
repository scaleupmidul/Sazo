import React, { useState, useEffect, memo } from 'react';
import { ShoppingCart, Menu, X, ChevronRight, ShoppingBag, Home, Grid, Phone, FileText, Sparkles, User } from 'lucide-react';
import { useAppStore } from '../store';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { navigate, path, cart } = useAppStore(state => ({
    navigate: state.navigate,
    path: state.path,
    cart: state.cart
  }));
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMenuOpen]);

  const handleNavClick = (navPath: string) => {
    setIsMenuOpen(false);
    navigate(navPath);
  };
  
  const menuItems = [
      { label: 'Home', path: '/', icon: Home },
      { label: 'Women', path: '/women', icon: User },
      { label: 'Cosmetics', path: '/cosmetics', icon: Sparkles },
      { label: 'Shop All', path: '/shop', icon: Grid },
      { label: 'Contact Us', path: '/contact', icon: Phone },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}>
        <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 sm:h-20">
          <h1 
            onClick={() => handleNavClick('/')} 
            className="sazo-logo text-[1.8rem] sm:text-4xl lg:text-[2.8rem] font-extrabold cursor-pointer tracking-wider lg:tracking-[2px] sazo-logo-gradient hover:scale-105 transition-transform duration-300"
          >
            SAZO
          </h1>
          
          <nav className="hidden md:flex space-x-8 lg:space-x-10">
            <button onClick={() => handleNavClick('/')} className={`transition font-medium text-base ${path === '/' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Home</button>
            <button onClick={() => handleNavClick('/women')} className={`transition font-medium text-base ${path === '/women' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Women</button>
            <button onClick={() => handleNavClick('/cosmetics')} className={`transition font-medium text-base ${path === '/cosmetics' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>
                Cosmetics
            </button>
            <button onClick={() => handleNavClick('/shop')} className={`transition font-medium text-base ${path === '/shop' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Shop All</button>
            <button onClick={() => handleNavClick('/contact')} className={`transition font-medium text-base ${path === '/contact' ? 'text-pink-600' : 'text-stone-700 hover:text-pink-600'}`}>Contact</button>
          </nav>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button onClick={() => handleNavClick('/cart')} className="relative p-2 rounded-full text-stone-700 hover:bg-pink-100 transition duration-300 active:scale-95">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            <button 
                onClick={() => setIsMenuOpen(true)} 
                className="md:hidden flex flex-col justify-center items-end gap-[6px] w-[1.8rem] group cursor-pointer p-0.5"
                aria-label="Menu"
            >
                <span className="w-full h-[2.5px] bg-stone-900 rounded-full transition-all duration-300 group-hover:bg-pink-600"></span>
                <span className="w-[70%] h-[2.5px] bg-stone-900 rounded-full transition-all duration-300 group-hover:w-full group-hover:bg-pink-600"></span>
                <span className="w-full h-[2.5px] bg-stone-900 rounded-full transition-all duration-300 group-hover:bg-pink-600"></span>
            </button>
          </div>
        </div>
      </header>

      <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)}
      />

      <div 
          className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
          <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="sazo-logo text-[1.8rem] font-extrabold tracking-wider sazo-logo-gradient" onClick={() => handleNavClick('/')}>SAZO</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-stone-500 hover:text-pink-600 transition rounded-full hover:bg-stone-50">
                  <X className="w-6 h-6" />
              </button>
          </div>

          <nav className="flex-1 flex flex-col px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                  const isActive = path === item.path;
                  const Icon = item.icon;
                  return (
                      <button 
                          key={item.path}
                          onClick={() => handleNavClick(item.path)} 
                          className={`group flex items-center justify-between w-full p-4 rounded-xl transition-all duration-200 ${
                              isActive 
                                ? 'bg-pink-50 text-pink-700' 
                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          }`}
                      >
                          <div className="flex items-center space-x-4">
                              <Icon className={`w-5 h-5 ${isActive ? 'text-pink-600' : 'text-stone-400 group-hover:text-stone-600'}`} />
                              <span className={`font-semibold text-base tracking-wide ${isActive ? 'text-pink-700' : ''}`}>
                                {item.label}
                              </span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                              isActive 
                                ? 'text-pink-400 translate-x-0' 
                                : 'text-stone-300 group-hover:text-stone-400 group-hover:translate-x-1'
                          }`} />
                      </button>
                  )
              })}
          </nav>

          <div className="p-6 border-t border-stone-100 bg-stone-50/30">
               <button 
                  onClick={() => handleNavClick('/shop')}
                  className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-stone-800 transition active:scale-95 shadow-lg flex items-center justify-center space-x-3 text-sm uppercase tracking-widest"
               >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Start Shopping</span>
               </button>
          </div>
      </div>
    </>
  );
};

export default memo(Header);
