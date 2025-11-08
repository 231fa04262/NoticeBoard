const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['academics', 'events', 'exams', 'circulars', 'placement', 'general'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetAudience: {
    type: {
      roles: [{
        type: String,
        enum: ['admin', 'faculty', 'student']
      }],
      departments: [String],
      years: [String],
      courses: [String],
      isGlobal: {
        type: Boolean,
        default: false
      }
    },
    required: true
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    fileType: String,
    size: Number
  }],
  scheduledDate: {
    type: Date
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  viewCount: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  acknowledgments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
noticeSchema.index({ publishedAt: -1 });
noticeSchema.index({ category: 1 });
noticeSchema.index({ 'targetAudience.isGlobal': 1 });
noticeSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Notice', noticeSchema);

