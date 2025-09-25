const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Actif', 'Inactif'],
    default: 'Actif'
  }
}, {
  timestamps: true
});

// Index pour éviter les doublons de code par école
subjectSchema.index({ code: 1, schoolId: 1 }, { unique: true });

// Index pour éviter les doublons de nom par école
subjectSchema.index({ name: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);