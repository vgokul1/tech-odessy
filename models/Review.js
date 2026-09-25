import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per booking
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
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please enter a review description'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    ownerResponse: {
      comment: { type: String, default: '' },
      respondedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Static method to recalculate equipment average rating
reviewSchema.statics.getAverageRating = async function (equipmentId) {
  const stats = await this.aggregate([
    { $match: { equipment: equipmentId } },
    {
      $group: {
        _id: '$equipment',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Equipment').findByIdAndUpdate(equipmentId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews,
      });
    } else {
      await mongoose.model('Equipment').findByIdAndUpdate(equipmentId, {
        rating: 5.0,
        numReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error updating equipment average rating:', err);
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.equipment);
});

reviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.equipment);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
