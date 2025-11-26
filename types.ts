
// FIX: Import Dispatch and SetStateAction types from React to resolve namespace errors.
import type { Dispatch, SetStateAction } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  fabric: string;
  colors: string[];
  sizes: string[];
  isNewArrival: boolean;
  newArrivalDisplayOrder?: number; // Separate order for New Arrivals
  isTrending: boolean;
  trendingDisplayOrder?: number; // Separate order for Trending
  onSale: boolean;
  images: string[];
  displayOrder: number; // Keep for backward compatibility or generic sort
}

export interface CartItem {
  id: string;
  name:string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderId: string; // Added numeric short ID
  customerName: string;
  phone: string;
  address: string;
  city: string;
  cartItems: CartItem[];
  total: number;
  shippingCharge?: number; // Explicitly store the shipping charge
  status: OrderStatus;
  date: string;
  createdAt?: string; // Added for tracking new orders
  paymentMethod: 'COD' | 'Online';
  paymentDetails?: {
    paymentNumber: string;
    method: string;
    amount: number;
    transactionId: string;
  };
}

export interface SliderImage {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  image: string;
}

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface SliderImageSetting {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  image: string;
  mobileImage?: string;
}

export interface CategoryImageSetting {
  categoryName: string;
  image: string;
}

export interface ShippingOption {
  id: string;
  label: string;
  charge: number;
}

export interface SocialMediaLink {
  platform: string;
  url: string;
}

export interface AppSettings {
  onlinePaymentInfo: string;
  onlinePaymentInfoStyles?: {
    fontSize: string;
  };
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  onlinePaymentMethods: string[];
  sliderImages: SliderImageSetting[];
  categoryImages: CategoryImageSetting[];
  categories: string[];
  shippingOptions: ShippingOption[];
  productPagePromoImage: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  showWhatsAppButton: boolean;
  showCityField: boolean;
  socialMediaLinks: SocialMediaLink[];
  privacyPolicy: string;
  adminEmail: string;
  adminPassword: string;
  footerDescription: string;
  homepageNewArrivalsCount: number;
  homepageTrendingCount: number;
}

export interface AdminProductsPagination {
  page: number;
  pages: number;
  total: number;
}

export interface AdminProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

export interface DashboardStats {
    totalOrders: number;
    onlineTransactions: number;
    totalRevenue: number;
    totalProducts: number;
}

export interface AppState {
  path: string;
  navigate: (path: string) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size: string) => void;
  updateCartQuantity: (id: string, size: string, newQuantity: number) => void;
  clearCart: () => void;
  _updateCartTotal: () => void;
  cartTotal: number;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  notification: Notification | null;
  notify: (message: string, type?: 'success' | 'error') => void;
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addOrder: (
    customerDetails: { name: string; phone: string; address: string; city: string; }, 
    cartItems: CartItem[], 
    total: number,
    paymentInfo: {
        paymentMethod: 'COD' | 'Online';
        paymentDetails?: {
            paymentNumber: string;
            method: string;
            amount: number;
            transactionId: string;
        }
    },
    shippingCharge: number // Added shippingCharge parameter
  ) => Promise<Order>;
  deleteOrder: (orderId: string) => Promise<void>;
  isAdminAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  contactMessages: ContactMessage[];
  addContactMessage: (messageData: Omit<ContactMessage, 'id' | 'date' | 'isRead'>) => Promise<void>;
  markMessageAsRead: (messageId: string, isRead: boolean) => Promise<void>;
  deleteContactMessage: (messageId: string) => Promise<void>;
  loading: boolean;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  loadInitialData: () => Promise<void>;
  fullProductsLoaded: boolean;
  ensureAllProductsLoaded: () => Promise<void>;
  adminProducts: Product[];
  adminProductsPagination: AdminProductsPagination;
  loadAdminProducts: (page: number, searchTerm: string) => Promise<void>;
  dashboardStats: DashboardStats | null;
  refreshOrders: () => Promise<void>;
  newOrdersCount: number;
  markOrdersAsSeen: () => void;
}
