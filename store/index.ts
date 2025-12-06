

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Product, CartItem, Order, OrderStatus, ContactMessage, AppSettings, AdminProductsResponse } from '../types';

const API_URL = '/api';

const getTokenFromStorage = (): string | null => {
    return localStorage.getItem('sazo_admin_token');
};

// Helper to generate SKU for DataLayer
const generateSKU = (name: string, size: string): string => {
    if (!name) return 'UNKNOWN';
    // Take first word of name, uppercase it, remove special chars
    const namePart = name.split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, ''); 
    const sizePart = size === 'Free' ? 'FREE' : size.toUpperCase();
    return `SAZO-${namePart}-${sizePart}`;
};

const DEFAULT_SETTINGS: AppSettings = {
    onlinePaymentInfo: '',
    onlinePaymentInfoStyles: { fontSize: '0.875rem' },
    codEnabled: true, onlinePaymentEnabled: true, onlinePaymentMethods: [],
    sliderImages: [], categoryImages: [], categories: [], shippingOptions: [], productPagePromoImage: '',
    contactAddress: '', contactPhone: '', contactEmail: '', whatsappNumber: '', showWhatsAppButton: false,
    showCityField: true,
    socialMediaLinks: [], privacyPolicy: '', adminEmail: '', adminPassword: '', footerDescription: '',
    homepageNewArrivalsCount: 4, homepageTrendingCount: 4
};

// Fallback Mock Data to ensure UI works even if backend fails
const MOCK_PRODUCTS_DATA: Product[] = [
  { id: '101', name: "Gulmohar Lawn Suit", category: "Cotton", price: 3500, description: "Pure cotton lawn three-piece with exquisite embroidery and soft dupatta. Ideal for daily wear.", fabric: "Lawn Cotton", colors: ["Pastel Pink", "Beige", "Mint"], sizes: ["S", "M", "L", "XL", "Free"], isNewArrival: true, isTrending: false, onSale: false, images: ["https://picsum.photos/seed/gulmohar/400/500", "https://picsum.photos/seed/gulmohar2/400/500", "https://picsum.photos/seed/gulmohar3/400/500"], displayOrder: 1000 },
  { id: '102', name: "Shalimar Silk Ensemble", category: "Silk", price: 6200, description: "Elegant raw silk suit with delicate zari work. Perfect for evening occasions.", fabric: "Raw Silk", colors: ["Maroon", "Gold"], sizes: ["36", "38", "40", "42"], isNewArrival: true, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/shalimar/400/500", "https://picsum.photos/seed/shalimar2/400/500", "https://picsum.photos/seed/shalimar3/400/500"], displayOrder: 1000 },
  { id: '103', name: "Party Princess Georgette", category: "Party Wear", price: 7800, description: "Heavy georgette suit with stone embellishments. Ready for any celebration.", fabric: "Georgette", colors: ["Royal Blue", "Crimson"], sizes: ["Free"], isNewArrival: false, isTrending: true, onSale: true, images: ["https://picsum.photos/seed/georgette/400/500", "https://picsum.photos/seed/georgette2/400/500", "https://picsum.photos/seed/georgette3/400/500"], displayOrder: 1000 },
  { id: '104', name: "Everyday Beige Cotton", category: "Cotton", price: 2800, description: "Simple yet stylish cotton suit for comfortable daily use.", fabric: "Cotton", colors: ["Beige", "Lavender"], sizes: ["38", "40", "42", "44", "46"], isNewArrival: false, isTrending: false, onSale: true, images: ["https://picsum.photos/seed/beige/400/500", "https://picsum.photos/seed/beige2/400/500", "https://picsum.photos/seed/beige3/400/500"], displayOrder: 1000 },
  { id: '105', name: "Mogra Chiffon", category: "Party Wear", price: 5900, description: "Flowy chiffon with printed motifs and lace detailing.", fabric: "Chiffon", colors: ["White", "Yellow"], sizes: ["S", "M", "L"], isNewArrival: false, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/mogra/400/500", "https://picsum.photos/seed/mogra2/400/500", "https://picsum.photos/seed/mogra3/400/500"], displayOrder: 1000 },
  { id: '106', name: "Sapphire Lawn Print", category: "Cotton", price: 3200, description: "Vibrant printed lawn suit with comfortable cotton dupatta.", fabric: "Lawn Cotton", colors: ["Blue", "Green", "White"], sizes: ["36", "38", "40", "42", "44"], isNewArrival: true, isTrending: false, onSale: false, images: ["https://picsum.photos/seed/sapphire/400/500", "https://picsum.photos/seed/sapphire2/400/500", "https://picsum.photos/seed/sapphire3/400/500"], displayOrder: 1000 },
  { id: '107', name: "Emerald Viscose", category: "Silk", price: 5500, description: "Smooth viscose silk blend with minimalist golden detailing.", fabric: "Viscose Silk", colors: ["Emerald", "Black"], sizes: ["M", "L", "XL"], isNewArrival: true, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/emerald/400/500", "https://picsum.photos/seed/emerald2/400/500", "https://picsum.photos/seed/emerald3/400/500"], displayOrder: 1000 },
  { id: '108', name: "Maharani Velvet", category: "Party Wear", price: 9500, description: "Luxurious velvet three-piece with heavy sequin work. Ultimate festive attire.", fabric: "Velvet", colors: ["Navy", "Wine Red"], sizes: ["38", "40", "42", "44", "Free"], isNewArrival: true, isTrending: true, onSale: true, images: ["https://picsum.photos/seed/maharani/400/500", "https://picsum.photos/seed/maharani2/400/500", "https://picsum.photos/seed/maharani3/400/500"], displayOrder: 1000 },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
        path: window.location.pathname,
        products: [],
        orders: [],
        contactMessages: [],
        settings: DEFAULT_SETTINGS,
        cart: [],
        selectedProduct: null,
        notification: null,
        loading: true,
        isAdminAuthenticated: !!getTokenFromStorage(),
        cartTotal: 0,
        fullProductsLoaded: false,
        adminProducts: [],
        adminProductsPagination: { page: 1, pages: 1, total: 0 },
        dashboardStats: null,
        newOrdersCount: 0,
        
        navigate: (newPath: string) => {
            if (window.location.pathname !== newPath) {
                window.history.pushState({}, '', newPath);
            }
            set({ path: newPath });
            window.scrollTo(0, 0);
        },

        // Optimized for Customers: Only loads public data
        loadInitialData: async () => {
            const { notify } = get();
            
            try {
                // Fetch optimized homepage data first for a fast initial load
                const homeDataRes = await fetch(`${API_URL}/page-data/home`);
                
                if (!homeDataRes.ok) {
                    throw new Error('Failed to fetch initial page data.');
                }
                const homeData = await homeDataRes.json();
                
                let finalProducts: Product[] = [];

                if (homeData.products && homeData.products.length > 0) {
                    finalProducts = homeData.products.map((p: Product) => {
                        const mock = MOCK_PRODUCTS_DATA.find(m => m.name === p.name);
                        if (mock && (!p.images || p.images.length < 3)) {
                            const currentImages = p.images || [];
                            const uniqueMockImages = mock.images.filter(img => !currentImages.includes(img));
                            const needed = 3 - currentImages.length;
                            if (uniqueMockImages.length > 0) {
                                return { ...p, images: [...currentImages, ...uniqueMockImages.slice(0, needed)] };
                            }
                        }
                        return p;
                    });
                } else {
                    finalProducts = MOCK_PRODUCTS_DATA;
                }

                set({
                    products: finalProducts,
                    settings: homeData.settings || DEFAULT_SETTINGS,
                    fullProductsLoaded: false,
                    loading: false
                });

            } catch (error) {
                console.error("Failed to load initial data, using fallback.", error);
                set({ 
                    products: MOCK_PRODUCTS_DATA, 
                    settings: DEFAULT_SETTINGS, 
                    loading: false,
                    fullProductsLoaded: true 
                });
            } finally {
                setTimeout(() => {
                    get().ensureAllProductsLoaded();
                }, 100);
            }
        },

        // Dedicated action for Admin Data - Called ONLY from Admin Layout
        loadAdminData: async () => {
            const { isAdminAuthenticated } = get();
            if (!isAdminAuthenticated) return;

            const token = getTokenFromStorage();
            if (!token) return;

            const headers = { 'Authorization': `Bearer ${token}` };
            
            try {
                const [ordersRes, messagesRes, statsRes] = await Promise.all([
                    fetch(`${API_URL}/orders`, { headers }),
                    fetch(`${API_URL}/messages`, { headers }),
                    fetch(`${API_URL}/orders/stats`, { headers })
                ]);

                if (ordersRes.ok && messagesRes.ok && statsRes.ok) {
                    const ordersData = await ordersRes.json();
                    const messagesData = await messagesRes.json();
                    const statsData = await statsRes.json();
                    
                    const lastSeenOrders = localStorage.getItem('sazo_admin_last_orders_seen');
                    const lastSeenOrdersDate = lastSeenOrders ? new Date(lastSeenOrders) : new Date(0);
                    const newOrders = ordersData.filter((o: Order) => {
                        const oDate = o.createdAt ? new Date(o.createdAt) : new Date(o.date);
                        return oDate > lastSeenOrdersDate;
                    });

                    set({ 
                        orders: ordersData, 
                        contactMessages: messagesData,
                        dashboardStats: statsData,
                        newOrdersCount: newOrders.length
                    });
                }
            } catch (error) {
                console.error("Failed to load admin data", error);
            }
        },

        ensureAllProductsLoaded: async () => {
            const { fullProductsLoaded, products: existingProducts } = get();
            if (fullProductsLoaded) return;
    
            try {
                const res = await fetch(`${API_URL}/products`);
                if (!res.ok) throw new Error('Failed to fetch all products');
                let allProducts: Product[] = await res.json();
                
                if (allProducts.length > 0) {
                     allProducts = allProducts.map((p: Product) => {
                        const mock = MOCK_PRODUCTS_DATA.find(m => m.name === p.name);
                        if (mock && (!p.images || p.images.length < 3)) {
                            const currentImages = p.images || [];
                            const uniqueMockImages = mock.images.filter(img => !currentImages.includes(img));
                            const needed = 3 - currentImages.length;
                            if (uniqueMockImages.length > 0) {
                                return { ...p, images: [...currentImages, ...uniqueMockImages.slice(0, needed)] };
                            }
                        }
                        return p;
                    });
                } else {
                    allProducts = MOCK_PRODUCTS_DATA;
                }

                const productMap = new Map<string, Product>();
                existingProducts.forEach(p => productMap.set(p.id, p));
                allProducts.forEach(p => productMap.set(p.id, p));
                const mergedProducts = Array.from(productMap.values());
    
                set({ products: mergedProducts, fullProductsLoaded: true });
            } catch (error) {
                console.error("Failed to load all products", error);
            }
        },

        loadAdminProducts: async (page, searchTerm) => {
            const token = getTokenFromStorage();
            if (!token) return;
            
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    search: searchTerm
                });
                const res = await fetch(`${API_URL}/products/admin?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch admin products');
                
                const data: AdminProductsResponse = await res.json();
                
                set({ 
                    adminProducts: data.products,
                    adminProductsPagination: {
                        page: data.page,
                        pages: data.pages,
                        total: data.total
                    }
                });
            } catch (error) {
                console.error("Failed to load admin products", error);
                get().notify("Could not load products for admin panel.", "error");
            }
        },

        setProducts: (products) => set({ products }),

        setSelectedProduct: (product) => set({ selectedProduct: product }),

        notify: (message, type = 'success') => {
            set({ notification: { message, type } });
            setTimeout(() => set({ notification: null }), 3000);
        },
        
        addToCart: (product, quantity = 1, size) => {
            if (!size) {
                get().notify("Please select a size.", "error");
                return;
            }
            const { cart } = get();
            const existingItem = cart.find(item => item.id === product.id && item.size === size);
            let newCart;
            if (existingItem) {
                get().notify(`Quantity updated for ${product.name} (Size: ${size})!`, 'success');
                newCart = cart.map(item =>
                    item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                const newItem: CartItem = {
                    id: product.id, name: product.name, price: product.price, quantity: quantity,
                    image: product.images[0], size: size,
                };
                get().notify(`${product.name} (Size: ${size}) added to cart!`, 'success');
                newCart = [...cart, newItem];
            }
            
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: 'add_to_cart',
                ecommerce: {
                    currency: 'BDT',
                    items: [{
                        item_id: generateSKU(product.name, size),
                        item_name: product.name,
                        item_category: product.category,
                        price: product.price,
                        quantity: quantity,
                        item_variant: size
                    }]
                }
            });

            set({ cart: newCart });
            get()._updateCartTotal();
        },
        
        updateCartQuantity: (id, size, newQuantity) => {
            const { cart, products } = get();
            const cartItem = cart.find(item => item.id === id && item.size === size);
            if (!cartItem) return;

            const oldQuantity = cartItem.quantity;
            const quantityDifference = newQuantity - oldQuantity;
            const productDetails = products.find(p => p.id === id);

            if (quantityDifference > 0 && productDetails) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ ecommerce: null });
                window.dataLayer.push({
                    event: 'add_to_cart',
                    ecommerce: {
                        currency: 'BDT',
                        items: [{
                            item_id: generateSKU(productDetails.name, size),
                            item_name: productDetails.name,
                            item_category: productDetails.category,
                            price: productDetails.price,
                            quantity: quantityDifference,
                            item_variant: size
                        }]
                    }
                });
            } else if (quantityDifference < 0 && productDetails) {
                 window.dataLayer = window.dataLayer || [];
                 window.dataLayer.push({ ecommerce: null });
                 window.dataLayer.push({
                    event: 'remove_from_cart',
                    ecommerce: {
                        currency: 'BDT',
                        items: [{
                            item_id: generateSKU(productDetails.name, size),
                            item_name: productDetails.name,
                            item_category: productDetails.category,
                            price: productDetails.price,
                            quantity: -quantityDifference,
                            item_variant: size
                        }]
                    }
                });
            }

            let newCart;
            if (newQuantity <= 0) {
                newCart = cart.filter(item => !(item.id === id && item.size === size));
            } else {
                newCart = cart.map(item =>
                    item.id === id && item.size === size ? { ...item, quantity: newQuantity } : item
                );
            }
            set({ cart: newCart });
            get()._updateCartTotal();
        },
        
        clearCart: () => {
            set({ cart: [] });
            get()._updateCartTotal();
        },
        
        _updateCartTotal: () => {
            set(state => ({
                cartTotal: state.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
            }));
        },

        login: async (email, password) => {
            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                if (!res.ok) throw new Error('Login failed');
                const { token } = await res.json();
                localStorage.setItem('sazo_admin_token', token);
                set({ isAdminAuthenticated: true });
                get().loadAdminData(); // Explicitly load admin data on login
                get().navigate('/admin/dashboard');
                get().notify('Login successful!', 'success');
                return true;
            } catch (error) {
                get().notify('Incorrect email or password.', 'error');
                return false;
            }
        },

        logout: () => {
            localStorage.removeItem('sazo_admin_token');
            set({ isAdminAuthenticated: false, orders: [], contactMessages: [], dashboardStats: null });
            get().navigate('/');
            get().notify('You have been logged out.', 'success');
        },

        addProduct: async (productData) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(productData),
            });
            const newProduct = await res.json();
            set(state => ({ products: [newProduct, ...state.products] }));
            get().notify('Product added successfully!', 'success');
        },
        
        updateProduct: async (updatedProduct) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/products/${updatedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedProduct),
            });
            const savedProduct = await res.json();
            set(state => ({
                products: state.products.map(p => p.id === savedProduct.id ? savedProduct : p)
            }));
            get().notify('Product updated successfully!', 'success');
        },

        deleteProduct: async (id) => {
            const token = getTokenFromStorage();
            await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            set(state => ({ products: state.products.filter(p => p.id !== id) }));
            get().notify('Product deleted successfully.', 'success');
        },

        updateOrderStatus: async (orderId, status) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            const updatedOrder = await res.json();
            set(state => ({
                orders: state.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
            }));
            get().notify(`Order ${orderId} status updated to ${status}.`, 'success');
        },

        refreshOrders: async () => {
            const token = getTokenFromStorage();
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch orders');
                const ordersData = await res.json();
                
                const lastSeenOrders = localStorage.getItem('sazo_admin_last_orders_seen');
                const lastSeenOrdersDate = lastSeenOrders ? new Date(lastSeenOrders) : new Date(0);
                const newOrders = ordersData.filter((o: Order) => {
                    const oDate = o.createdAt ? new Date(o.createdAt) : new Date(o.date);
                    return oDate > lastSeenOrdersDate;
                });

                set({ orders: ordersData, newOrdersCount: newOrders.length });
                get().notify('Orders list refreshed.', 'success');
            } catch (error) {
                console.error("Failed to refresh orders", error);
                get().notify("Could not refresh orders.", "error");
            }
        },
        
        markOrdersAsSeen: () => {
            localStorage.setItem('sazo_admin_last_orders_seen', new Date().toISOString());
            set({ newOrdersCount: 0 });
        },

        addOrder: async (customerDetails, cartItems, total, paymentInfo, shippingCharge) => {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerDetails, cartItems, total, paymentInfo, shippingCharge }),
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to place order. Please check your details.");
            }
            
            const newOrder = await res.json();
            if(get().isAdminAuthenticated) {
                set(state => ({ orders: [newOrder, ...state.orders] }));
            }
            return newOrder;
        },

        deleteOrder: async (orderId) => {
            const token = getTokenFromStorage();
            await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            set(state => ({ orders: state.orders.filter(order => order.id !== orderId) }));
            get().notify(`Order ${orderId} has been deleted.`, 'success');
        },
        
        addContactMessage: async (messageData) => {
            await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });
        },

        markMessageAsRead: async (messageId, isRead) => {
            const token = getTokenFromStorage();
            const res = await fetch(`${API_URL}/messages/${messageId}/read`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isRead }),
            });
            const updatedMessage = await res.json();
            set(state => ({
                contactMessages: state.contactMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
            }));
            get().notify(`Message marked as ${isRead ? 'read' : 'unread'}.`, 'success');
        },

        deleteContactMessage: async (messageId) => {
            const token = getTokenFromStorage();
            await fetch(`${API_URL}/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            set(state => ({ contactMessages: state.contactMessages.filter(msg => msg.id !== messageId) }));
            get().notify('Message has been deleted.', 'success');
        },
        
        updateSettings: async (newSettings) => {
            try {
                const token = getTokenFromStorage();
                const res = await fetch(`${API_URL}/settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(newSettings),
                });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: 'Failed to update settings.' }));
                    throw new Error(errorData.message || 'Failed to update settings.');
                }
                const updatedSettings = await res.json();
                set({ settings: updatedSettings });
                get().notify('Settings updated successfully!', 'success');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                get().notify(`Error: ${errorMessage}`, 'error');
                throw error;
            }
        },
    }),
    {
      name: 'sazo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
          cart: state.cart,
          settings: state.settings,
          products: state.products
      }),
      merge: (persistedState: any, currentState: AppState) => {
        if (!persistedState || typeof persistedState !== 'object') {
            return currentState;
        }

        let safeCart: CartItem[] = [];
        if (Array.isArray(persistedState.cart)) {
            safeCart = persistedState.cart.filter((item: any) => 
                item && 
                typeof item === 'object' &&
                typeof item.id === 'string' && 
                typeof item.price === 'number' && 
                !isNaN(item.price) &&
                typeof item.quantity === 'number' &&
                !isNaN(item.quantity)
            );
        }

        const merged = { ...currentState, ...persistedState, cart: safeCart };
        merged.cartTotal = safeCart.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
        
        return merged;
      },
    }
  )
);

window.addEventListener('popstate', () => {
  useAppStore.setState({ path: window.location.pathname });
});

useAppStore.getState().loadInitialData();
