

import React, { useEffect, Suspense } from 'react';
import { useAppStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import WhatsAppButton from './components/WhatsAppButton';
import { LoaderCircle } from 'lucide-react';

// Eager load HomePage for better LCP (Largest Contentful Paint)
import HomePage from './pages/HomePage';

// Initialize the dataLayer for analytics
declare global {
  interface Window { dataLayer: any[]; }
}
window.dataLayer = window.dataLayer || [];

// Lazy load other pages to reduce bundle size
const ShopPage = React.lazy(() => import('./pages/ShopPage'));
const ProductDetailsPage = React.lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PolicyPage = React.lazy(() => import('./pages/PolicyPage'));
const ThankYouPage = React.lazy(() => import('./pages/ThankYouPage'));

// Admin Pages
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminMessagesPage = React.lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminPaymentInfoPage = React.lazy(() => import('./pages/admin/AdminPaymentInfoPage'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center space-y-4">
      <LoaderCircle className="w-10 h-10 text-pink-600 animate-spin" />
      <p className="text-stone-500 text-sm font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

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
        const productId = productMatch[1];
        if (selectedProduct?.id === productId) {
            return;
        }
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product || null);
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

    if (productMatch && selectedProduct) {
        pageTitle = `${selectedProduct.name} - ${BASE_TITLE}`;
    } else if (thankYouMatch) {
        pageTitle = `Order Confirmed! - ${BASE_TITLE}`;
    } else if (path.startsWith('/admin')) {
        pageTitle = `Admin Panel - ${BASE_TITLE}`;
    } else {
        switch (path) {
            case '/':
                pageTitle = `${BASE_TITLE} - Elegant Women's Wear`;
                break;
            case '/shop':
                pageTitle = `Shop All - ${BASE_TITLE}`;
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

  const renderAdminPageContent = () => {
     if (path === '/admin/dashboard') return <AdminDashboardPage />;
     if (path === '/admin/products') return <AdminProductsPage />;
     if (path === '/admin/orders') return <AdminOrdersPage />;
     if (path === '/admin/messages') return <AdminMessagesPage />;
     if (path === '/admin/settings') return <AdminSettingsPage />;
     if (path === '/admin/payment-info') return <AdminPaymentInfoPage />;
     
     return <AdminDashboardPage />;
  }

  const renderPage = () => {
    if (path === '/admin/login') {
      return <AdminLoginPage />;
    }

    if (path.startsWith('/admin')) {
      return (
        <AdminLayout>
            <Suspense fallback={<PageLoader />}>
                {renderAdminPageContent()}
            </Suspense>
        </AdminLayout>
      );
    }
    
    const productMatch = path.match(/^\/product\/(.+)$/);
    if (productMatch) {
      return (
        <Suspense fallback={<PageLoader />}>
            <ProductDetailsPage />
        </Suspense>
      );
    }

    const thankYouMatch = path.match(/^\/thank-you\/(.+)$/);
    if (thankYouMatch) {
        const orderId = thankYouMatch[1];
        return (
            <Suspense fallback={<PageLoader />}>
                <ThankYouPage orderId={orderId} />
            </Suspense>
        );
    }

    switch (path) {
      case '/':
        // HomePage is now eagerly loaded, no Suspense needed
        return <HomePage />;
      case '/shop':
        return (
            <Suspense fallback={<PageLoader />}>
                <ShopPage />
            </Suspense>
        );
      case '/cart':
        return (
            <Suspense fallback={<PageLoader />}>
                <CartPage />
            </Suspense>
        );
      case '/checkout':
        return (
            <Suspense fallback={<PageLoader />}>
                <CheckoutPage />
            </Suspense>
        );
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
          .sazo-logo {
            font-family: 'Poppins', sans-serif;
          }

          /* Hide scrollbar for IE, Edge */
          body { 
            font-family: 'Inter', sans-serif; 
            color: #444;
            overflow-x: hidden; /* Prevent horizontal scroll */
            -ms-overflow-style: none;  /* IE and Edge */
          }

          /* Hide scrollbar for Firefox */
          html {
              scrollbar-width: none;
          }
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          ::-webkit-scrollbar {
              display: none;
          }

          h1, .font-display-xl { font-weight: 700; }
          h2, .font-display-lg { font-weight: 600; }
          h3, .font-display-md { font-weight: 600; }

          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            -webkit-text-fill-color: #000 !important;
          }

          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }

          @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
          }
          .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }

          @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
          }

          @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }

          @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }

          .text-shadow { text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
          .text-shadow-md { text-shadow: 0 2px 8px rgba(0,0,0,0.4); }

          @keyframes pulse-whatsapp {
            0% { box-shadow: 0 0 0 0 rgba(219, 39, 119, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(219, 39, 119, 0); }
            100% { box-shadow: 0 0 0 0 rgba(219, 39, 119, 0); }
          }
          .animate-pulse-whatsapp {
            animation: pulse-whatsapp 2s infinite;
          }
        `}
      </style>

      <Notification notification={notification} />
      {isCustomerPage && <Header />}
      <div className="flex-grow flex flex-col">
          {renderPage()}
      </div>
      {isCustomerPage && showWhatsAppButton && <WhatsAppButton />}
      {isCustomerPage && <Footer />}
    </div>
  );
};

export default App;
