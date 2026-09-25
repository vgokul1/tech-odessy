import mongoose from 'mongoose';

const statusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'returned', 'cancelled', 'rejected'],
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      default: () => 'RHB-' + Math.floor(100000 + Math.random() * 900000),
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide rental start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide rental end date'],
    },
    rentalDays: {
      type: Number,
      required: true,
      min: [1, 'Rental must be at least 1 day'],
    },
    dailyRate: {
      type: Number,
      required: true,
    },
    equipmentSubtotal: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
      default: 0,
    },
    serviceFee: {
      type: Number,
      required: true,
      default: 15,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'returned', 'cancelled', 'rejected'],
      default: 'pending',
    },
    deliveryOption: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'paid',
    },
    customerNotes: {
      type: String,
      default: '',
    },
    ownerNotes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    statusTimeline: [statusTimelineSchema],
    hasReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Populate statusTimeline initially on creation
bookingSchema.pre('save', function (next) {
  if (this.isNew && (!this.statusTimeline || this.statusTimeline.length === 0)) {
    this.statusTimeline = [
      {
        status: this.status || 'pending',
        updatedAt: new Date(),
        notes: 'Booking requested by customer',
      },
    ];
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
