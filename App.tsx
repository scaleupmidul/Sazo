import React, { useEffect, Suspense } from 'react';
import { useAppStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Notification from './components/Notification';
import WhatsAppButton from './components/WhatsAppButton';
import PageLoader from './components/PageLoader';

// Static Imports for Instant Navigation (Customer Pages)
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';
import ThankYouPage from './pages/ThankYouPage';

// Lazy Load Admin Pages to reduce bundle size for customers
const AdminLoginPage = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = React.lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminMessagesPage = React.lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminSettingsPage = React.lazy(() => import('./pages/admin/AdminSettingsPage'));
const AdminPaymentInfoPage = React.lazy(() => import('./pages/admin/AdminPaymentInfoPage'));

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
        // Sanitize ID: Remove any query parameters (e.g., ?fbclid=...)
        const productId = productMatch[1].split('?')[0];
        
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
    
    const productMatch = path.match(/^\/product\/(.+)$/);
    if (productMatch) {
      return <ProductDetailsPage />;
    }

    const thankYouMatch = path.match(/^\/thank-you\/(.+)$/);
    if (thankYouMatch) {
        const orderId = thankYouMatch[1];
        return <ThankYouPage orderId={orderId} />;
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
        return <ContactPage />;
      case '/policy':
        return <PolicyPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={`min-h-screen ${isCustomerPage ? 'bg-[#FEF5F5]' : 'bg-gray-100'} font-sans flex flex-col`}>
      <style>
        {`
          .sazo-logo {
            font-family: 'Inter', sans-serif;
          }

          /* Hide scrollbar for IE, Edge */
          body { 
            font-family: 'Inter', sans-serif; 
            color: #444;
            overflow-x: hidden;
            -ms-overflow-style: none;
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

          /* Override browser autofill styles */
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
