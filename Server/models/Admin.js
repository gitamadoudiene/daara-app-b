const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
  phone: { type: String, required: true },
  role: { type: String, default: 'Administrateur' },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  lastLogin: { type: Date },
  lastActivity: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema);
