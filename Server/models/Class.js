const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  // Informations de base
  name: { type: String, required: true }, // Nom de la classe (ex: 6ème A)
  level: { type: String, required: true }, // Niveau (6ème, 5ème, etc.)
  section: { type: String }, // Section (A, B, C, etc.)
  room: { type: String, default: 'Salle à définir' }, // Salle de classe
  capacity: { type: Number, default: 40 }, // Capacité maximum de la classe
  
  // Références organisationnelles
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  anneeScolaire: { type: String, required: true }, // Ex: "2024-2025", "2025-2026"
  
  // Gestion des enseignants
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tous les professeurs donnant cours dans cette classe
  resTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Professeur principal/responsable
  
  // Gestion des élèves
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Liste des élèves inscrits
  studentCount: { type: Number, default: 0 }, // Nombre total d'élèves (calculé automatiquement)
  
  // Gestion des parents (pour faciliter la communication)
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Parents des élèves de cette classe
  
  // Gestion académique
  subjects: [{ type: String }], // Matières enseignées dans cette classe
  emploiDuTemps: { type: mongoose.Schema.Types.ObjectId, ref: 'EmploiDuTemps', default: null }, // Emploi du temps de la classe
  
  // Champs de compatibilité (à supprimer progressivement)
  academicYear: { type: String }, // Ancien champ, remplacé par anneeScolaire
  teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Ancien champ, remplacé par teachers
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour améliorer les performances des requêtes
classSchema.index({ schoolId: 1, anneeScolaire: 1 });
classSchema.index({ resTeacher: 1 });
classSchema.index({ 'students': 1 });

// Middleware pour calculer automatiquement studentCount
classSchema.pre('save', function(next) {
  if (this.students && Array.isArray(this.students)) {
    this.studentCount = this.students.length;
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);
