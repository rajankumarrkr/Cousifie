const express = require('express');
const router = express.Router({ mergeParams: true }); // To access courseId from parent route
const {
  addSection,
  updateSection,
  deleteSection
} = require('../controllers/sectionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are instructor-only
router.post('/', protect, authorize('instructor'), addSection);
router.put('/:sectionId', protect, authorize('instructor'), updateSection);
router.delete('/:sectionId', protect, authorize('instructor'), deleteSection);

module.exports = router;
