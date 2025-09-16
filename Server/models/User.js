const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_user', 'admin', 'teacher', 'parent', 'student'], required: true },
  gender: { type: String, enum: ['Masculin', 'Féminin'], required: function() { return this.role === 'student' || this.role === 'parent'; } },
  avatar: { type: String },
  phone: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  class: { type: String },
  classes: [{ type: String }], // Pour les enseignants qui enseignent plusieurs classes
  subjects: [{ type: String }],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  password: { type: String, required: true },
  qualification: { type: String }, // Pour les qualifications des enseignants
  experience: { type: String }, // Pour l'expérience professionnelle des enseignants
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
