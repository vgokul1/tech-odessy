import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// @desc    Submit a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, rating (1-5), and review comment are required',
      });
    }

    const booking = await Booking.findById(bookingId).populate('equipment');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer who booked this equipment can review it',
      });
    }

    if (booking.status !== 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the rental has been completed and returned',
      });
    }

    if (booking.hasReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this rental',
      });
    }

    const review = await Review.create({
      booking: booking._id,
      equipment: booking.equipment._id,
      customer: req.user.id,
      rating: Number(rating),
      comment,
    });

    booking.hasReviewed = true;
    await booking.save();

    // Notify owner
    await Notification.create({
      recipient: booking.owner,
      title: 'New Review Received',
      message: `${req.user.name} rated "${booking.equipment.title}" ${rating} stars.`,
      type: 'review',
      link: `/equipment/${booking.equipment._id}`,
    });

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for specific equipment
// @route   GET /api/reviews/equipment/:equipmentId
// @access  Public
export const getEquipmentReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ equipment: req.params.equipmentId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner response to review
// @route   PUT /api/reviews/:id/respond
// @access  Private (Owner / Admin)
export const respondToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id).populate('equipment');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (
      review.equipment.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the equipment owner can respond to this review',
      });
    }

    review.ownerResponse = {
      comment,
      respondedAt: new Date(),
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response posted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};
