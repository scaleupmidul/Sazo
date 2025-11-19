import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  fabric: { type: String, required: true },
  colors: [String],
  sizes: [String],
  isNewArrival: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  images: [String],
  displayOrder: { type: Number, default: 1000 }, // Default high number so specifically ordered items come first
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Add indexes for performance optimization
ProductSchema.index({ isNewArrival: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ displayOrder: 1, createdAt: -1 }); // Optimized for our new sort order
ProductSchema.index({ createdAt: -1 });


const Product = mongoose.model('Product', ProductSchema);
export default Product;