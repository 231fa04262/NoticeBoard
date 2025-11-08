const express = require('express');
const router = express.Router();
const {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
  archiveNotice,
  addComment,
  acknowledgeNotice
} = require('../controllers/noticeController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Get all notices (filtered by role)
router.get('/', getNotices);

// Get single notice
router.get('/:id', getNoticeById);

// Create notice (Faculty and Admin)
router.post('/', authorize('admin', 'faculty'), upload.array('attachments', 5), createNotice);

// Update notice
router.put('/:id', upload.array('attachments', 5), updateNotice);

// Delete notice
router.delete('/:id', deleteNotice);

// Archive notice (Admin only)
router.patch('/:id/archive', authorize('admin'), archiveNotice);

// Add comment
router.post('/:id/comment', addComment);

// Acknowledge notice
router.post('/:id/acknowledge', acknowledgeNotice);

module.exports = router;

