import mongoose from 'mongoose';

const SliderImageSchema = new mongoose.Schema({
  id: Number,
  title: String,
  subtitle: String,
  color: String,
  image: String,
  mobileImage: String,
}, { _id: false });

const CategoryImageSchema = new mongoose.Schema({
  categoryName: String,
  image: String,
}, { _id: false });

const ShippingOptionSchema = new mongoose.Schema({
  id: String,
  label: String,
  charge: Number,
}, { _id: false });

const SocialMediaLinkSchema = new mongoose.Schema({
  platform: String,
  url: String,
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  onlinePaymentInfo: String,
  onlinePaymentInfoStyles: {
    fontSize: String,
  },
  codEnabled: Boolean,
  onlinePaymentEnabled: Boolean,
  onlinePaymentMethods: [String],
  sliderImages: [SliderImageSchema],
  categoryImages: [CategoryImageSchema],
  categories: [String],
  shippingOptions: [ShippingOptionSchema],
  productPagePromoImage: String,
  contactAddress: String,
  contactPhone: String,
  contactEmail: String,
  whatsappNumber: String,
  showWhatsAppButton: Boolean,
  showCityField: Boolean,
  socialMediaLinks: [SocialMediaLinkSchema],
  privacyPolicy: String,
  adminEmail: { type: String, required: true, unique: true },
  adminPassword: { type: String, required: true },
  footerDescription: String,
  homepageNewArrivalsCount: { type: Number, default: 4 },
  homepageTrendingCount: { type: Number, default: 4 },
});

const Settings = mongoose.model('Settings', SettingsSchema);
export default Settings;