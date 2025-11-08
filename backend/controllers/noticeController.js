const Notice = require('../models/Notice');
const User = require('../models/User');
const { sendBulkNoticeEmails } = require('../utils/emailService');

// Create Notice
exports.createNotice = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { title, content, category, priority, targetAudience, scheduledDate, expiresAt } = req.body;
    
    // Debug logging
    console.log('Creating notice with data:', { title, content, category, priority, targetAudience: typeof targetAudience });

    // Parse targetAudience if it's a JSON string
    let parsedTargetAudience = { isGlobal: true, roles: [], departments: [], years: [], courses: [] };
    if (targetAudience) {
      try {
        parsedTargetAudience = typeof targetAudience === 'string' ? JSON.parse(targetAudience) : targetAudience;
      } catch (e) {
        console.error('Error parsing targetAudience:', e);
        parsedTargetAudience = { isGlobal: true, roles: [], departments: [], years: [], courses: [] };
      }
    }

    const attachments = [];
    if (req.files) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          fileType: file.mimetype,
          size: file.size
        });
      });
    }

    const noticeData = {
      title,
      content,
      category: category || 'general',
      priority: priority || 'medium',
      author: req.user.id,
      targetAudience: parsedTargetAudience,
      attachments,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPublished: !scheduledDate || new Date(scheduledDate) <= new Date()
    };

    const notice = new Notice(noticeData);
    await notice.save();

    // Populate author details
    await notice.populate('author', 'name email role');

    console.log('Notice created successfully:', notice._id);

    // Emit real-time notification if published immediately
    if (notice.isPublished) {
      io.emit('new-notice', {
        notice: notice,
        message: 'A new notice has been posted'
      });

      // Send email notifications to target users
      try {
        let targetUsers = [];
        if (notice.targetAudience.isGlobal) {
          targetUsers = await User.find({ isActive: true });
        } else {
          const query = { isActive: true };
          if (notice.targetAudience.roles.length > 0) {
            query.role = { $in: notice.targetAudience.roles };
          }
          if (notice.targetAudience.departments.length > 0) {
            query.department = { $in: notice.targetAudience.departments };
          }
          if (notice.targetAudience.years.length > 0) {
            query.year = { $in: notice.targetAudience.years };
          }
          if (notice.targetAudience.courses.length > 0) {
            query.course = { $in: notice.targetAudience.courses };
          }
          targetUsers = await User.find(query);
        }
        
        if (targetUsers.length > 0) {
          sendBulkNoticeEmails(targetUsers, notice);
        }
      } catch (error) {
        console.error('Error sending email notifications:', error);
      }
    }

    res.status(201).json({ success: true, notice });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Notices (with filtering)
exports.getNotices = async (req, res) => {
  try {
    const { 
      category, 
      startDate, 
      endDate, 
      department, 
      year, 
      course, 
      isArchived,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.$or = [
        { 'targetAudience.isGlobal': true },
        { 'targetAudience.roles': { $in: ['student'] } },
        { 'targetAudience.departments': { $in: [req.user.department] } },
        { 'targetAudience.years': { $in: [req.user.year] } },
        { 'targetAudience.courses': { $in: [req.user.course] } }
      ];
    } else if (req.user.role === 'faculty') {
      query.$or = [
        { 'targetAudience.isGlobal': true },
        { 'targetAudience.roles': { $in: ['faculty'] } },
        { 'targetAudience.departments': { $in: [req.user.department] } }
      ];
    }

    // Admin can see all notices
    if (req.user.role === 'admin') {
      delete query.$or;
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Date range filter (for admin)
    if (startDate || endDate) {
      query.publishedAt = {};
      if (startDate) {
        query.publishedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.publishedAt.$lte = new Date(endDate);
      }
    }

    // Department filter
    if (department) {
      query['targetAudience.departments'] = { $in: [department] };
    }

    // Year filter
    if (year) {
      query['targetAudience.years'] = { $in: [year] };
    }

    // Course filter
    if (course) {
      query['targetAudience.courses'] = { $in: [course] };
    }

    // Archive filter
    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true';
    } else {
      query.isArchived = false;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    query.isPublished = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notices = await Notice.find(query)
      .populate('author', 'name email role department')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      success: true,
      notices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Single Notice
exports.getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('author', 'name email role department')
      .populate('comments.userId', 'name email role')
      .populate('viewCount.userId', 'name email');

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Track view
    const hasViewed = notice.viewCount.some(
      view => view.userId.toString() === req.user.id.toString()
    );

    if (!hasViewed) {
      notice.viewCount.push({ userId: req.user.id });
      notice.views += 1;
      await notice.save();
    }

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Notice
exports.updateNotice = async (req, res) => {
  try {
    const { title, content, category, priority, targetAudience, scheduledDate, expiresAt, isPublished } = req.body;

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && notice.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this notice' });
    }

    // Parse targetAudience if it's a JSON string
    let parsedTargetAudience = notice.targetAudience;
    if (targetAudience) {
      try {
        parsedTargetAudience = typeof targetAudience === 'string' ? JSON.parse(targetAudience) : targetAudience;
      } catch (e) {
        console.error('Error parsing targetAudience:', e);
        parsedTargetAudience = notice.targetAudience;
      }
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        notice.attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          fileType: file.mimetype,
          size: file.size
        });
      });
    }

    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.category = category || notice.category;
    notice.priority = priority || notice.priority;
    notice.targetAudience = parsedTargetAudience;
    notice.scheduledDate = scheduledDate ? new Date(scheduledDate) : notice.scheduledDate;
    notice.expiresAt = expiresAt ? new Date(expiresAt) : notice.expiresAt;
    
    if (req.user.role === 'admin') {
      notice.isPublished = isPublished !== undefined ? isPublished : notice.isPublished;
    }

    await notice.save();
    await notice.populate('author', 'name email role');

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Notice
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && notice.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notice' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Archive/Unarchive Notice
exports.archiveNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can archive notices' });
    }

    notice.isArchived = !notice.isArchived;
    await notice.save();

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    notice.comments.push({
      userId: req.user.id,
      comment
    });

    await notice.save();
    await notice.populate('comments.userId', 'name email role');

    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Acknowledge Notice
exports.acknowledgeNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    const hasAcknowledged = notice.acknowledgments.some(
      ack => ack.userId.toString() === req.user.id.toString()
    );

    if (!hasAcknowledged) {
      notice.acknowledgments.push({ userId: req.user.id });
      await notice.save();
    }

    res.json({ success: true, message: 'Notice acknowledged' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

