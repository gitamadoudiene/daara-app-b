const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true, default: '' },
  phone: { type: String, required: true, default: '' },
  email: { type: String, required: true, match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
  director: { type: String, required: true, default: '' },
  adminCount: { type: Number, default: 0 },
  teacherCount: { type: Number, default: 0 },
  studentCount: { type: Number, default: 0 },
  createdYear: { type: String, required: true, default: '' },
  addedDate: { type: String, default: '' },
  status: { type: String, enum: ['Actif', 'Inactif', 'Suspendu'], default: 'Inactif' },
  type: { type: String, enum: ['Public', 'Privé', 'Semi-public'], default: 'Public' }
});

module.exports = mongoose.model('School', schoolSchema);
