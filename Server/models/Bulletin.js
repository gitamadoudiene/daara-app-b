const mongoose = require('mongoose');

// Schéma pour une moyenne de matière dans le bulletin
const subjectAverageSchema = new mongoose.Schema({
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  subjectName: { 
    type: String, 
    required: true 
  }, // Nom de la matière (dénormalisé pour performance)
  
  // Moyennes détaillées
  homeworkAverage: { 
    type: Number, 
    min: 0, 
    max: 20 
  }, // Moyenne des devoirs (contrôles continus)
  examScore: { 
    type: Number, 
    min: 0, 
    max: 20 
  }, // Note de l'examen
  finalAverage: { 
    type: Number, 
    min: 0, 
    max: 20 
  }, // Moyenne finale de la matière (50% devoirs + 50% examen)
  
  // Informations sur les évaluations
  homeworkCount: { 
    type: Number, 
    default: 0 
  }, // Nombre de devoirs pris en compte
  hasExam: { 
    type: Boolean, 
    default: false 
  }, // Si l'élève a passé l'examen
  
  // Coefficient et rang
  coefficient: { 
    type: Number, 
    required: true 
  }, // Coefficient de la matière pour ce niveau
  rankInClass: { 
    type: Number 
  }, // Classement de l'élève dans cette matière
  classAverage: { 
    type: Number 
  }, // Moyenne de la classe dans cette matière
  
  // Appréciations
  teacherComment: { 
    type: String 
  }, // Commentaire du professeur
  appreciation: { 
    type: String, 
    enum: ['Très Bien', 'Bien', 'Assez Bien', 'Passable', 'Insuffisant', 'Très Insuffisant']
  }
}, { _id: false });

const bulletinSchema = new mongoose.Schema({
  // Références essentielles
  studentId: { 
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
  
  // Période concernée
  semester: { 
    type: Number, 
    enum: [1, 2], 
    required: true 
  },
  academicYear: { 
    type: String, 
    required: true 
  }, // Ex: "2024-2025"
  
  // Informations sur l'élève (dénormalisées pour performance)
  studentInfo: {
    name: { type: String, required: true },
    dateOfBirth: { type: Date },
    className: { type: String, required: true },
    classLevel: { type: String, required: true }
  },
  
  // Moyennes par matière
  subjects: [subjectAverageSchema],
  
  // Moyennes générales
  generalAverage: { 
    type: Number, 
    min: 0, 
    max: 20 
  }, // Moyenne générale pondérée par les coefficients
  
  totalCoefficients: { 
    type: Number, 
    default: 0 
  }, // Somme des coefficients
  
  // Classement
  rankInClass: { 
    type: Number 
  }, // Rang de l'élève dans la classe
  totalStudentsInClass: { 
    type: Number 
  }, // Nombre total d'élèves dans la classe
  
  // Moyennes de comparaison
  classGeneralAverage: { 
    type: Number 
  }, // Moyenne générale de la classe
  bestAverageInClass: { 
    type: Number 
  }, // Meilleure moyenne de la classe
  worstAverageInClass: { 
    type: Number 
  }, // Plus faible moyenne de la classe
  
  // Statistiques d'assiduité
  attendance: {
    totalDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    lateArrivals: { type: Number, default: 0 },
    attendanceRate: { type: Number } // Pourcentage de présence
  },
  
  // Appréciations et commentaires
  mainTeacherComment: { 
    type: String 
  }, // Commentaire du professeur principal
  principalComment: { 
    type: String 
  }, // Commentaire du directeur
  generalAppreciation: { 
    type: String,
    enum: ['Excellent', 'Très Bien', 'Bien', 'Assez Bien', 'Passable', 'Insuffisant', 'Très Insuffisant']
  },
  
  // Décision du conseil de classe
  councilDecision: {
    decision: { 
      type: String,
      enum: ['Admission', 'Admission avec félicitations', 'Admission avec encouragements', 'Passage en classe supérieure', 'Redoublement', 'Orientation', 'Exclusion']
    },
    councilDate: { type: Date },
    recommendations: { type: String }
  },
  
  // Statut et validation
  status: { 
    type: String, 
    enum: ['brouillon', 'provisoire', 'definitif', 'publie'], 
    default: 'brouillon' 
  },
  
  isPublished: { 
    type: Boolean, 
    default: false 
  }, // Si le bulletin est visible par l'élève/parent
  
  // Signatures et validation
  validatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // Qui a validé le bulletin (directeur, admin)
  validatedAt: { 
    type: Date 
  },
  
  // Métadonnées
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // Qui a généré le bulletin
  lastCalculatedAt: { 
    type: Date, 
    default: Date.now 
  }, // Dernière mise à jour des calculs
  
  // Version et historique
  version: { 
    type: Number, 
    default: 1 
  }, // Version du bulletin (en cas de modifications)
  
  notes: { 
    type: String 
  } // Notes internes
}, {
  timestamps: true
});

// Index pour améliorer les performances
bulletinSchema.index({ studentId: 1, academicYear: 1, semester: 1 }, { unique: true });
bulletinSchema.index({ classId: 1, semester: 1, academicYear: 1 });
bulletinSchema.index({ schoolId: 1, academicYear: 1 });
bulletinSchema.index({ generalAverage: -1 }); // Pour les classements
bulletinSchema.index({ status: 1, isPublished: 1 });

// Méthode pour calculer l'appréciation basée sur la moyenne
bulletinSchema.methods.calculateAppreciation = function(average) {
  if (average >= 16) return 'Excellent';
  if (average >= 14) return 'Très Bien';
  if (average >= 12) return 'Bien';
  if (average >= 10) return 'Assez Bien';
  if (average >= 8) return 'Passable';
  if (average >= 6) return 'Insuffisant';
  return 'Très Insuffisant';
};

// Méthode pour calculer la moyenne générale
bulletinSchema.methods.calculateGeneralAverage = function() {
  if (!this.subjects || this.subjects.length === 0) return 0;
  
  let totalWeightedScore = 0;
  let totalCoefficients = 0;
  
  this.subjects.forEach(subject => {
    if (subject.finalAverage !== null && subject.finalAverage !== undefined) {
      totalWeightedScore += subject.finalAverage * subject.coefficient;
      totalCoefficients += subject.coefficient;
    }
  });
  
  this.totalCoefficients = totalCoefficients;
  this.generalAverage = totalCoefficients > 0 ? 
    Math.round((totalWeightedScore / totalCoefficients) * 100) / 100 : 0;
  
  this.generalAppreciation = this.calculateAppreciation(this.generalAverage);
  
  return this.generalAverage;
};

// Méthode statique pour générer un bulletin complet
bulletinSchema.statics.generateBulletin = async function(studentId, classId, semester, academicYear) {
  const User = mongoose.model('User');
  const Class = mongoose.model('Class');
  const Subject = mongoose.model('Subject');
  const Grade = mongoose.model('Grade');
  const SubjectCoefficient = mongoose.model('SubjectCoefficient');
  const Evaluation = mongoose.model('Evaluation');
  
  // Récupérer les informations de l'élève et de la classe
  const student = await User.findById(studentId);
  const classInfo = await Class.findById(classId);
  
  if (!student || !classInfo) {
    throw new Error('Élève ou classe non trouvé');
  }
  
  // Vérifier si un bulletin existe déjà
  let bulletin = await this.findOne({
    studentId,
    classId,
    semester,
    academicYear
  });
  
  // Créer un nouveau bulletin si nécessaire
  if (!bulletin) {
    bulletin = new this({
      studentId,
      classId,
      schoolId: classInfo.schoolId,
      semester,
      academicYear,
      studentInfo: {
        name: student.name,
        dateOfBirth: student.dateOfBirth,
        className: classInfo.name,
        classLevel: classInfo.level
      },
      subjects: []
    });
  }
  
  // Récupérer toutes les matières de la classe
  const subjects = await Subject.find({
    schoolId: classInfo.schoolId,
    status: 'Actif'
  });
  
  bulletin.subjects = [];
  
  // Calculer les moyennes pour chaque matière
  for (const subject of subjects) {
    // Vérifier si l'élève a des notes dans cette matière
    const grades = await Grade.find({
      studentId,
      subject: subject.name,
      semester,
      academicYear,
      isPublished: true
    });
    
    if (grades.length === 0) continue; // Pas de notes dans cette matière
    
    // Récupérer le coefficient de la matière
    const coefficient = await SubjectCoefficient.getCoefficientForSubjectAndLevel(
      subject._id,
      classInfo.level,
      classInfo.schoolId,
      academicYear
    );
    
    // Séparer devoirs et examens
    const homeworks = grades.filter(g => g.evaluationType !== 'examen');
    const exams = grades.filter(g => g.evaluationType === 'examen');
    
    // Calculer moyenne des devoirs
    let homeworkAverage = null;
    if (homeworks.length > 0) {
      let totalWeightedScore = 0;
      let totalCoefficient = 0;
      
      homeworks.forEach(homework => {
        const scoreOn20 = (homework.score / homework.maxScore) * 20;
        totalWeightedScore += scoreOn20 * homework.coefficient;
        totalCoefficient += homework.coefficient;
      });
      
      homeworkAverage = totalCoefficient > 0 ? 
        Math.round((totalWeightedScore / totalCoefficient) * 100) / 100 : null;
    }
    
    // Récupérer note d'examen
    let examScore = null;
    let hasExam = false;
    if (exams.length > 0) {
      const exam = exams[0]; // Un seul examen par semestre
      examScore = Math.round(((exam.score / exam.maxScore) * 20) * 100) / 100;
      hasExam = true;
    }
    
    // Calculer moyenne finale (50% devoirs + 50% examen)
    let finalAverage = null;
    if (homeworkAverage !== null && examScore !== null) {
      finalAverage = Math.round(((homeworkAverage * 0.5) + (examScore * 0.5)) * 100) / 100;
    } else if (homeworkAverage !== null) {
      finalAverage = homeworkAverage; // Si pas d'examen, utiliser moyenne devoirs
    } else if (examScore !== null) {
      finalAverage = examScore; // Si pas de devoirs, utiliser note examen
    }
    
    if (finalAverage !== null) {
      bulletin.subjects.push({
        subjectId: subject._id,
        subjectName: subject.name,
        homeworkAverage,
        examScore,
        finalAverage,
        homeworkCount: homeworks.length,
        hasExam,
        coefficient,
        appreciation: bulletin.calculateAppreciation(finalAverage)
      });
    }
  }
  
  // Calculer la moyenne générale
  bulletin.calculateGeneralAverage();
  
  // Mettre à jour la date de dernier calcul
  bulletin.lastCalculatedAt = new Date();
  
  await bulletin.save();
  return bulletin;
};

// Méthode statique pour calculer les classements d'une classe
bulletinSchema.statics.calculateClassRankings = async function(classId, semester, academicYear) {
  // Récupérer tous les bulletins de la classe
  const bulletins = await this.find({
    classId,
    semester,
    academicYear
  }).sort({ generalAverage: -1 });
  
  let rank = 1;
  let previousAverage = null;
  let sameRankCount = 0;
  
  for (let i = 0; i < bulletins.length; i++) {
    const bulletin = bulletins[i];
    
    if (previousAverage !== null && bulletin.generalAverage < previousAverage) {
      rank += sameRankCount;
      sameRankCount = 1;
    } else {
      sameRankCount++;
    }
    
    bulletin.rankInClass = rank;
    bulletin.totalStudentsInClass = bulletins.length;
    
    // Calculer les moyennes de comparaison
    const averages = bulletins.map(b => b.generalAverage).filter(avg => avg !== null);
    bulletin.classGeneralAverage = averages.length > 0 ? 
      Math.round((averages.reduce((a, b) => a + b, 0) / averages.length) * 100) / 100 : null;
    bulletin.bestAverageInClass = averages.length > 0 ? Math.max(...averages) : null;
    bulletin.worstAverageInClass = averages.length > 0 ? Math.min(...averages) : null;
    
    await bulletin.save();
    previousAverage = bulletin.generalAverage;
  }
  
  return bulletins;
};

// Méthode pour publier le bulletin
bulletinSchema.methods.publish = async function(validatedBy) {
  this.status = 'publie';
  this.isPublished = true;
  this.validatedBy = validatedBy;
  this.validatedAt = new Date();
  await this.save();
  return this;
};

// Hook pour incrémenter la version lors de modifications importantes
bulletinSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified('subjects')) {
    this.version += 1;
  }
  next();
});

module.exports = mongoose.model('Bulletin', bulletinSchema);