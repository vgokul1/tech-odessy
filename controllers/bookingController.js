const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Notification = require('../models/Notification');

// @desc    Create a new booking with double-booking collision prevention
// @route   POST /api/bookings
// @access  Private/Customer (or any logged in user)
exports.createBooking = async (req, res, next) => {
  try {
    const { equipmentId, startDate, endDate, deliveryMethod, deliveryAddress, notes } = req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide equipmentId, startDate, and endDate',
      });
    }

    const equipment = await Equipment.findById(equipmentId).populate('owner', 'name email');
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (!equipment.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This equipment is currently marked as unavailable for rental',
      });
    }

    // Prevent owner from booking their own equipment
    if (equipment.owner._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rent your own equipment listing',
      });
    }

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestedStart < today) {
      return res.status(400).json({
        success: false,
        message: 'Rental start date cannot be in the past',
      });
    }

    if (requestedStart >= requestedEnd) {
      return res.status(400).json({
        success: false,
        message: 'Rental end date must be after the start date',
      });
    }

    // Check for conflicting bookings (double-booking prevention)
    // Conflicting booking exists if: (existingStart < requestedEnd) AND (existingEnd > requestedStart)
    const conflictingBookings = await Booking.find({
      equipment: equipment._id,
      status: { $in: ['pending', 'confirmed', 'active'] },
      startDate: { $lt: requestedEnd },
      endDate: { $gt: requestedStart },
    });

    if (conflictingBookings.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Equipment is already reserved or booked for the selected date range. Please choose different dates.',
      });
    }

    // Check for owner blocked dates
    if (equipment.blockedDates && equipment.blockedDates.length > 0) {
      const hasBlockedConflict = equipment.blockedDates.some((b) => {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        return requestedStart < bEnd && requestedEnd > bStart;
      });

      if (hasBlockedConflict) {
        return res.status(409).json({
          success: false,
          message: 'Equipment has been blocked by the owner for maintenance or private use during these dates.',
        });
      }
    }

    // Calculate days and amounts
    const diffTime = Math.abs(requestedEnd - requestedStart);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const dailyRate = equipment.dailyRate;
    const rentAmount = totalDays * dailyRate;
    const securityDeposit = equipment.securityDeposit || 0;
    const totalAmount = rentAmount + securityDeposit;

    const booking = await Booking.create({
      equipment: equipment._id,
      customer: req.user.id,
      owner: equipment.owner._id,
      startDate: requestedStart,
      endDate: requestedEnd,
      totalDays,
      dailyRate,
      rentAmount,
      securityDeposit,
      totalAmount,
      status: 'pending',
      deliveryMethod: deliveryMethod || 'pickup',
      deliveryAddress: deliveryAddress || '',
      notes: notes || '',
    });

    // Notify the equipment owner
    await Notification.create({
      recipient: equipment.owner._id,
      sender: req.user.id,
      title: 'New Booking Request',
      message: `${req.user.name} requested to rent "${equipment.title}" for ${totalDays} day(s) ($${totalAmount}).`,
      type: 'booking',
      link: `/owner/bookings`,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('equipment', 'title images dailyRate securityDeposit location')
      .populate('owner', 'name email phone companyName')
      .populate('customer', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking request placed successfully! Awaiting owner confirmation.',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's bookings
// @route   GET /api/bookings/customer
// @access  Private
exports.getCustomerBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { customer: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('equipment', 'title images dailyRate location condition category rating numReviews')
      .populate('owner', 'name email phone companyName avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's bookings for their equipment
// @route   GET /api/bookings/owner
// @access  Private/Owner
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { owner: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('equipment', 'title images dailyRate location condition')
      .populate('customer', 'name email phone avatar address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('equipment')
      .populate('customer', 'name email phone avatar address')
      .populate('owner', 'name email phone companyName avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: must be customer, owner, or admin
    const userId = req.user.id;
    const isCustomer = booking.customer._id.toString() === userId;
    const isOwner = booking.owner._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (confirm, reject, activate, return)
// @route   PUT /api/bookings/:id/status
// @access  Private/Owner or Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['pending', 'confirmed', 'active', 'returned', 'rejected', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('equipment', 'title')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to change booking status' });
    }

    booking.status = status;
    if (reason) {
      booking.cancellationReason = reason;
    }

    await booking.save();

    // Create notification for the customer
    let statusText = status.toUpperCase();
    let msg = `Your booking for "${booking.equipment.title}" has been updated to "${status}".`;
    if (status === 'confirmed') msg = `Great news! Your booking for "${booking.equipment.title}" has been CONFIRMED.`;
    if (status === 'active') msg = `Rental is now ACTIVE for "${booking.equipment.title}". Enjoy your equipment!`;
    if (status === 'returned') msg = `Equipment "${booking.equipment.title}" has been marked RETURNED. Don't forget to leave a review!`;
    if (status === 'rejected') msg = `Your booking request for "${booking.equipment.title}" was declined: ${reason || 'Owner unavailable'}.`;

    await Notification.create({
      recipient: booking.customer._id,
      sender: req.user.id,
      title: `Booking ${statusText}`,
      message: msg,
      type: 'status',
      link: `/dashboard`,
    });

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (by Customer)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('equipment', 'title');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isCustomer = booking.customer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking' });
    }

    if (booking.status === 'active' || booking.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an active or completed rental',
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    await booking.save();

    // Notify the equipment owner
    await Notification.create({
      recipient: booking.owner,
      sender: req.user.id,
      title: 'Booking Cancelled',
      message: `${req.user.name} cancelled the reservation for "${booking.equipment.title}". Reason: ${reason || 'Not specified'}`,
      type: 'status',
      link: `/owner/bookings`,
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
