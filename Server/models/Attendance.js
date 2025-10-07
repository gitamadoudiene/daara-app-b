const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  justification: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // enseignant
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
