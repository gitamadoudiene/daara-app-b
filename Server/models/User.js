const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_user', 'admin', 'teacher', 'parent', 'student'], required: true },
  avatar: { type: String },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  class: { type: String },
  subjects: [{ type: String }],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
