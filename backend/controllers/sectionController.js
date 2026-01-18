const Course = require('../models/Course');
const Section = require('../models/Section');
const Lecture = require('../models/Lecture');

// @desc    Add section to course
// @route   POST /api/courses/:courseId/sections
// @access  Private (Instructor only - own courses)
exports.addSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    const { courseId } = req.params;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Section title is required'
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

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add sections to this course'
      });
    }

    // Create section
    const section = await Section.create({
      course: courseId,
      title,
      order: order || course.sections.length + 1
    });

    // Add section to course
    course.sections.push(section._id);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Section added successfully',
      data: { section }
    });
  } catch (error) {
    console.error('Add section error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding section',
      error: error.message
    });
  }
};

// @desc    Update section
// @route   PUT /api/courses/:courseId/sections/:sectionId
// @access  Private (Instructor only - own courses)
exports.updateSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    const { courseId, sectionId } = req.params;

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
        message: 'Not authorized to update this section'
      });
    }

    // Find and update section
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { title, order },
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: { section }
    });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating section',
      error: error.message
    });
  }
};

// @desc    Delete section
// @route   DELETE /api/courses/:courseId/sections/:sectionId
// @access  Private (Instructor only - own courses)
exports.deleteSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

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
        message: 'Not authorized to delete this section'
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

    // Delete all lectures in this section
    await Lecture.deleteMany({ section: sectionId });

    // Remove section from course
    course.sections = course.sections.filter(
      sec => sec.toString() !== sectionId
    );
    await course.save();

    // Delete section
    await section.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting section',
      error: error.message
    });
  }
};
