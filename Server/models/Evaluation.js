const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  // Références essentielles
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
  
  // Informations sur l'évaluation
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  
  // Type d'évaluation
  type: { 
    type: String, 
    enum: ['devoir', 'examen', 'projet', 'presentation', 'participation'], 
    required: true 
  },
  
  // Organisation temporelle
  plannedDate: { 
    type: Date, 
    required: true 
  },
  actualDate: { 
    type: Date 
  }, // Date réelle si différente de la date prévue
  
  semester: { 
    type: Number, 
    enum: [1, 2], 
    required: true 
  },
  academicYear: { 
    type: String, 
    required: true 
  }, // Ex: "2024-2025"
  
  // Durée et modalités
  duration: { 
    type: Number 
  }, // Durée en minutes
  maxScore: { 
    type: Number, 
    default: 20 
  }, // Note maximale (par défaut sur 20)
  
  // Coefficient et importance
  coefficient: { 
    type: Number, 
    required: true,
    min: 0.5,
    max: 5 
  }, // Coefficient de cette évaluation pour le calcul de moyenne
  
  // Statut de l'évaluation
  status: { 
    type: String, 
    enum: ['programmee', 'en_cours', 'terminee', 'corrigee', 'publiee', 'annulee'], 
    default: 'programmee' 
  },
  
  // Paramètres de notation
  isPublished: { 
    type: Boolean, 
    default: false 
  }, // Si les résultats sont visibles par les élèves/parents
  
  allowAbsent: { 
    type: Boolean, 
    default: true 
  }, // Permet de marquer des élèves absents
  
  // Instructions et contenu
  instructions: { 
    type: String 
  }, // Instructions pour l'évaluation
  
  topics: [{ 
    type: String 
  }], // Sujets/chapitres couverts
  
  // Métadonnées
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  lastModifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Statistiques (calculées automatiquement)
  stats: {
    totalStudents: { type: Number, default: 0 },
    submittedGrades: { type: Number, default: 0 },
    averageScore: { type: Number },
    minScore: { type: Number },
    maxScore: { type: Number },
    absentCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
evaluationSchema.index({ teacherId: 1, academicYear: 1, semester: 1 });
evaluationSchema.index({ classId: 1, subjectId: 1, type: 1 });
evaluationSchema.index({ schoolId: 1, status: 1 });
evaluationSchema.index({ plannedDate: 1 });

// Index pour éviter les doublons d'examens (une seule évaluation de type "examen" par matière/classe/semestre)
evaluationSchema.index({ 
  classId: 1, 
  subjectId: 1, 
  type: 1, 
  semester: 1, 
  academicYear: 1 
}, { 
  unique: true, 
  partialFilterExpression: { type: 'examen' } 
});

// Méthode virtuelle pour vérifier si c'est un examen
evaluationSchema.virtual('isExam').get(function() {
  return this.type === 'examen';
});

// Méthode virtuelle pour vérifier si l'évaluation est en retard
evaluationSchema.virtual('isOverdue').get(function() {
  return this.status === 'programmee' && new Date() > this.plannedDate;
});

// Méthode pour récupérer le coefficient de la matière
evaluationSchema.methods.getSubjectCoefficient = async function() {
  const SubjectCoefficient = mongoose.model('SubjectCoefficient');
  const Class = mongoose.model('Class');
  
  const classInfo = await Class.findById(this.classId);
  if (!classInfo) return 1;
  
  const coefficient = await SubjectCoefficient.getCoefficientForSubjectAndLevel(
    this.subjectId,
    classInfo.level,
    this.schoolId,
    this.academicYear
  );
  
  return coefficient || 1;
};

// Méthode pour calculer les statistiques
evaluationSchema.methods.calculateStats = async function() {
  const Grade = mongoose.model('Grade');
  
  // Récupérer toutes les notes pour cette évaluation
  const grades = await Grade.find({ 
    evaluationId: this._id,
    isPublished: true 
  });
  
  const Class = mongoose.model('Class');
  const classInfo = await Class.findById(this.classId).populate('students');
  
  const totalStudents = classInfo ? classInfo.students.length : 0;
  const submittedGrades = grades.filter(g => g.score !== null && g.score !== undefined).length;
  const absentCount = grades.filter(g => g.isAbsent === true).length;
  
  let averageScore, minScore, maxScore;
  
  if (submittedGrades > 0) {
    const scores = grades
      .filter(g => g.score !== null && g.score !== undefined && !g.isAbsent)
      .map(g => (g.score / g.maxScore) * 20); // Normaliser sur 20
    
    averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    minScore = Math.min(...scores);
    maxScore = Math.max(...scores);
  }
  
  // Mettre à jour les statistiques
  this.stats = {
    totalStudents,
    submittedGrades,
    averageScore: averageScore ? Math.round(averageScore * 100) / 100 : null,
    minScore: minScore ? Math.round(minScore * 100) / 100 : null,
    maxScore: maxScore ? Math.round(maxScore * 100) / 100 : null,
    absentCount
  };
  
  await this.save();
  return this.stats;
};

// Méthode statique pour vérifier les conflits d'examens
evaluationSchema.statics.checkExamConflict = async function(classId, subjectId, semester, academicYear, excludeId = null) {
  const query = {
    classId,
    subjectId,
    type: 'examen',
    semester,
    academicYear,
    status: { $ne: 'annulee' }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existingExam = await this.findOne(query);
  return existingExam;
};

// Méthode statique pour récupérer les évaluations d'un enseignant
evaluationSchema.statics.getTeacherEvaluations = async function(teacherId, academicYear = null, semester = null) {
  const query = { teacherId };
  
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;
  
  return await this.find(query)
    .populate('classId', 'name level')
    .populate('subjectId', 'name code')
    .sort({ plannedDate: -1 });
};

// Méthode statique pour récupérer les évaluations d'une classe
evaluationSchema.statics.getClassEvaluations = async function(classId, academicYear = null, semester = null) {
  const query = { classId };
  
  if (academicYear) query.academicYear = academicYear;
  if (semester) query.semester = semester;
  
  return await this.find(query)
    .populate('teacherId', 'name')
    .populate('subjectId', 'name code')
    .sort({ plannedDate: 1 });
};

// Hook pour valider les examens (un seul par matière/classe/semestre)
evaluationSchema.pre('save', async function(next) {
  if (this.type === 'examen' && (this.isNew || this.isModified('type'))) {
    const conflict = await this.constructor.checkExamConflict(
      this.classId,
      this.subjectId,
      this.semester,
      this.academicYear,
      this._id
    );
    
    if (conflict) {
      const error = new Error(`Un examen existe déjà pour cette matière dans cette classe pour le semestre ${this.semester}`);
      error.code = 'EXAM_CONFLICT';
      return next(error);
    }
  }
  
  next();
});

// Hook pour mettre à jour le statut automatiquement
evaluationSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'programmee' && this.plannedDate < now) {
    // Automatiquement passer en "en_cours" si la date est dépassée
    // Note: En production, ceci devrait être géré par un job cron
  }
  
  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema);