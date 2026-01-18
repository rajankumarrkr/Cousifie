const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [100, 'Section title cannot exceed 100 characters']
    },
    order: {
      type: Number,
      required: true
    },
    lectures: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture'
    }]
  },
  { 
    timestamps: true 
  }
);

// Ensure sections are ordered within a course
sectionSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Section', sectionSchema);
