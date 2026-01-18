const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  togglePublishCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Import nested routes
const sectionRoutes = require('./sectionRoutes');
const lectureRoutes = require('./lectureRoutes');

// Nested routes
router.use('/:courseId/sections', sectionRoutes);
router.use('/:courseId/sections/:sectionId/lectures', lectureRoutes);

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Instructor routes
router.post('/', protect, authorize('instructor'), createCourse);
router.get('/instructor/my-courses', protect, authorize('instructor'), getMyCourses);
router.put('/:id', protect, authorize('instructor'), updateCourse);
router.patch('/:id/publish', protect, authorize('instructor'), togglePublishCourse);
router.delete('/:id', protect, authorize('instructor'), deleteCourse);

module.exports = router;
