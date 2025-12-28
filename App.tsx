
// App.tsx

import React, { useEffect, Suspense } from 'react';
import { useAppStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import WhatsAppButton from './components/WhatsAppButton';
import PageLoader from './components/PageLoader';

// CORE PAGES: Static imports for instant performance
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import CosmeticsPage from './pages/CosmeticsPage';
import WomenPage from './pages/WomenPage';

// ADMIN PAGES: Static imports
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminPaymentInfoPage from './pages/admin/AdminPaymentInfoPage';

// SELECTIVE LAZY LOADING: Only for non-core informational pages
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PolicyPage = React.lazy(() => import('./pages/PolicyPage'));

// Initialize the dataLayer for analytics
declare global {
  interface Window { dataLayer: any[]; }
}
window.dataLayer = window.dataLayer || [];

const App: React.FC = () => {
  const path = useAppStore(state => state.path);
  const navigate = useAppStore(state => state.navigate);
  const products = useAppStore(state => state.products);
  const selectedProduct = useAppStore(state => state.selectedProduct);
  const setSelectedProduct = useAppStore(state => state.setSelectedProduct);
  const notification = useAppStore(state => state.notification);
  const isAdminAuthenticated = useAppStore(state => state.isAdminAuthenticated);
  const showWhatsAppButton = useAppStore(state => state.settings.showWhatsAppButton);

  useEffect(() => {
    const productMatch = path.match(/^\/product\/(.+)$/);
    if (productMatch) {
        const urlId = productMatch[1].split('?')[0];
        
        const productFromList = products.find(p => p.productId === urlId || p.id === urlId);

        if (selectedProduct && (selectedProduct.productId === urlId || selectedProduct.id === urlId)) {
             if (productFromList && (productFromList.images || []).length < (selectedProduct.images || []).length) {
                 return; 
             }
        }

        if (productFromList && selectedProduct !== productFromList) {
            setSelectedProduct(productFromList);
        }
    } else {
        if (selectedProduct !== null) {
            setSelectedProduct(null);
        }
    }
  }, [path, products, selectedProduct, setSelectedProduct]);
  
  useEffect(() => {
    const BASE_TITLE = 'SAZO';
    let pageTitle = BASE_TITLE;

    const productMatch = path.match(/^\/product\/(.+)$/);
    const thankYouMatch = path.match(/^\/thank-you\/(.+)$/);
    const cosmeticsMatch = path.match(/^\/cosmetics\/(.+)$/);
    const womenMatch = path.match(/^\/women\/(.+)$/);

    if (productMatch && selectedProduct) {
        pageTitle = `${selectedProduct.name} - ${BASE_TITLE}`;
    } else if (thankYouMatch) {
        pageTitle = `Order Confirmed! - ${BASE_TITLE}`;
    } else if (cosmeticsMatch) {
        const cat = cosmeticsMatch[1].replace(/-/g, ' ');
        pageTitle = `${cat.charAt(0).toUpperCase() + cat.slice(1)} - Cosmetics - ${BASE_TITLE}`;
    } else if (womenMatch) {
        const cat = womenMatch[1].replace(/-/g, ' ');
        pageTitle = `${cat.charAt(0).toUpperCase() + cat.slice(1)} - Women's Fashion - ${BASE_TITLE}`;
    } else if (path.startsWith('/admin')) {
        pageTitle = `Admin Panel - ${BASE_TITLE}`;
    } else {
        switch (path) {
            case '/':
                pageTitle = `${BASE_TITLE} - Elegant Women's Wear & Cosmetics`;
                break;
            case '/women':
                pageTitle = `Women's Collection - ${BASE_TITLE}`;
                break;
            case '/shop':
                pageTitle = `Shop All - ${BASE_TITLE}`;
                break;
            case '/cosmetics':
                pageTitle = `Cosmetics - ${BASE_TITLE}`;
                break;
            case '/cart':
                pageTitle = `Your Shopping Cart - ${BASE_TITLE}`;
                break;
            case '/checkout':
                pageTitle = `Checkout - ${BASE_TITLE}`;
                break;
            case '/contact':
                pageTitle = `Contact Us - ${BASE_TITLE}`;
                break;
            case '/policy':
                pageTitle = `Privacy Policy - ${BASE_TITLE}`;
                break;
        }
    }
    
    document.title = pageTitle;
  }, [path, selectedProduct]);
  
  useEffect(() => {
    const adminPageCheck = path.startsWith('/admin') && path !== '/admin/login';
    if (adminPageCheck && !isAdminAuthenticated) {
        navigate('/admin/login');
    }
  }, [path, isAdminAuthenticated, navigate]);


  const isCustomerPage = !path.startsWith('/admin');
  const isProductPage = path.startsWith('/product/');

  const renderAdminPageContent = () => {
     if (path === '/admin/dashboard') return <AdminDashboardPage />;
     if (path === '/admin/products') return <AdminProductsPage />;
     if (path === '/admin/orders') return <AdminOrdersPage />;
     if (path === '/admin/messages') return <AdminMessagesPage />;
     if (path === '/admin/settings') return <AdminSettingsPage />;
     if (path === '/admin/payment-info' || path === '/admin/transactions') return <AdminPaymentInfoPage />;
     
     return <AdminDashboardPage />;
  }

  const renderPage = () => {
    if (path === '/admin/login') {
      return <AdminLoginPage />;
    }

    if (path.startsWith('/admin')) {
      return (
        <AdminLayout>
            {renderAdminPageContent()}
        </AdminLayout>
      );
    }
    
    const productMatch = path.match(/^\/product\/(.+)$/);
    if (productMatch) {
      return <ProductDetailsPage />;
    }

    const thankYouMatch = path.match(/^\/thank-you\/(.+)$/);
    if (thankYouMatch) {
        const orderId = thankYouMatch[1];
        return <ThankYouPage orderId={orderId} />;
    }

    // Dynamic Route Matchers for Cosmetics & Women
    if (path.startsWith('/cosmetics')) {
        return <CosmeticsPage />;
    }
    if (path.startsWith('/women')) {
        return <WomenPage />;
    }

    switch (path) {
      case '/':
        return <HomePage />;
      case '/shop':
        return <ShopPage />;
      case '/cart':
        return <CartPage />;
      case '/checkout':
        return <CheckoutPage />;
      case '/contact':
        return (
          <Suspense fallback={<PageLoader />}>
            <ContactPage />
          </Suspense>
        );
      case '/policy':
        return (
          <Suspense fallback={<PageLoader />}>
            <PolicyPage />
          </Suspense>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={`min-h-screen ${isCustomerPage ? 'bg-[#FEF5F5]' : 'bg-gray-100'} font-sans flex flex-col`}>
      <style>
        {`
          .sazo-logo { font-family: 'Inter', sans-serif; }
          html { width: 100%; overflow-x: hidden; scroll-padding-top: 100px; }
          body { font-family: 'Inter', sans-serif; color: #444; overflow-x: hidden; width: 100%; position: relative; }
          ::-webkit-scrollbar { display: none; }
          h1, .font-display-xl { font-weight: 700; }
          h2, .font-display-lg { font-weight: 600; }
          h3, .font-display-md { font-weight: 600; }
          input:-webkit-autofill, textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px white inset !important; }
          @keyframes gradient-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          .sazo-logo-gradient { background: linear-gradient(to right, #db2777 20%, #9333ea 40%, #ec4899 60%, #db2777 80%); background-size: 200% auto; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: gradient-flow 3s linear infinite; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
        `}
      </style>
      <Notification notification={notification} />
      {isCustomerPage && <Header />}
      <div className={`flex-grow flex flex-col ${isCustomerPage && !isProductPage ? 'pt-[68px] sm:pt-[80px]' : ''}`}>
          {renderPage()}
      </div>
      {isCustomerPage && showWhatsAppButton && <WhatsAppButton />}
      {isCustomerPage && <Footer />}
    </div>
  );
};

export default App;
