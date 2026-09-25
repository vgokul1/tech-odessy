import mongoose from 'mongoose';

const specItemSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
});

const blockedDateSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: 'Maintenance / Reserved' },
});

const equipmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add equipment title'],
      trim: true,
      maxlength: [120, 'Title cannot be more than 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a comprehensive description'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please associate with a category'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dailyRate: {
      type: Number,
      required: [true, 'Please specify a daily rental rate'],
      min: [1, 'Daily rate must be at least 1'],
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Please specify security deposit amount'],
      default: 100,
    },
    condition: {
      type: String,
      enum: ['Like New', 'Excellent', 'Good', 'Fair'],
      default: 'Excellent',
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, required: true, default: 'Austin' },
      state: { type: String, required: true, default: 'TX' },
      zipCode: { type: String, default: '78701' },
    },
    specs: [specItemSchema],
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one equipment image is required',
      },
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      blockedDates: [blockedDateSchema],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    totalRentals: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'draft'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for reviews
equipmentSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'equipment',
  justOne: false,
});

equipmentSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;
