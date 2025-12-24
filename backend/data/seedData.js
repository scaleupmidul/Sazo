
// Data copied from frontend constants.ts
export const MOCK_PRODUCTS_DATA = [
  { id: 101, name: "Gulmohar Lawn Suit", category: "Cotton", price: 3500, description: "Pure cotton lawn three-piece with exquisite embroidery and soft dupatta. Ideal for daily wear.", fabric: "Lawn Cotton", colors: ["Pastel Pink", "Beige", "Mint"], sizes: ["S", "M", "L", "XL", "Free"], isNewArrival: true, isTrending: false, onSale: false, images: ["https://picsum.photos/seed/gulmohar/400/500", "https://picsum.photos/seed/gulmohar2/400/500", "https://picsum.photos/seed/gulmohar3/400/500"] },
  { id: 102, name: "Shalimar Silk Ensemble", category: "Silk", price: 6200, description: "Elegant raw silk suit with delicate zari work. Perfect for evening occasions.", fabric: "Raw Silk", colors: ["Maroon", "Gold"], sizes: ["36", "38", "40", "42"], isNewArrival: true, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/shalimar/400/500", "https://picsum.photos/seed/shalimar2/400/500", "https://picsum.photos/seed/shalimar3/400/500"] },
  { id: 103, name: "Party Princess Georgette", category: "Party Wear", price: 7800, description: "Heavy georgette suit with stone embellishments. Ready for any celebration.", fabric: "Georgette", colors: ["Royal Blue", "Crimson"], sizes: ["Free"], isNewArrival: false, isTrending: true, onSale: true, images: ["https://picsum.photos/seed/georgette/400/500", "https://picsum.photos/seed/georgette2/400/500", "https://picsum.photos/seed/georgette3/400/500"] },
  { id: 104, name: "Everyday Beige Cotton", category: "Cotton", price: 2800, description: "Simple yet stylish cotton suit for comfortable daily use.", fabric: "Cotton", colors: ["Beige", "Lavender"], sizes: ["38", "40", "42", "44", "46"], isNewArrival: false, isTrending: false, onSale: true, images: ["https://picsum.photos/seed/beige/400/500", "https://picsum.photos/seed/beige2/400/500", "https://picsum.photos/seed/beige3/400/500"] },
  { id: 201, name: "Radiance Vitamin C Serum", category: "Cosmetics", price: 1250, description: "Brightening serum with pure Vitamin C and Hyaluronic Acid for all skin types.", fabric: "Skincare", colors: ["Clear"], sizes: ["30ml"], isNewArrival: true, isTrending: true, onSale: false, images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400&h=500"] },
  { id: 202, name: "Matte Velvet Lipstick", category: "Cosmetics", price: 850, description: "Long-lasting matte finish lipstick in 'Sazo Red'. Highly pigmented and hydrating.", fabric: "Makeup", colors: ["Red", "Nude", "Pink"], sizes: ["One Size"], isNewArrival: true, isTrending: true, onSale: false, images: ["https://images.unsplash.com/photo-1586776977607-310e9c725c37?auto=format&fit=crop&q=80&w=400&h=500"] },
  { id: 203, name: "Rose Water Hydrating Mist", category: "Cosmetics", price: 550, description: "Refreshing facial mist made with organic rose petals. Instantly calms skin.", fabric: "Skincare", colors: ["Clear"], sizes: ["100ml"], isNewArrival: false, isTrending: false, onSale: true, images: ["https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?auto=format&fit=crop&q=80&w=400&h=500"] },
  { id: 108, name: "Maharani Velvet", category: "Party Wear", price: 9500, description: "Luxurious velvet three-piece with heavy sequin work.", fabric: "Velvet", colors: ["Navy", "Wine Red"], sizes: ["38", "40", "42", "44", "Free"], isNewArrival: true, isTrending: true, onSale: true, images: ["https://picsum.photos/seed/maharani/400/500"] },
];

const SLIDER_IMAGE_URLS = {
  silk: "https://picsum.photos/seed/sazo-silk-fashion/1200/500",
  lawn: "https://picsum.photos/seed/sazo-lawn-style/1200/500",
  party: "https://picsum.photos/seed/sazo-party-dress/1200/500",
};
const SLIDER_MOBILE_IMAGE_URLS = {
  silk: "https://picsum.photos/seed/sazo-silk-mobile/400/500",
  lawn: "https://picsum.photos/seed/sazo-lawn-mobile/400/500",
  party: "https://picsum.photos/seed/sazo-party-mobile/400/500",
};
const CATEGORY_IMAGE_URLS = {
  cotton: "https://picsum.photos/seed/sazo-cotton-fabric/600/800",
  silk: "https://picsum.photos/seed/sazo-silk-dress/600/800",
  partyWear: "https://picsum.photos/seed/sazo-party-fashion/600/800",
};

export const DEFAULT_SETTINGS_DATA = {
  onlinePaymentInfo: 'অর্ডার কনফার্ম করতে ডেলিভারি চার্জ অগ্রিম প্রদান করুন —\n<b>01909285883 (Personal)</b>\nBkash / Nagad\nএবং নিচের তথ্যগুলো পূরণ করুন:',
  onlinePaymentInfoStyles: {
    fontSize: '0.875rem', 
  },
  codEnabled: true,
  onlinePaymentEnabled: true,
  onlinePaymentMethods: ['Bkash', 'Nagad', 'UPAY'],
  sliderImages: [
    { id: 1, title: "The Festive Silk Collection", subtitle: "Elegance and shimmer for every occasion.", color: "text-pink-600", image: SLIDER_IMAGE_URLS.silk, mobileImage: SLIDER_MOBILE_IMAGE_URLS.silk },
    { id: 2, title: "Comfortable Lawn Arrivals", subtitle: "Breathe easy with our new cotton designs.", color: "text-blue-600", image: SLIDER_IMAGE_URLS.lawn, mobileImage: SLIDER_MOBILE_IMAGE_URLS.lawn },
    { id: 3, title: "Grand Party Wear", subtitle: "Unveil the ultimate glamour this season.", color: "text-purple-600", image: SLIDER_IMAGE_URLS.party, mobileImage: SLIDER_MOBILE_IMAGE_URLS.party }
  ],
  categoryImages: [
    { categoryName: "Cotton", image: CATEGORY_IMAGE_URLS.cotton },
    { categoryName: "Silk", image: CATEGORY_IMAGE_URLS.silk },
    { categoryName: "Party Wear", image: CATEGORY_IMAGE_URLS.partyWear },
    { categoryName: "Cosmetics", image: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=600&h=800" }
  ],
  categories: ["Cotton", "Silk", "Party Wear", "Cosmetics"],
  shippingOptions: [],
  productPagePromoImage: "https://picsum.photos/seed/sazo-lifestyle-promo/1200/400",
  contactAddress: 'Avenue 12, Gulshan-1, Dhaka, Bangladesh',
  contactPhone: '+880 17XX XXX XXX',
  contactEmail: 'support@sazo.com',
  whatsappNumber: '+8801700000000',
  showWhatsAppButton: true,
  showCityField: true,
  socialMediaLinks: [
    { platform: 'Facebook', url: '#' },
    { platform: 'Instagram', url: '#' },
    { platform: 'Twitter', url: '#' },
  ],
  privacyPolicy: `
1. Introduction
Welcome to SAZO. We are committed to protecting your privacy...
  `.trim(),
  adminEmail: 'admin@sazo.com',
  adminPassword: 'password123',
  footerDescription: 'Discover elegance and style with SAZO. We bring you the finest collections of women\'s wear and premium cosmetics.',
  homepageNewArrivalsCount: 4,
  homepageTrendingCount: 4,
  showSliderText: true,
};
