// Data copied from frontend constants.ts
export const MOCK_PRODUCTS_DATA = [
  { id: 101, name: "Gulmohar Lawn Suit", category: "Cotton", price: 3500, description: "Pure cotton lawn three-piece with exquisite embroidery and soft dupatta. Ideal for daily wear.", fabric: "Lawn Cotton", colors: ["Pastel Pink", "Beige", "Mint"], sizes: ["S", "M", "L", "XL", "Free"], isNewArrival: true, isTrending: false, onSale: false, images: ["https://picsum.photos/seed/gulmohar/400/500", "https://picsum.photos/seed/gulmohar2/400/500", "https://picsum.photos/seed/gulmohar3/400/500"] },
  { id: 102, name: "Shalimar Silk Ensemble", category: "Silk", price: 6200, description: "Elegant raw silk suit with delicate zari work. Perfect for evening occasions.", fabric: "Raw Silk", colors: ["Maroon", "Gold"], sizes: ["36", "38", "40", "42"], isNewArrival: true, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/shalimar/400/500", "https://picsum.photos/seed/shalimar2/400/500", "https://picsum.photos/seed/shalimar3/400/500"] },
  { id: 103, name: "Party Princess Georgette", category: "Party Wear", price: 7800, description: "Heavy georgette suit with stone embellishments. Ready for any celebration.", fabric: "Georgette", colors: ["Royal Blue", "Crimson"], sizes: ["Free"], isNewArrival: false, isTrending: true, onSale: true, images: ["https://picsum.photos/seed/georgette/400/500", "https://picsum.photos/seed/georgette2/400/500", "https://picsum.photos/seed/georgette3/400/500"] },
  { id: 104, name: "Everyday Beige Cotton", category: "Cotton", price: 2800, description: "Simple yet stylish cotton suit for comfortable daily use.", fabric: "Cotton", colors: ["Beige", "Lavender"], sizes: ["38", "40", "42", "44", "46"], isNewArrival: false, isTrending: false, onSale: true, images: ["https://picsum.photos/seed/beige/400/500", "https://picsum.photos/seed/beige2/400/500", "https://picsum.photos/seed/beige3/400/500"] },
  { id: 105, name: "Mogra Chiffon", category: "Party Wear", price: 5900, description: "Flowy chiffon with printed motifs and lace detailing.", fabric: "Chiffon", colors: ["White", "Yellow"], sizes: ["S", "M", "L"], isNewArrival: false, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/mogra/400/500", "https://picsum.photos/seed/mogra2/400/500", "https://picsum.photos/seed/mogra3/400/500"] },
  { id: 106, name: "Sapphire Lawn Print", category: "Cotton", price: 3200, description: "Vibrant printed lawn suit with comfortable cotton dupatta.", fabric: "Lawn Cotton", colors: ["Blue", "Green", "White"], sizes: ["36", "38", "40", "42", "44"], isNewArrival: true, isTrending: false, onSale: false, images: ["https://picsum.photos/seed/sapphire/400/500", "https://picsum.photos/seed/sapphire2/400/500", "https://picsum.photos/seed/sapphire3/400/500"] },
  { id: 107, name: "Emerald Viscose", category: "Silk", price: 5500, description: "Smooth viscose silk blend with minimalist golden detailing.", fabric: "Viscose Silk", colors: ["Emerald", "Black"], sizes: ["M", "L", "XL"], isNewArrival: true, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/emerald/400/500", "https://picsum.photos/seed/emerald2/400/500", "https://picsum.photos/seed/emerald3/400/500"] },
  { id: 108, name: "Maharani Velvet", category: "Party Wear", price: 9500, description: "Luxurious velvet three-piece with heavy sequin work. Ultimate festive attire.", fabric: "Velvet", colors: ["Navy", "Wine Red"], sizes: ["38", "40", "42", "44", "Free"], isNewArrival: true, isTrending: true, onSale: true, images: ["https://picsum.photos/seed/maharani/400/500", "https://picsum.photos/seed/maharani2/400/500", "https://picsum.photos/seed/maharani3/400/500"] },
  { id: 109, name: "Spring Floral Cotton", category: "Cotton", price: 3100, description: "Lightweight cotton suit with fresh floral print, perfect for summer.", fabric: "Cotton", colors: ["Sky Blue", "Pink"], sizes: ["S", "M", "L"], isNewArrival: true, isTrending: false, onSale: false, images: ["https://picsum.photos/seed/spring/400/500", "https://picsum.photos/seed/spring2/400/500", "https://picsum.photos/seed/spring3/400/500"] },
  { id: 110, name: "Zara Linen Kurti", category: "Cotton", price: 4100, description: "Premium linen kurta with detailed neck work.", fabric: "Linen", colors: ["Coral", "Aqua"], sizes: ["36", "38", "40", "42", "44", "46"], isNewArrival: false, isTrending: true, onSale: false, images: ["https://picsum.photos/seed/zara/400/500", "https://picsum.photos/seed/zara2/400/500", "https://picsum.photos/seed/zara3/400/500"] },
];

// Data copied from frontend assets.ts and hooks/useStore.ts
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
  onlinePaymentInfo: 'Payment Number: test\n<b>01909285883</b> (Personal)',
  onlinePaymentInfoStyles: {
    fontSize: '0.875rem', // 14px, matching text-sm
  },
  codEnabled: true,
  onlinePaymentEnabled: true,
  onlinePaymentMethods: ['Bkash', 'Nagad', 'UPAY'],
  sliderImages: [
    { id: 1, title: "The Festive Silk Collection", subtitle: "Elegance and shimmer for every occasion. | New Silk Collection", color: "text-pink-600", image: SLIDER_IMAGE_URLS.silk, mobileImage: SLIDER_MOBILE_IMAGE_URLS.silk },
    { id: 2, title: "Comfortable Lawn Arrivals", subtitle: "Breathe easy with our new cotton designs. | Comfortable Lawn Attire", color: "text-blue-600", image: SLIDER_IMAGE_URLS.lawn, mobileImage: SLIDER_MOBILE_IMAGE_URLS.lawn },
    { id: 3, title: "Grand Party Wear", subtitle: "Unveil the ultimate glamour this season. | Grand Party Dress", color: "text-purple-600", image: SLIDER_IMAGE_URLS.party, mobileImage: SLIDER_MOBILE_IMAGE_URLS.party }
  ],
  categoryImages: [
    { categoryName: "Cotton", image: CATEGORY_IMAGE_URLS.cotton },
    { categoryName: "Silk", image: CATEGORY_IMAGE_URLS.silk },
    { categoryName: "Party Wear", image: CATEGORY_IMAGE_URLS.partyWear }
  ],
  categories: ["Cotton", "Silk", "Party Wear"],
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
Welcome to SAZO. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.

2. Information We Collect
We may collect personal information from you such as your name, shipping address, email address, and telephone number when you place an order. We also collect non-personal information, such as browser type, operating system, and web pages visited to help us manage our website.

3. Use of Your Information
Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
- Create and manage your account.
- Process your transactions and send you related information, including purchase confirmations and invoices.
- Improve our website and offerings.
- Respond to your comments and questions and provide customer service.

4. Security of Your Information
We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.

5. Contact Us
If you have questions or comments about this Privacy Policy, please contact us at {{CONTACT_EMAIL}}.
  `.trim(),
  adminEmail: 'admin@sazo.com',
  adminPassword: 'password123',
  footerDescription: 'Discover elegance and style with SAZO. We bring you the finest collections of women\'s wear, crafted with passion and precision for the modern woman.',
};