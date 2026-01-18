const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { 
    timestamps: true 
  }
);

// Prevent duplicate progress entries
progressSchema.index({ enrollment: 1, lecture: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
