const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema({
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // "08:00:00"
  endTime: { type: String, required: true },   // "09:30:00"
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'expired'], 
    default: 'pending' 
  },
  totalStudents: { type: Number, default: 0 },
  presentStudents: { type: Number, default: 0 },
  absentStudents: { type: Number, default: 0 },
  lateStudents: { type: Number, default: 0 },
  excusedStudents: { type: Number, default: 0 },
  room: { type: String },
  completedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

// Index pour optimiser les requêtes
AttendanceSessionSchema.index({ teacherId: 1, date: 1, status: 1 });
AttendanceSessionSchema.index({ classId: 1, date: 1 });

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema);
