const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Lecture = require('../models/Lecture');
const Section = require('../models/Section');
const Course = require('../models/Course');

// @desc    Mark lecture as complete
// @route   POST /api/progress/mark-complete
// @access  Private (Student only)
exports.markLectureComplete = async (req, res) => {
  try {
    const { enrollmentId, lectureId } = req.body;

    if (!enrollmentId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID and Lecture ID are required'
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if student owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    // Check if already completed
    const existingProgress = await Progress.findOne({
      enrollment: enrollmentId,
      lecture: lectureId
    });

    if (existingProgress && existingProgress.completed) {
      return res.status(400).json({
        success: false,
        message: 'Lecture already marked as complete'
      });
    }

    // Create or update progress
    const progress = await Progress.findOneAndUpdate(
      { enrollment: enrollmentId, lecture: lectureId },
      {
        completed: true,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Add lecture to enrollment's completedLectures if not already there
    if (!enrollment.completedLectures.includes(lectureId)) {
      enrollment.completedLectures.push(lectureId);
    }

    // Calculate progress percentage
    const course = await Course.findById(enrollment.course).populate({
      path: 'sections',
      populate: 'lectures'
    });

    let totalLectures = 0;
    course.sections.forEach(section => {
      totalLectures += section.lectures.length;
    });

    const completedCount = enrollment.completedLectures.length;
    enrollment.progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Lecture marked as complete',
      data: {
        progress,
        courseProgress: enrollment.progress
      }
    });
  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking lecture as complete',
      error: error.message
    });
  }
};

// @desc    Get all progress for an enrollment
// @route   GET /api/progress/:enrollmentId
// @access  Private (Student only)
exports.getEnrollmentProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check authorization
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const progressRecords = await Progress.find({ enrollment: enrollmentId })
      .populate('lecture', 'title videoUrl duration order');

    res.status(200).json({
      success: true,
      data: {
        enrollment,
        progressRecords
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Mark lecture as incomplete (undo completion)
// @route   POST /api/progress/mark-incomplete
// @access  Private (Student only)
exports.markLectureIncomplete = async (req, res) => {
  try {
    const { enrollmentId, lectureId } = req.body;

    if (!enrollmentId || !lectureId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID and Lecture ID are required'
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update progress
    await Progress.findOneAndUpdate(
      { enrollment: enrollmentId, lecture: lectureId },
      { completed: false, completedAt: null },
      { new: true }
    );

    // Remove from completedLectures
    enrollment.completedLectures = enrollment.completedLectures.filter(
      id => id.toString() !== lectureId
    );

    // Recalculate progress
    const course = await Course.findById(enrollment.course).populate({
      path: 'sections',
      populate: 'lectures'
    });

    let totalLectures = 0;
    course.sections.forEach(section => {
      totalLectures += section.lectures.length;
    });

    const completedCount = enrollment.completedLectures.length;
    enrollment.progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Lecture marked as incomplete',
      data: {
        courseProgress: enrollment.progress
      }
    });
  } catch (error) {
    console.error('Mark incomplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking lecture as incomplete',
      error: error.message
    });
  }
};
