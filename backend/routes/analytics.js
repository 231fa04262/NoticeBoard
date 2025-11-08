const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get analytics (Admin only)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.publishedAt = {};
      if (startDate) dateFilter.publishedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.publishedAt.$lte = new Date(endDate);
    }

    // Total notices
    const totalNotices = await Notice.countDocuments(dateFilter);

    // Notices by category
    const noticesByCategory = await Notice.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Notices by priority
    const noticesByPriority = await Notice.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Top viewed notices
    const topViewedNotices = await Notice.find(dateFilter)
      .populate('author', 'name email')
      .sort({ views: -1 })
      .limit(10)
      .select('title views publishedAt category');

    // Total views
    const totalViews = await Notice.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    // Total users
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Recent notices
    const recentNotices = await Notice.find(dateFilter)
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('title publishedAt category views');

    res.json({
      success: true,
      analytics: {
        totalNotices,
        totalViews: totalViews[0]?.totalViews || 0,
        totalUsers,
        noticesByCategory,
        noticesByPriority,
        usersByRole,
        topViewedNotices,
        recentNotices
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

