const express = require('express');
const router = express.Router();
const {
  markLectureComplete,
  markLectureIncomplete,
  getEnrollmentProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are student-only
router.post('/mark-complete', protect, authorize('student'), markLectureComplete);
router.post('/mark-incomplete', protect, authorize('student'), markLectureIncomplete);
router.get('/:enrollmentId', protect, authorize('student'), getEnrollmentProgress);

module.exports = router;
