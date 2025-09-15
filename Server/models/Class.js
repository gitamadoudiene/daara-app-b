const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true }, // Niveau (6ème, 5ème, etc.)
  section: { type: String }, // Section (A, B, C, etc.)
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  academicYear: { type: String, required: true },
  studentCount: { type: Number, default: 0 },
  teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subjects: [{ type: String }]
});

module.exports = mongoose.model('Class', classSchema);
