
// App.tsx

import React, { useEffect, Suspense } from 'react';
import { useAppStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import WhatsAppButton from './components/WhatsAppButton';
import PageLoader from './components/PageLoader';

// CORE PAGES: Static imports for instant performance on home/shop
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import CosmeticsPage from './pages/CosmeticsPage';
import WomenPage from './pages/WomenPage';

// ADMIN PAGES: Lazy loading to reduce initial bundle size
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminMessagesPage = React.lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminPaymentInfoPage = React.lazy(() => import('./pages/admin/AdminPaymentInfoPage'));

// INFORMATIONAL PAGES: Lazy loading
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
    if (productMatch && selectedProduct) {
        pageTitle = `${selectedProduct.name} - ${BASE_TITLE}`;
    } else if (path.startsWith('/admin')) {
        pageTitle = `Admin Panel - ${BASE_TITLE}`;
    } else {
        switch (path) {
            case '/': pageTitle = `${BASE_TITLE} - Elegant Women's Wear & Cosmetics`; break;
            case '/women': pageTitle = `Women's Collection - ${BASE_TITLE}`; break;
            case '/shop': pageTitle = `Shop All - ${BASE_TITLE}`; break;
            case '/cosmetics': pageTitle = `Cosmetics - ${BASE_TITLE}`; break;
            case '/cart': pageTitle = `Your Shopping Cart - ${BASE_TITLE}`; break;
            case '/checkout': pageTitle = `Checkout - ${BASE_TITLE}`; break;
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
      return (
        <Suspense fallback={<PageLoader />}>
          <AdminLoginPage />
        </Suspense>
      );
    }

    if (path.startsWith('/admin')) {
      return (
        <Suspense fallback={<PageLoader />}>
          <AdminLayout>
              {renderAdminPageContent()}
          </AdminLayout>
        </Suspense>
      );
    }
    
    if (path.startsWith('/product/')) return <ProductDetailsPage />;
    if (path.startsWith('/thank-you/')) {
        const orderId = path.split('/')[2];
        return <ThankYouPage orderId={orderId} />;
    }
    if (path.startsWith('/cosmetics')) return <CosmeticsPage />;
    if (path.startsWith('/women')) return <WomenPage />;

    switch (path) {
      case '/': return <HomePage />;
      case '/shop': return <ShopPage />;
      case '/cart': return <CartPage />;
      case '/checkout': return <CheckoutPage />;
      case '/contact': return <Suspense fallback={<PageLoader />}><ContactPage /></Suspense>;
      case '/policy': return <Suspense fallback={<PageLoader />}><PolicyPage /></Suspense>;
      default: return <HomePage />;
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
          .sazo-logo-gradient { 
            background: linear-gradient(to right, #db2777 20%, #9333ea 40%, #ec4899 60%, #db2777 80%); 
            background-size: 200% auto; 
            background-clip: text; 
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent; 
            animation: gradient-flow 3s linear infinite; 
          }
          @keyframes gradient-flow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
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
