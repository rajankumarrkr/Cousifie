const express = require('express');
const router = express.Router();
const { uploadVideo, uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadVideo: uploadVideoMiddleware, uploadImage: uploadImageMiddleware } = require('../utils/cloudinary');

// Protected routes - Instructor only
router.post('/video', protect, authorize('instructor'), uploadVideoMiddleware.single('video'), uploadVideo);
router.post('/image', protect, authorize('instructor'), uploadImageMiddleware.single('image'), uploadImage);

module.exports = router;
