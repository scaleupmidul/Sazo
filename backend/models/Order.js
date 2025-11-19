import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  // Using the original product ID from the Product model.
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  size: { type: String, required: true },
}, { _id: false });

const PaymentDetailsSchema = new mongoose.Schema({
  paymentNumber: String,
  method: String,
  amount: Number,
  transactionId: String,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true }, // 5-7 digit unique ID
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String }, // Not required, as it depends on settings
  cartItems: [CartItemSchema],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  date: { type: String, required: true },
  paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
  paymentDetails: PaymentDetailsSchema,
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

// To match the frontend's string-based ID, which was previously a timestamp.
OrderSchema.virtual('id').get(function() {
  return this._id.toString();
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
