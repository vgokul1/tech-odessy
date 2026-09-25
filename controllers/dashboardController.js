import Booking from '../models/Booking.js';
import Equipment from '../models/Equipment.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @desc    Get dashboard metrics tailored to current user role
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    if (role === 'customer') {
      const totalBookings = await Booking.countDocuments({ customer: userId });
      const activeRentals = await Booking.countDocuments({
        customer: userId,
        status: 'active',
      });
      const pendingBookings = await Booking.countDocuments({
        customer: userId,
        status: 'pending',
      });
      const completedRentals = await Booking.countDocuments({
        customer: userId,
        status: 'returned',
      });

      const spentAgg = await Booking.aggregate([
        { $match: { customer: userId, status: { $in: ['confirmed', 'active', 'returned'] } } },
        { $group: { _id: null, totalSpent: { $sum: '$totalAmount' } } },
      ]);
      const totalSpent = spentAgg.length > 0 ? spentAgg[0].totalSpent : 0;

      const recentBookings = await Booking.find({ customer: userId })
        .populate('equipment', 'title slug images dailyRate location')
        .populate('owner', 'name companyName phone')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        role: 'customer',
        stats: {
          totalBookings,
          activeRentals,
          pendingBookings,
          completedRentals,
          totalSpent,
        },
        recentBookings,
      });
    }

    if (role === 'owner') {
      const totalListings = await Equipment.countDocuments({ owner: userId });
      const activeListings = await Equipment.countDocuments({
        owner: userId,
        status: 'active',
      });

      const pendingRequests = await Booking.countDocuments({
        owner: userId,
        status: 'pending',
      });
      const activeRentals = await Booking.countDocuments({
        owner: userId,
        status: 'active',
      });
      const completedRentals = await Booking.countDocuments({
        owner: userId,
        status: 'returned',
      });

      const revenueAgg = await Booking.aggregate([
        { $match: { owner: userId, status: { $in: ['confirmed', 'active', 'returned'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$equipmentSubtotal' } } },
      ]);
      const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

      const recentBookings = await Booking.find({ owner: userId })
        .populate('equipment', 'title slug dailyRate images')
        .populate('customer', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        role: 'owner',
        stats: {
          totalListings,
          activeListings,
          pendingRequests,
          activeRentals,
          completedRentals,
          totalRevenue,
        },
        recentBookings,
      });
    }

    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const customerCount = await User.countDocuments({ role: 'customer' });
      const ownerCount = await User.countDocuments({ role: 'owner' });
      const totalEquipment = await Equipment.countDocuments();
      const totalCategories = await Category.countDocuments();
      const totalBookings = await Booking.countDocuments();

      const gmvAgg = await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'active', 'returned'] } } },
        { $group: { _id: null, totalGMV: { $sum: '$totalAmount' } } },
      ]);
      const totalGMV = gmvAgg.length > 0 ? gmvAgg[0].totalGMV : 0;

      const recentBookings = await Booking.find()
        .populate('equipment', 'title slug dailyRate')
        .populate('customer', 'name email')
        .populate('owner', 'name email companyName')
        .sort({ createdAt: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        role: 'admin',
        stats: {
          totalUsers,
          customerCount,
          ownerCount,
          totalEquipment,
          totalCategories,
          totalBookings,
          totalGMV,
        },
        recentBookings,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid role' });
  } catch (error) {
    next(error);
  }
};
