const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Category = require('../models/Category');

// @desc    Get system-wide platform statistics and metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    
    const totalEquipment = await Equipment.countDocuments();
    const availableEquipment = await Equipment.countDocuments({ isAvailable: true });
    const totalCategories = await Category.countDocuments();

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const activeBookings = await Booking.countDocuments({ status: 'active' });
    const completedBookings = await Booking.countDocuments({ status: 'returned' });

    // Financial totals (Gross volume & platform fee estimation)
    const paidBookings = await Booking.find({ status: { $in: ['confirmed', 'active', 'returned'] } });
    const grossVolume = paidBookings.reduce((sum, b) => sum + (b.rentAmount || 0), 0);
    const platformRevenue = Math.round(grossVolume * 0.10); // 10% platform take rate

    // Recent activity
    const recentBookings = await Booking.find()
      .populate('equipment', 'title')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          owners: totalOwners,
        },
        equipment: {
          total: totalEquipment,
          available: availableEquipment,
          categories: totalCategories,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          active: activeBookings,
          completed: completedBookings,
        },
        financials: {
          grossVolume,
          platformRevenue,
        },
        recentBookings,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and role filtering
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate/deactivate) or role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deactivating own admin account
    if (user._id.toString() === req.user.id && isActive === false) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform equipment (including unlisted/inactive)
// @route   GET /api/admin/equipment
// @access  Private/Admin
exports.getAllEquipmentAdmin = async (req, res, next) => {
  try {
    const equipments = await Equipment.find()
      .populate('category', 'name')
      .populate('owner', 'name email companyName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: equipments.length, data: equipments });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle equipment featured status or availability
// @route   PUT /api/admin/equipment/:id/toggle
// @access  Private/Admin
exports.toggleEquipmentAdmin = async (req, res, next) => {
  try {
    const { isFeatured, isAvailable } = req.body;
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (isFeatured !== undefined) equipment.isFeatured = isFeatured;
    if (isAvailable !== undefined) equipment.isAvailable = isAvailable;

    await equipment.save();

    res.json({ success: true, data: equipment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('equipment', 'title dailyRate')
      .populate('customer', 'name email phone')
      .populate('owner', 'name email companyName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews across platform
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('equipment', 'title')
      .populate('customer', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};
