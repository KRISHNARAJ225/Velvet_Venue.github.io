const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
// const { sendEventCancellationEmail } = require('../utils/emailService');

const router = express.Router();

// Admin middleware - check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// @route   GET /api/admin/events
// @desc    Get all events (admin only)
// @access  Private (Admin only)
router.get('/events', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching events' 
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    // Get event counts for each user
    const usersWithEventCounts = await Promise.all(
      users.map(async (user) => {
        const eventCount = await Event.countDocuments({ organizer: user._id });
        return {
          ...user.toObject(),
          eventCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithEventCounts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching users' 
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get platform statistics (admin only)
// @access  Private (Admin only)
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      upcomingEvents,
      completedEvents,
      publicEvents,
      privateEvents,
      totalAttendees,
      usersByRole
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Event.countDocuments({ status: 'completed' }),
      Event.countDocuments({ visibility: 'public' }),
      Event.countDocuments({ visibility: 'private' }),
      Event.aggregate([
        { $unwind: '$attendees' },
        { $count: 'totalAttendees' }
      ]).then(result => result[0]?.totalAttendees || 0),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ])
    ]);

    // Recent events
    const recentEvents = await Event.find()
      .populate('organizer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Popular events (by attendees)
    const popularEvents = await Event.find()
      .populate('organizer', 'name')
      .sort({ 'attendees.length': -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEvents,
          upcomingEvents,
          completedEvents,
          publicEvents,
          privateEvents,
          totalAttendees
        },
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentEvents,
        popularEvents
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching statistics' 
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin only)
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role. Must be user or admin.' 
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.userId) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot change your own role.' 
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating user role' 
    });
  }
});

// @route   DELETE /api/admin/events/:id
// @desc    Delete any event (admin only)
// @access  Private (Admin only)
router.delete('/events/:id', auth, adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendees.user');
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Send cancellation emails to all registered attendees
    const emailPromises = event.attendees.map(attendee => {
      // return sendEventCancellationEmail(
      //   attendee.user.email, 
      //   attendee.user.name, 
      //   event.title
      // );
      console.log('Cancellation email would be sent to:', attendee.user.email);
      return Promise.resolve();
    });

    // Send emails asynchronously (don't wait for completion)
    Promise.allSettled(emailPromises).catch(error => {
      console.error('Some cancellation emails failed:', error);
    });

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting event' 
    });
  }
});

module.exports = router;
