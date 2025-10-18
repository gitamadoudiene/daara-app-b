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
  
  // Référence à l'évaluation programmée
  evaluationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Evaluation',
    required: true 
  },
  
  // Informations sur la matière et l'évaluation (dénormalisées pour performance)
  subject: { 
    type: String, 
    required: true 
  },
  evaluationType: { 
    type: String, 
    enum: ['devoir', 'controle', 'examen', 'composition', 'projet', 'presentation', 'participation', 'oral', 'autre'], 
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
  
  // Gestion des absences
  isAbsent: { 
    type: Boolean, 
    default: false 
  }, // Si l'élève était absent lors de l'évaluation
  absentReason: { 
    type: String 
  }, // Raison de l'absence (maladie, etc.)
  
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
gradeSchema.index({ evaluationId: 1 }); // Nouveau index pour les évaluations

// Méthode virtuelle pour calculer la note sur 20
gradeSchema.virtual('scoreOn20').get(function() {
  return (this.score / this.maxScore) * 20;
});

// Méthode statique pour calculer la moyenne d'un étudiant dans une matière selon le nouveau système
gradeSchema.statics.calculateSubjectAverage = async function(studentId, subjectName, semester, academicYear) {
  // Récupérer toutes les notes de l'élève pour cette matière
  const grades = await this.find({ 
    studentId, 
    subject: subjectName, 
    semester, 
    academicYear,
    isPublished: true,
    isAbsent: false // Exclure les absences
  });
  
  if (grades.length === 0) return null;
  
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
    
    homeworkAverage = totalCoefficient > 0 ? totalWeightedScore / totalCoefficient : null;
  }
  
  // Récupérer note d'examen
  let examScore = null;
  if (exams.length > 0) {
    const exam = exams[0]; // Un seul examen par semestre
    examScore = (exam.score / exam.maxScore) * 20;
  }
  
  // Calculer moyenne finale selon le système sénégalais (50% devoirs + 50% examen)
  let finalAverage = null;
  if (homeworkAverage !== null && examScore !== null) {
    finalAverage = (homeworkAverage * 0.5) + (examScore * 0.5);
  } else if (homeworkAverage !== null) {
    finalAverage = homeworkAverage; // Si pas d'examen
  } else if (examScore !== null) {
    finalAverage = examScore; // Si pas de devoirs
  }
  
  return {
    homeworkAverage,
    examScore,
    finalAverage,
    homeworkCount: homeworks.length,
    hasExam: exams.length > 0
  };
};

// Méthode statique pour créer des notes à partir d'une évaluation
gradeSchema.statics.createGradesFromEvaluation = async function(evaluationId, gradesData) {
  console.log('=== DEBUT createGradesFromEvaluation ===');
  console.log('evaluationId:', evaluationId);
  console.log('gradesData count:', gradesData?.length);
  console.log('premier grade:', gradesData?.[0]);
  
  const Evaluation = mongoose.model('Evaluation');
  const evaluation = await Evaluation.findById(evaluationId).populate('subjectId');
  
  if (!evaluation) {
    console.error('❌ Évaluation non trouvée pour ID:', evaluationId);
    throw new Error('Évaluation non trouvée');
  }
  
  console.log('✅ Évaluation trouvée:', evaluation.title);
  console.log('Matière évaluation:', evaluation.subjectId);
  
  const grades = [];
  
  for (let i = 0; i < gradesData.length; i++) {
    const gradeData = gradesData[i];
    console.log(`--- Traitement note ${i + 1}/${gradesData.length} ---`);
    console.log('studentId:', gradeData.studentId);
    console.log('score:', gradeData.score);
    console.log('isAbsent:', gradeData.isAbsent);
    
    try {
      const gradeObj = {
        evaluationId,
        studentId: gradeData.studentId,
        teacherId: evaluation.teacherId,
        classId: evaluation.classId,
        schoolId: evaluation.schoolId,
        subject: gradeData.subject || evaluation.subjectId?.name || 'Matière inconnue',
        evaluationType: evaluation.type,
        score: gradeData.score || 0,
        maxScore: evaluation.maxScore || 20,
        title: evaluation.title,
        description: evaluation.description,
        comment: gradeData.comment || '',
        semester: evaluation.semester,
        academicYear: evaluation.academicYear,
        evaluationDate: evaluation.actualDate || evaluation.plannedDate,
        coefficient: evaluation.coefficient,
        isAbsent: gradeData.isAbsent || false,
        absentReason: gradeData.absentReason || '',
        isPublished: false
      };
      
      console.log('Objet note à créer:', gradeObj);
      
      const grade = new this(gradeObj);
      const savedGrade = await grade.save();
      
      console.log('✅ Note sauvegardée ID:', savedGrade._id);
      grades.push(savedGrade);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde note:', error.message);
      console.error('Données problématiques:', gradeData);
      throw error;
    }
  }
  
  console.log('✅ Toutes les notes sauvegardées, total:', grades.length);
  
  // Mettre à jour les statistiques de l'évaluation
  try {
    await evaluation.calculateStats();
    console.log('✅ Statistiques mises à jour');
  } catch (error) {
    console.error('⚠️ Erreur calcul stats:', error.message);
  }
  
  console.log('=== FIN createGradesFromEvaluation ===');
  return grades;
};

// Méthode statique pour publier les notes d'une évaluation
gradeSchema.statics.publishGradesForEvaluation = async function(evaluationId, publishedBy) {
  const result = await this.updateMany(
    { evaluationId, isPublished: false },
    { 
      $set: { 
        isPublished: true,
        publishedAt: new Date(),
        publishedBy 
      } 
    }
  );
  
  // Mettre à jour le statut de l'évaluation
  const Evaluation = mongoose.model('Evaluation');
  await Evaluation.findByIdAndUpdate(evaluationId, {
    status: 'publiee'
  });
  
  return result;
};

module.exports = mongoose.model('Grade', gradeSchema);