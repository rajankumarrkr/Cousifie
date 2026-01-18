const Course = require('../models/Course');
const Section = require('../models/Section');
const Lecture = require('../models/Lecture');
const { cloudinary } = require('../utils/cloudinary');

// @desc    Add lecture to section
// @route   POST /api/courses/:courseId/sections/:sectionId/lectures
// @access  Private (Instructor only - own courses)
exports.addLecture = async (req, res) => {
  try {
    const { title, videoUrl, publicId, duration, order } = req.body;
    const { courseId, sectionId } = req.params;

    if (!title || !videoUrl || !publicId) {
      return res.status(400).json({
        success: false,
        message: 'Title, video URL, and public ID are required'
      });
    }

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add lectures to this course'
      });
    }

    // Find section
    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Create lecture
    const lecture = await Lecture.create({
      section: sectionId,
      title,
      videoUrl,
      publicId,
      duration: duration || 0,
      order: order || section.lectures.length + 1
    });

    // Add lecture to section
    section.lectures.push(lecture._id);
    await section.save();

    res.status(201).json({
      success: true,
      message: 'Lecture added successfully',
      data: { lecture }
    });
  } catch (error) {
    console.error('Add lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding lecture',
      error: error.message
    });
  }
};

// @desc    Update lecture
// @route   PUT /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
// @access  Private (Instructor only - own courses)
exports.updateLecture = async (req, res) => {
  try {
    const { title, videoUrl, publicId, duration, order } = req.body;
    const { courseId, lectureId } = req.params;

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lecture'
      });
    }

    // Update lecture
    const lecture = await Lecture.findByIdAndUpdate(
      lectureId,
      { title, videoUrl, publicId, duration, order },
      { new: true, runValidators: true }
    );

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lecture updated successfully',
      data: { lecture }
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lecture',
      error: error.message
    });
  }
};

// @desc    Delete lecture
// @route   DELETE /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
// @access  Private (Instructor only - own courses)
exports.deleteLecture = async (req, res) => {
  try {
    const { courseId, sectionId, lectureId } = req.params;

    // Find course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lecture'
      });
    }

    // Find lecture
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    // Delete video from Cloudinary
    try {
      await cloudinary.uploader.destroy(lecture.publicId, { resource_type: 'video' });
    } catch (cloudError) {
      console.error('Cloudinary deletion error:', cloudError);
    }

    // Remove lecture from section
    const section = await Section.findById(sectionId);
    if (section) {
      section.lectures = section.lectures.filter(
        lec => lec.toString() !== lectureId
      );
      await section.save();
    }

    // Delete lecture
    await lecture.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lecture',
      error: error.message
    });
  }
};
