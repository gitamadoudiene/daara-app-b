const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_user', 'admin', 'teacher', 'parent', 'student'], required: true },
  status: { type: String, enum: ['Actif', 'Inactif', 'Suspendu'], default: 'Actif' },
  gender: { type: String, enum: ['Masculin', 'Féminin'], required: function() { return this.role === 'student' || this.role === 'parent'; } },
  avatar: { type: String },
  phone: { type: String },
  address: { type: String }, // Adresse de l'utilisateur
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // Référence à la classe pour les étudiants
  class: { type: String }, // Conservé pour compatibilité
  classes: [{ type: String }], // Pour les enseignants qui enseignent plusieurs classes
  subjects: [{ type: String }],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  password: { type: String, required: true },
  qualification: { type: String }, // Pour les qualifications des enseignants
  experience: { type: String }, // Pour l'expérience professionnelle des enseignants
  
  // Champs spécifiques aux parents
  profession: { type: String }, // Profession du parent
  emergencyPhone: { type: String }, // Téléphone d'urgence
  relation: { type: String }, // Relation avec l'enfant (père, mère, tuteur, etc.)
  
  // Champs spécifiques aux étudiants
  dateOfBirth: { type: Date }, // Date de naissance
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ID du parent
  
  lastLogin: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
