const Evaluation = require('../models/Evaluation');
const Grade = require('../models/Grade');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const SubjectCoefficient = require('../models/SubjectCoefficient');
const User = require('../models/User');

// Créer une nouvelle évaluation (étape 1: programmation)
const createEvaluation = async (req, res) => {
  try {
    const {
      classId,
      subjectId,
      subject, // Nom de la matière en string (pour compatibilité)
      type,
      title,
      description,
      plannedDate,
      semester,
      academicYear,
      duration,
      maxScore,
      coefficient,
      instructions,
      topics
    } = req.body;

    const teacherId = req.user.userId;
    const schoolId = req.user.schoolId;

    // Résoudre subjectId si ce n'est qu'un nom de matière
    let resolvedSubjectId = subjectId;
    if (!resolvedSubjectId && subject) {
      
      
      // Si pas de schoolId, utiliser la première école disponible
      let searchSchoolId = schoolId;
      if (!searchSchoolId) {
        const School = require('../models/School');
        const firstSchool = await School.findOne({});
        if (firstSchool) {
          searchSchoolId = firstSchool._id;
          
        }
      }
      
      const subjectDoc = await Subject.findOne({ 
        name: subject,
        schoolId: searchSchoolId 
      });
      
      if (subjectDoc) {
        resolvedSubjectId = subjectDoc._id;
      } else {
        // Vérifions toutes les matières de cette école
        const allSubjects = await Subject.find({ schoolId: searchSchoolId });
        
        return res.status(400).json({
          success: false,
          message: `Matière "${subject}" non trouvée dans cette école. Matières disponibles: ${allSubjects.map(s => s.name).join(', ')}`
        });
      }
    }

    if (!resolvedSubjectId) {
      return res.status(400).json({
        success: false,
        message: "subjectId ou subject est requis"
      });
    }

    // Valider que l'enseignant peut enseigner cette matière dans cette classe
    const classInfo = await Class.findById(classId);
    
    
    
    if (classInfo) {
      
      
    }
    
    // Vérifier l'accès via assignation directe ou via l'emploi du temps
    let hasAccess = classInfo?.teachers?.includes(teacherId) || false;
    
    
    if (!hasAccess) {
      // Vérifier l'accès via l'emploi du temps (Schedule)
      const Schedule = require('../models/Schedule');
      
      
      
      
      
      
      // D'abord, vérifions tous les schedules de cet enseignant
      const allSchedules = await Schedule.find({ teacherId: teacherId });
      
      const scheduleAccess = await Schedule.findOne({
        teacherId: teacherId,
        classId: classId,
        subjectId: resolvedSubjectId,
        isActive: true
      });
      
      // Si pas trouvé avec la matière exacte, vérifions si l'enseignant a accès à cette classe pour n'importe quelle matière
      if (!scheduleAccess) {
        const classScheduleAccess = await Schedule.findOne({
          teacherId: teacherId,
          classId: classId,
          isActive: true
        });
        
        if (classScheduleAccess) {
          hasAccess = true;
        }
      } else {
        hasAccess = true;
      }
    }
    
    if (!classInfo || !hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à créer une évaluation pour cette classe"
      });
    }

    // Vérifier s'il y a déjà un examen pour cette matière/classe/semestre
    if (type === 'examen') {
      const existingExam = await Evaluation.checkExamConflict(
        classId, resolvedSubjectId, semester, academicYear
      );
      
      if (existingExam) {
        return res.status(400).json({
          success: false,
          message: "Un examen existe déjà pour cette matière dans cette classe pour ce semestre"
        });
      }
    }

    // Récupérer le coefficient de la matière si non fourni
    let evaluationCoefficient = coefficient;
    if (!evaluationCoefficient) {
      evaluationCoefficient = await SubjectCoefficient.getCoefficientForSubjectAndLevel(
        resolvedSubjectId,
        classInfo.level,
        schoolId,
        academicYear
      );
    }

    // Mapper et valider les données avant création
    
    
    
    
    
    // Convertir le semestre en nombre si c'est une chaîne
    let numericSemester = semester;
    if (typeof semester === 'string') {
      if (semester === '1er' || semester === '1') {
        numericSemester = 1;
      } else if (semester === '2eme' || semester === '2nd' || semester === '2') {
        numericSemester = 2;
      } else {
        numericSemester = parseInt(semester) || 1;
      }
    }
    
    // Mapper le type d'évaluation
    let evaluationType = type;
    const typeMapping = {
      'controle': 'devoir',
      'composition': 'examen',
      'oral': 'presentation',
      'projet': 'projet',
      'devoir': 'devoir'
    };
    
    if (typeMapping[type]) {
      evaluationType = typeMapping[type];
    }
    
    // Valider et formater la date
    let formattedDate = plannedDate;
    if (!formattedDate) {
      return res.status(400).json({
        success: false,
        message: "La date de l'évaluation est requise"
      });
    }
    
    // Si c'est une chaîne, la convertir en Date
    if (typeof formattedDate === 'string') {
      formattedDate = new Date(formattedDate);
      if (isNaN(formattedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Format de date invalide"
        });
      }
    }
    
    
    
    
    

    // Créer l'évaluation
    const evaluation = new Evaluation({
      teacherId,
      classId,
      subjectId: resolvedSubjectId, // Utiliser l'ID résolu
      schoolId,
      type: evaluationType,
      title,
      description,
      plannedDate: formattedDate,
      semester: numericSemester,
      academicYear,
      duration,
      maxScore: maxScore || 20,
      coefficient: evaluationCoefficient,
      instructions,
      topics,
      createdBy: teacherId
    });

    await evaluation.save();

    // Populer les références pour la réponse
    await evaluation.populate([
      { path: 'classId', select: 'name level' },
      { path: 'subjectId', select: 'name code' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Évaluation programmée avec succès',
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur création évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'évaluation',
      error: error.message
    });
  }
};

// Récupérer les évaluations d'un enseignant
const getTeacherEvaluations = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { academicYear, semester, status } = req.query;

    const query = { teacherId };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;

    const evaluations = await Evaluation.find(query)
      .populate('classId', 'name level')
      .populate('subjectId', 'name code')
      .sort({ plannedDate: -1 });

    // Calculer les statistiques pour chaque évaluation
    const evaluationsWithStats = await Promise.all(evaluations.map(async (evaluation) => {
      try {
        await evaluation.calculateStats();
        return evaluation;
      } catch (error) {
        console.error(`Erreur calcul stats pour évaluation ${evaluation._id}:`, error);
        // Retourner l'évaluation sans stats en cas d'erreur
        return evaluation;
      }
    }));

    if (evaluationsWithStats.length > 0) {
      console.log('Première évaluation avec stats:', {
        id: evaluationsWithStats[0]._id,
        title: evaluationsWithStats[0].title,
        stats: evaluationsWithStats[0].stats
      });
    }

    res.json({
      success: true,
      data: evaluationsWithStats
    });

  } catch (error) {
    console.error('Erreur récupération évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des évaluations',
      error: error.message
    });
  }
};

// Récupérer une évaluation spécifique avec les élèves de la classe
const getEvaluationWithStudents = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;

    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      teacherId
    }).populate([
      { path: 'classId', populate: { path: 'students', select: 'name email' } },
      { path: 'subjectId', select: 'name code' }
    ]);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Récupérer les notes déjà saisies pour cette évaluation
    const existingGrades = await Grade.find({
      evaluationId
    }).select('studentId score isAbsent comment');

    console.log('Notes existantes trouvées:', existingGrades.length);

    // Intégrer les notes existantes avec les données d'étudiants
    const studentsWithGrades = evaluation.classId.students.map(student => {
      const existingGrade = existingGrades.find(g => 
        g.studentId.toString() === student._id.toString()
      );
      
      console.log(`Étudiant ${student.name} (${student._id}):`, {
        hasExistingGrade: !!existingGrade,
        grade: existingGrade ? existingGrade.score : 0,
        comment: existingGrade ? existingGrade.comment : '',
        isAbsent: existingGrade ? existingGrade.isAbsent : false
      });
      
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        grade: existingGrade ? existingGrade.score : 0,
        comment: existingGrade ? existingGrade.comment : '',
        isAbsent: existingGrade ? existingGrade.isAbsent : false,
        graded: !!existingGrade
      };
    });

    console.log('Étudiants avec notes:', studentsWithGrades.length);
    console.log('Premier étudiant avec données:', studentsWithGrades[0]);
    console.log('Notes dans studentsWithGrades:', studentsWithGrades.map(s => ({ id: s._id, name: s.name, grade: s.grade, graded: s.graded })));

    res.json({
      success: true,
      data: studentsWithGrades,
      evaluation: evaluation
    });

  } catch (error) {
    console.error('Erreur récupération évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'évaluation',
      error: error.message
    });
  }
};

// Saisir les notes pour une évaluation (étape 2: saisie des notes)
const submitGrades = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { grades } = req.body; // Array of { studentId, score, isAbsent, comment }
    const teacherId = req.user.userId;

    console.log('=== DEBUT SUBMIT GRADES ===');
    console.log('evaluationId:', evaluationId);
    console.log('teacherId:', teacherId);
    console.log('nombre de notes reçues:', grades?.length);
    console.log('premier grade:', grades?.[0]);

    // Vérifier que l'évaluation appartient à l'enseignant
    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      teacherId
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    console.log('Évaluation trouvée:', evaluation.title);

    // Récupérer les informations de la matière
    const subject = await Subject.findById(evaluation.subjectId);
    console.log('Matière trouvée:', subject?.name);

    // Préparer les données pour la création des notes
    const gradesData = grades.map(grade => ({
      ...grade,
      subject: subject?.name || 'Matière inconnue'
    }));

    console.log('Données préparées pour sauvegarde:', gradesData.length, 'notes');

    // Supprimer les anciennes notes si elles existent
    const deletedCount = await Grade.deleteMany({ evaluationId });
    console.log('Notes supprimées:', deletedCount.deletedCount);

    // Créer les nouvelles notes
    const createdGrades = await Grade.createGradesFromEvaluation(evaluationId, gradesData);
    console.log('Notes créées:', createdGrades.length);

    // Mettre à jour le statut de l'évaluation
    evaluation.status = 'corrigee';
    await evaluation.save();
    console.log('Statut évaluation mis à jour');

    // Calculer la moyenne pour la réponse
    const validGrades = createdGrades.filter(g => !g.isAbsent && g.score > 0);
    const averageGrade = validGrades.length > 0 
      ? validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length 
      : 0;

    console.log('Moyenne calculée:', averageGrade);

    res.json({
      success: true,
      message: 'Notes saisies avec succès',
      data: {
        gradesCount: createdGrades.length,
        averageGrade: averageGrade,
        evaluation
      }
    });
    console.log('=== FIN SUBMIT GRADES ===');

  } catch (error) {
    console.error('Erreur saisie notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la saisie des notes',
      error: error.message
    });
  }
};

// Publier les notes d'une évaluation
const publishGrades = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;

    // Vérifier que l'évaluation appartient à l'enseignant
    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      teacherId
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Publier les notes
    const result = await Grade.publishGradesForEvaluation(evaluationId, teacherId);

    // Calculer les statistiques
    await evaluation.calculateStats();

    res.json({
      success: true,
      message: 'Notes publiées avec succès',
      data: {
        publishedCount: result.modifiedCount,
        stats: evaluation.stats
      }
    });

  } catch (error) {
    console.error('Erreur publication notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la publication des notes',
      error: error.message
    });
  }
};

// Modifier une évaluation (avant saisie des notes)
const updateEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;
    const updateData = req.body;

    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      teacherId
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Empêcher la modification si des notes ont déjà été saisies
    if (evaluation.status !== 'programmee') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier une évaluation pour laquelle des notes ont été saisies'
      });
    }

    // Mettre à jour
    Object.assign(evaluation, updateData);
    evaluation.lastModifiedBy = teacherId;
    await evaluation.save();

    await evaluation.populate([
      { path: 'classId', select: 'name level' },
      { path: 'subjectId', select: 'name code' }
    ]);

    res.json({
      success: true,
      message: 'Évaluation modifiée avec succès',
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur modification évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'évaluation',
      error: error.message
    });
  }
};

// Supprimer une évaluation
const deleteEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;

    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      teacherId
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Empêcher la suppression si des notes ont été publiées
    if (evaluation.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une évaluation dont les notes ont été publiées'
      });
    }

    // Supprimer les notes associées
    await Grade.deleteMany({ evaluationId });

    // Supprimer l'évaluation
    await Evaluation.findByIdAndDelete(evaluationId);

    res.json({
      success: true,
      message: 'Évaluation supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'évaluation',
      error: error.message
    });
  }
};

// Récupérer les statistiques d'une évaluation
const getEvaluationStats = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const teacherId = req.user.userId;

    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      teacherId
    });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Calculer les statistiques
    const stats = await evaluation.calculateStats();

    res.json({
      success: true,
      data: {
        evaluation: {
          title: evaluation.title,
          type: evaluation.type,
          plannedDate: evaluation.plannedDate,
          status: evaluation.status
        },
        stats
      }
    });

  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

module.exports = {
  createEvaluation,
  getTeacherEvaluations,
  getEvaluationWithStudents,
  submitGrades,
  publishGrades,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationStats
};
