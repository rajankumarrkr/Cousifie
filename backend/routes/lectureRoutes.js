const express = require('express');
const router = express.Router({ mergeParams: true }); // To access courseId and sectionId
const {
  addLecture,
  updateLecture,
  deleteLecture
} = require('../controllers/lectureController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are instructor-only
router.post('/', protect, authorize('instructor'), addLecture);
router.put('/:lectureId', protect, authorize('instructor'), updateLecture);
router.delete('/:lectureId', protect, authorize('instructor'), deleteLecture);

module.exports = router;
