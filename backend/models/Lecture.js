const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
      maxlength: [100, 'Lecture title cannot exceed 100 characters']
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required']
    },
    publicId: {
      type: String, // Cloudinary public_id for deletion
      required: true
    },
    duration: {
      type: Number, // Duration in seconds
      default: 0
    },
    order: {
      type: Number,
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// Ensure lectures are ordered within a section
lectureSchema.index({ section: 1, order: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
