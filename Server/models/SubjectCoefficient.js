const mongoose = require('mongoose');

const subjectCoefficientSchema = new mongoose.Schema({
  // Références essentielles
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  
  // Informations sur le niveau et coefficient
  classLevel: { 
    type: String, 
    required: true 
  }, // "6ème", "5ème", "4ème", "3ème", "2nde", "1ère S", "1ère L", "Terminale S", "Terminale L", etc.
  
  coefficient: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 10 
  }, // Coefficient de la matière pour ce niveau
  
  // Métadonnées
  isActive: { 
    type: Boolean, 
    default: true 
  }, // Pour désactiver temporairement sans supprimer
  
  academicYear: { 
    type: String, 
    required: true 
  }, // Année académique (ex: "2024-2025")
  
  // Informations administratives
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // Admin qui a créé/modifié
  
  notes: { 
    type: String 
  } // Notes ou commentaires sur ce coefficient
}, {
  timestamps: true
});

// Index pour éviter les doublons et améliorer les performances
subjectCoefficientSchema.index({ 
  subjectId: 1, 
  classLevel: 1, 
  schoolId: 1, 
  academicYear: 1 
}, { unique: true });

subjectCoefficientSchema.index({ schoolId: 1, academicYear: 1 });
subjectCoefficientSchema.index({ classLevel: 1 });

// Méthode statique pour récupérer le coefficient d'une matière pour un niveau donné
subjectCoefficientSchema.statics.getCoefficientForSubjectAndLevel = async function(subjectId, classLevel, schoolId, academicYear) {
  const coefficient = await this.findOne({
    subjectId,
    classLevel,
    schoolId,
    academicYear,
    isActive: true
  });
  
  return coefficient ? coefficient.coefficient : 1; // Coefficient par défaut = 1
};

// Méthode statique pour initialiser les coefficients par défaut du système sénégalais
subjectCoefficientSchema.statics.initializeDefaultCoefficients = async function(schoolId, academicYear, adminId) {
  const defaultCoefficients = [
    // Collège
    { subject: 'Mathématiques', level: '6ème', coefficient: 4 },
    { subject: 'Mathématiques', level: '5ème', coefficient: 4 },
    { subject: 'Mathématiques', level: '4ème', coefficient: 4 },
    { subject: 'Mathématiques', level: '3ème', coefficient: 5 },
    
    { subject: 'Français', level: '6ème', coefficient: 4 },
    { subject: 'Français', level: '5ème', coefficient: 4 },
    { subject: 'Français', level: '4ème', coefficient: 4 },
    { subject: 'Français', level: '3ème', coefficient: 4 },
    
    { subject: 'Anglais', level: '6ème', coefficient: 3 },
    { subject: 'Anglais', level: '5ème', coefficient: 3 },
    { subject: 'Anglais', level: '4ème', coefficient: 3 },
    { subject: 'Anglais', level: '3ème', coefficient: 3 },
    
    { subject: 'Histoire-Géographie', level: '6ème', coefficient: 3 },
    { subject: 'Histoire-Géographie', level: '5ème', coefficient: 3 },
    { subject: 'Histoire-Géographie', level: '4ème', coefficient: 3 },
    { subject: 'Histoire-Géographie', level: '3ème', coefficient: 3 },
    
    { subject: 'SVT', level: '6ème', coefficient: 2 },
    { subject: 'SVT', level: '5ème', coefficient: 2 },
    { subject: 'SVT', level: '4ème', coefficient: 2 },
    { subject: 'SVT', level: '3ème', coefficient: 2 },
    
    { subject: 'Physique-Chimie', level: '4ème', coefficient: 2 },
    { subject: 'Physique-Chimie', level: '3ème', coefficient: 2 },
    
    // Lycée - Série S
    { subject: 'Mathématiques', level: '2nde', coefficient: 4 },
    { subject: 'Mathématiques', level: '1ère S', coefficient: 5 },
    { subject: 'Mathématiques', level: 'Terminale S', coefficient: 6 },
    
    { subject: 'Physique-Chimie', level: '2nde', coefficient: 3 },
    { subject: 'Physique-Chimie', level: '1ère S', coefficient: 5 },
    { subject: 'Physique-Chimie', level: 'Terminale S', coefficient: 5 },
    
    { subject: 'SVT', level: '2nde', coefficient: 2 },
    { subject: 'SVT', level: '1ère S', coefficient: 4 },
    { subject: 'SVT', level: 'Terminale S', coefficient: 4 },
    
    { subject: 'Français', level: '2nde', coefficient: 4 },
    { subject: 'Français', level: '1ère S', coefficient: 3 },
    
    { subject: 'Philosophie', level: 'Terminale S', coefficient: 2 },
    
    // Lycée - Série L
    { subject: 'Mathématiques', level: '1ère L', coefficient: 2 },
    { subject: 'Mathématiques', level: 'Terminale L', coefficient: 2 },
    
    { subject: 'Français', level: '1ère L', coefficient: 5 },
    { subject: 'Français', level: 'Terminale L', coefficient: 5 },
    
    { subject: 'Philosophie', level: 'Terminale L', coefficient: 6 },
    
    { subject: 'Histoire-Géographie', level: '2nde', coefficient: 3 },
    { subject: 'Histoire-Géographie', level: '1ère L', coefficient: 4 },
    { subject: 'Histoire-Géographie', level: 'Terminale L', coefficient: 4 },
    
    { subject: 'Anglais', level: '2nde', coefficient: 3 },
    { subject: 'Anglais', level: '1ère S', coefficient: 2 },
    { subject: 'Anglais', level: '1ère L', coefficient: 3 },
    { subject: 'Anglais', level: 'Terminale S', coefficient: 2 },
    { subject: 'Anglais', level: 'Terminale L', coefficient: 3 }
  ];
  
  // Récupérer les matières existantes pour créer les coefficients
  const Subject = mongoose.model('Subject');
  const results = [];
  
  for (const defaultCoef of defaultCoefficients) {
    const subject = await Subject.findOne({ 
      name: defaultCoef.subject, 
      schoolId 
    });
    
    if (subject) {
      try {
        const coefficient = await this.create({
          subjectId: subject._id,
          classLevel: defaultCoef.level,
          coefficient: defaultCoef.coefficient,
          schoolId,
          academicYear,
          createdBy: adminId,
          notes: 'Coefficient par défaut du système sénégalais'
        });
        results.push(coefficient);
      } catch (error) {
        // Ignorer les erreurs de doublons
        if (error.code !== 11000) {
          console.error(`Erreur création coefficient ${defaultCoef.subject} ${defaultCoef.level}:`, error.message);
        }
      }
    }
  }
  
  return results;
};

// Méthode pour valider qu'un coefficient est correct
subjectCoefficientSchema.methods.validateCoefficient = function() {
  if (this.coefficient < 1 || this.coefficient > 10) {
    throw new Error('Le coefficient doit être entre 1 et 10');
  }
  return true;
};

// Hook de validation avant sauvegarde
subjectCoefficientSchema.pre('save', function(next) {
  try {
    this.validateCoefficient();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('SubjectCoefficient', subjectCoefficientSchema);