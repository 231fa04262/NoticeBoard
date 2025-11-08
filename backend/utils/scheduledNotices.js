const Notice = require('../models/Notice');
const User = require('../models/User');
const { sendBulkNoticeEmails } = require('./emailService');

// Check and publish scheduled notices
const checkScheduledNotices = async (io) => {
  try {
    const now = new Date();
    const scheduledNotices = await Notice.find({
      scheduledDate: { $lte: now },
      isPublished: false
    }).populate('author', 'name email');

    for (const notice of scheduledNotices) {
      notice.isPublished = true;
      notice.publishedAt = now;
      await notice.save();

      // Emit real-time notification
      io.emit('new-notice', {
        notice: notice,
        message: 'A new scheduled notice has been published'
      });

      // Send email notifications
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
        console.error('Error sending email notifications for scheduled notice:', error);
      }
    }

    if (scheduledNotices.length > 0) {
      console.log(`Published ${scheduledNotices.length} scheduled notice(s)`);
    }
  } catch (error) {
    console.error('Error checking scheduled notices:', error);
  }
};

// Run check every minute
const startScheduledNoticesChecker = (io) => {
  // Check immediately on startup
  checkScheduledNotices(io);
  
  // Then check every minute
  setInterval(() => {
    checkScheduledNotices(io);
  }, 60000); // 60000ms = 1 minute
};

module.exports = { startScheduledNoticesChecker };

