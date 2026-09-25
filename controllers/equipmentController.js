import Equipment from '../models/Equipment.js';
import Booking from '../models/Booking.js';
import Category from '../models/Category.js';

// @desc    Get all equipment with search, filters, sorting & pagination
// @route   GET /api/equipment
// @access  Public
export const getEquipment = async (req, res, next) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      city,
      featured,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = { status: 'active' };

    // Search query on title, description, and location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      // Find category by slug or id
      const catDoc = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { slug: category }],
      });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }

    // Condition filter
    if (condition) {
      query.condition = condition;
    }

    // City filter
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') sortOptions = { dailyRate: 1 };
    else if (sort === 'price-desc') sortOptions = { dailyRate: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1, numReviews: -1 };
    else if (sort === 'popular') sortOptions = { totalRentals: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Equipment.countDocuments(query);
    const equipment = await Equipment.find(query)
      .populate('category', 'name slug icon')
      .populate('owner', 'name companyName avatar phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: equipment.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      equipment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single equipment by ID or slug with reviews and booked dates
// @route   GET /api/equipment/:id
// @access  Public
export const getSingleEquipment = async (req, res, next) => {
  try {
    const isId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: req.params.id } : { slug: req.params.id };

    const equipment = await Equipment.findOne(query)
      .populate('category', 'name slug icon description')
      .populate('owner', 'name companyName avatar phone email address createdAt')
      .populate({
        path: 'reviews',
        populate: { path: 'customer', select: 'name avatar' },
        options: { sort: { createdAt: -1 } },
      });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment listing not found',
      });
    }

    // Fetch active/confirmed bookings to prevent double-booking on UI calendar
    const activeBookings = await Booking.find({
      equipment: equipment._id,
      status: { $in: ['pending', 'confirmed', 'active'] },
      endDate: { $gte: new Date() },
    }).select('startDate endDate status');

    res.status(200).json({
      success: true,
      equipment,
      bookedDates: activeBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check equipment date range availability
// @route   POST /api/equipment/:id/check-availability
// @access  Public
export const checkEquipmentAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const equipmentId = req.params.id;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both start and end rental dates',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be prior to start date',
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (!equipment.availability.isAvailable || equipment.status !== 'active') {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        reason: 'This equipment listing is currently inactive or under maintenance.',
      });
    }

    // Check manual owner blocked dates
    const isManuallyBlocked = equipment.availability.blockedDates.some((b) => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return start <= bEnd && end >= bStart;
    });

    if (isManuallyBlocked) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        reason: 'The selected dates clash with owner reserved/maintenance schedule.',
      });
    }

    // Check conflicting bookings
    const conflictingBooking = await Booking.findOne({
      equipment: equipmentId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (conflictingBooking) {
      return res.status(200).json({
        success: true,
        isAvailable: false,
        reason: 'Selected dates conflict with an existing active or confirmed booking.',
      });
    }

    // Calculate rental metrics
    const diffTime = Math.abs(end - start);
    const rentalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const subtotal = rentalDays * equipment.dailyRate;
    const serviceFee = 15;
    const total = subtotal + equipment.securityDeposit + serviceFee;

    res.status(200).json({
      success: true,
      isAvailable: true,
      calculation: {
        rentalDays,
        dailyRate: equipment.dailyRate,
        subtotal,
        securityDeposit: equipment.securityDeposit,
        serviceFee,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new equipment listing
// @route   POST /api/equipment
// @access  Private (Owner / Admin)
export const createEquipment = async (req, res, next) => {
  try {
    const equipmentData = {
      ...req.body,
      owner: req.user.id,
    };

    const equipment = await Equipment.create(equipmentData);

    res.status(201).json({
      success: true,
      message: 'Equipment listing created successfully',
      equipment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update equipment listing
// @route   PUT /api/equipment/:id
// @access  Private (Owner / Admin)
export const updateEquipment = async (req, res, next) => {
  try {
    let equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    // Ensure user is equipment owner or admin
    if (equipment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing',
      });
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Equipment listing updated successfully',
      equipment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete equipment listing
// @route   DELETE /api/equipment/:id
// @access  Private (Owner / Admin)
export const deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (equipment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing',
      });
    }

    // Check if active bookings exist
    const hasActiveBookings = await Booking.findOne({
      equipment: req.params.id,
      status: { $in: ['pending', 'confirmed', 'active'] },
    });

    if (hasActiveBookings) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete equipment that has pending or active rentals',
      });
    }

    await equipment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Equipment listing removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current owner's equipment inventory
// @route   GET /api/equipment/owner/me
// @access  Private (Owner / Admin)
export const getOwnerEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.find({ owner: req.user.id })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: equipment.length,
      equipment,
    });
  } catch (error) {
    next(error);
  }
};
