const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
// const { sendEventRegistrationEmail, sendEventCancellationEmail } = require('../utils/emailService');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', auth, upload.single('bannerImage'), [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be in HH:MM format'),
  body('location').trim().isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
  body('visibility').isIn(['public', 'private']).withMessage('Visibility must be either public or private'),
  body('category').optional().isIn(['conference', 'workshop', 'social', 'sports', 'cultural', 'other'])
], async (req, res) => {
  try {
    console.log('Event creation request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request user ID:', req.userId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation errors',
        errors: errors.array() 
      });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ 
        success: false,
        message: 'Banner image is required' 
      });
    }

    const { title, description, date, time, location, visibility, category, maxAttendees, tags } = req.body;

    console.log('Creating event with data:', { title, description, date, time, location, visibility, category, maxAttendees, tags });

    // Create event
    const event = new Event({
      title,
      description,
      date: new Date(date),
      time,
      location,
      bannerImage: `/uploads/${req.file.filename}`,
      visibility,
      category: category || 'other',
      organizer: req.userId,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    });

    console.log('Event object created:', event);

    await event.save();
    await event.populate('organizer', 'name email');

    console.log('Event saved successfully');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating event',
      error: error.message 
    });
  }
});

// @route   GET /api/events
// @desc    Get all public events (with search and filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      location,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { visibility: 'public', status: 'upcoming' };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
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
    console.error('Get events error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching events' 
    });
  }
});

// @route   GET /api/events/my-events
// @desc    Get current user's events
// @access  Private
router.get('/my-events', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { organizer: req.userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
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
          totalEvents: total
        }
      }
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching your events' 
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public (for public events) / Private (for private events)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');

    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check if private event and user is not the organizer
    if (event.visibility === 'private') {
      const authHeader = req.header('Authorization');
      if (!authHeader) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. This is a private event.' 
        });
      }

      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (event.organizer._id.toString() !== decoded.userId) {
          return res.status(403).json({ 
            success: false,
            message: 'Access denied. This is a private event.' 
          });
        }
      } catch (error) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. This is a private event.' 
        });
      }
    }

    res.json({
      success: true,
      data: { event }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching event' 
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (only organizer)
router.put('/:id', auth, upload.single('bannerImage'), [
  body('title').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('location').optional().trim().isLength({ min: 2, max: 200 }),
  body('visibility').optional().isIn(['public', 'private']),
  body('category').optional().isIn(['conference', 'workshop', 'social', 'sports', 'cultural', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation errors',
        errors: errors.array() 
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only edit your own events.' 
      });
    }

    // Update fields
    const updates = ['title', 'description', 'date', 'time', 'location', 'visibility', 'category', 'maxAttendees', 'tags'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          event[field] = new Date(req.body[field]);
        } else if (field === 'tags') {
          event[field] = req.body[field].split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (field === 'maxAttendees') {
          event[field] = req.body[field] ? parseInt(req.body[field]) : null;
        } else {
          event[field] = req.body[field];
        }
      }
    });

    // Update image if new one uploaded
    if (req.file) {
      event.bannerImage = `/uploads/${req.file.filename}`;
    }

    await event.save();
    await event.populate('organizer', 'name email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating event' 
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (only organizer)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendees.user');
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only delete your own events.' 
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

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check if event is public
    if (event.visibility !== 'public') {
      return res.status(403).json({ 
        success: false,
        message: 'Cannot register for private events' 
      });
    }

    // Check if user is already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === req.userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already registered for this event' 
      });
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ 
        success: false,
        message: 'Event is full' 
      });
    }

    // Add user to attendees
    event.attendees.push({ user: req.userId });
    await event.save();

    // Get user details for email
    const user = await User.findById(req.userId);
    
    // Send registration confirmation email
    try {
      // await sendEventRegistrationEmail(
      //   user.email, 
      //   user.name, 
      //   event.title, 
      //   event.date, 
      //   event.location
      // );
      console.log('Registration email would be sent to:', user.email);
    } catch (emailError) {
      console.error('Registration email failed:', emailError);
      // Continue with registration even if email fails
    }

    res.json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error registering for event' 
    });
  }
});

// @route   DELETE /api/events/:id/unregister
// @desc    Unregister from an event
// @access  Private
router.delete('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== req.userId
    );
    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error unregistering from event' 
    });
  }
});

module.exports = router;
