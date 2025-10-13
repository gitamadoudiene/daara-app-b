const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  // Références essentielles
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  
  // Informations sur la matière et l'évaluation
  subject: { 
    type: String, 
    required: true 
  },
  evaluationType: { 
    type: String, 
    enum: ['devoir', 'examen', 'projet', 'presentation', 'participation', 'autre'], 
    required: true 
  },
  
  // Détails sur la note
  score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 20 // Note sur 20 par défaut
  },
  maxScore: { 
    type: Number, 
    default: 20 
  },
  
  // Commentaires et contexte
  title: { 
    type: String, 
    required: true 
  }, // Titre de l'évaluation
  description: { 
    type: String 
  }, // Description optionnelle
  comment: { 
    type: String 
  }, // Commentaires du professeur
  
  // Organisation temporelle
  semester: { 
    type: Number, 
    enum: [1, 2, 3], 
    required: true 
  }, // Semestre (1, 2 ou 3)
  academicYear: { 
    type: String, 
    required: true 
  }, // Année académique (ex: "2023-2024")
  evaluationDate: { 
    type: Date, 
    default: Date.now 
  },
  
  // Autres métadonnées
  coefficient: { 
    type: Number, 
    default: 1 
  }, // Coefficient de la note
  isPublished: { 
    type: Boolean, 
    default: false 
  }, // Si la note est visible par l'élève/parent
  
  // Liens avec d'autres documents (optionnels)
  homeworkId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Homework' 
  }, // Si la note est liée à un devoir
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour améliorer les performances des requêtes courantes
gradeSchema.index({ studentId: 1, subject: 1, semester: 1, academicYear: 1 });
gradeSchema.index({ classId: 1, subject: 1, evaluationType: 1 });
gradeSchema.index({ teacherId: 1 });

// Méthode virtuelle pour calculer la note sur 20
gradeSchema.virtual('scoreOn20').get(function() {
  return (this.score / this.maxScore) * 20;
});

// Méthode statique pour calculer la moyenne d'un étudiant dans une matière
gradeSchema.statics.calculateAverage = async function(studentId, subject, semester, academicYear) {
  const grades = await this.find({ 
    studentId, 
    subject, 
    semester, 
    academicYear,
    isPublished: true
  });
  
  if (grades.length === 0) return null;
  
  let totalWeightedScore = 0;
  let totalCoefficient = 0;
  
  grades.forEach(grade => {
    const scoreOn20 = (grade.score / grade.maxScore) * 20;
    totalWeightedScore += scoreOn20 * grade.coefficient;
    totalCoefficient += grade.coefficient;
  });
  
  return totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : null;
};

// Méthode statique pour calculer la moyenne de classe
gradeSchema.statics.calculateClassAverage = async function(classId, subject, semester, academicYear) {
  const aggregation = await this.aggregate([
    { 
      $match: { 
        classId: mongoose.Types.ObjectId(classId),
        subject, 
        semester, 
        academicYear,
        isPublished: true
      } 
    },
    { 
      $group: { 
        _id: "$studentId",
        averageScore: { $avg: { $multiply: [{ $divide: ["$score", "$maxScore"] }, 20, "$coefficient"] } },
        totalCoefficient: { $sum: "$coefficient" }
      } 
    },
    {
      $group: {
        _id: null,
        classAverage: { $avg: { $divide: ["$averageScore", "$totalCoefficient"] } }
      }
    }
  ]);
  
  return aggregation.length > 0 ? aggregation[0].classAverage : null;
};

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;