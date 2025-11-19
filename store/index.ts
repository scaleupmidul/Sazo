import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Product, CartItem, Order, OrderStatus, ContactMessage, AppSettings, AdminProductsResponse } from '../types';

const API_URL = '/api';

const getTokenFromStorage = (): string | null => {
    return localStorage.getItem('sazo_admin_token');
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
        
        navigate: (newPath: string) => {
            if (window.location.pathname !== newPath) {
                window.history.pushState({}, '', newPath);
            }
            set({ path: newPath });
            window.scrollTo(0, 0);
        },

        loadInitialData: async () => {
            set({ loading: true });
            const { isAdminAuthenticated, notify } = get();
            try {
                // Fetch optimized homepage data first for a fast initial load
                const homeDataRes = await fetch(`${API_URL}/page-data/home`);
                if (!homeDataRes.ok) {
                    throw new Error('Failed to fetch initial page data.');
                }
                const homeData = await homeDataRes.json();
                set({
                    products: homeData.products,
                    settings: homeData.settings,
                    fullProductsLoaded: false,
                });

                // If admin is logged in, fetch admin-specific data
                if (isAdminAuthenticated) {
                    const token = getTokenFromStorage();
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                    const [ordersRes, messagesRes] = await Promise.all([
                        fetch(`${API_URL}/orders`, { headers }),
                        fetch(`${API_URL}/messages`, { headers })
                    ]);

                    if (!ordersRes.ok || !messagesRes.ok) {
                        throw new Error('Failed to fetch admin data.');
                    }

                    const ordersData = await ordersRes.json();
                    const messagesData = await messagesRes.json();
                    set({ orders: ordersData, contactMessages: messagesData });
                }
            } catch (error) {
                console.error("Failed to load initial data", error);
                notify("Could not connect to the server.", "error");
            } finally {
                set({ loading: false });
                // After the initial UI render is unblocked, start fetching the rest of the products in the background.
                // This pre-fetching makes navigating to the Shop page feel instantaneous.
                setTimeout(() => {
                    get().ensureAllProductsLoaded();
                }, 100);
            }
        },

        ensureAllProductsLoaded: async () => {
            const { fullProductsLoaded, products: existingProducts, notify } = get();
            if (fullProductsLoaded) return;
    
            try {
                const res = await fetch(`${API_URL}/products`);
                if (!res.ok) throw new Error('Failed to fetch all products');
                const allProducts: Product[] = await res.json();
                
                // Merge products, giving precedence to the full list but keeping existing ones if not in the new list
                const productMap = new Map<string, Product>();
                existingProducts.forEach(p => productMap.set(p.id, p));
                allProducts.forEach(p => productMap.set(p.id, p));
                const mergedProducts = Array.from(productMap.values());
    
                set({ products: mergedProducts, fullProductsLoaded: true });
            } catch (error) {
                console.error("Failed to load all products", error);
                notify("Could not load all products.", "error");
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
            
            // Push GA4 add_to_cart event
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'add_to_cart',
                ecommerce: {
                    currency: 'BDT',
                    items: [{
                        item_id: product.id,
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
            
            // Find the full product details for tracking
            const productDetails = products.find(p => p.id === id);

            if (quantityDifference > 0 && productDetails) { // Item quantity increased
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'add_to_cart',
                    ecommerce: {
                        currency: 'BDT',
                        items: [{
                            item_id: productDetails.id,
                            item_name: productDetails.name,
                            item_category: productDetails.category,
                            price: productDetails.price,
                            quantity: quantityDifference, // track the number of items added
                            item_variant: size
                        }]
                    }
                });
            } else if (quantityDifference < 0 && productDetails) { // Item quantity decreased or removed
                 window.dataLayer = window.dataLayer || [];
                 window.dataLayer.push({
                    event: 'remove_from_cart',
                    ecommerce: {
                        currency: 'BDT',
                        items: [{
                            item_id: productDetails.id,
                            item_name: productDetails.name,
                            item_category: productDetails.category,
                            price: productDetails.price,
                            quantity: -quantityDifference, // track the number of items removed
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
            set({ isAdminAuthenticated: false, orders: [], contactMessages: [] });
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

        addOrder: async (customerDetails, cartItems, total, paymentInfo) => {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerDetails, cartItems, total, paymentInfo }),
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
                    const errorData = await res.json().catch(() => ({ message: 'Failed to update settings. The server returned an invalid response.' }));
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
      // Only persist the 'cart' slice of the state
      partialize: (state) => ({ cart: state.cart }),
      // Custom merge function to recalculate cartTotal on rehydration and validate data
      merge: (persistedState: any, currentState: AppState) => {
        // Safety check: if persisted state is not an object or null, ignore it
        if (!persistedState || typeof persistedState !== 'object') {
            return currentState;
        }

        // Strict validation for cart items to prevent crashes
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
        // Recalculate total based on the validated cart
        merged.cartTotal = safeCart.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
        
        return merged;
      },
    }
  )
);

// Initialize popstate listener for browser navigation
window.addEventListener('popstate', () => {
  useAppStore.setState({ path: window.location.pathname });
});

// Load initial data when the store is created
useAppStore.getState().loadInitialData();
