const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'excused'], 
    default: 'absent' 
  },
  arrivalTime: { type: String }, // pour les retardataires
  comment: { type: String },
  notifiedParent: { type: Boolean, default: false },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // teacher who recorded
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index pour optimiser les requêtes
AttendanceRecordSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
AttendanceRecordSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
