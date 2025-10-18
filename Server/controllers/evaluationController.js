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
      console.log('Recherche matière:', subject, 'dans école:', schoolId);
      
      // Si pas de schoolId, utiliser la première école disponible
      let searchSchoolId = schoolId;
      if (!searchSchoolId) {
        const School = require('../models/School');
        const firstSchool = await School.findOne({});
        if (firstSchool) {
          searchSchoolId = firstSchool._id;
          console.log('Utilisation de l\'école par défaut:', firstSchool.name, '(ID:', firstSchool._id, ')');
        }
      }
      
      const subjectDoc = await Subject.findOne({ 
        name: subject,
        schoolId: searchSchoolId 
      });
      console.log('Matière trouvée:', subjectDoc);
      if (subjectDoc) {
        resolvedSubjectId = subjectDoc._id;
      } else {
        // Vérifions toutes les matières de cette école
        const allSubjects = await Subject.find({ schoolId: searchSchoolId });
        console.log('Toutes les matières de cette école:', allSubjects.map(s => s.name));
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
    console.log('Vérification des droits d\'accès...');
    console.log('ID enseignant:', teacherId);
    console.log('Classe trouvée:', classInfo ? 'OUI' : 'NON');
    if (classInfo) {
      console.log('Enseignants de la classe:', classInfo.teachers);
      console.log('Nom de la classe:', classInfo.name);
    }
    
    // Vérifier l'accès via assignation directe ou via l'emploi du temps
    let hasAccess = classInfo?.teachers?.includes(teacherId) || false;
    console.log('Accès via assignation directe:', hasAccess);
    
    if (!hasAccess) {
      // Vérifier l'accès via l'emploi du temps (Schedule)
      const Schedule = require('../models/Schedule');
      
      console.log('Recherche dans Schedule avec:');
      console.log('  teacherId:', teacherId);
      console.log('  classId:', classId);
      console.log('  subjectId:', resolvedSubjectId);
      
      // D'abord, vérifions tous les schedules de cet enseignant
      const allSchedules = await Schedule.find({ teacherId: teacherId });
      console.log(`Tous les schedules de l'enseignant (${allSchedules.length}):`, 
        allSchedules.map(s => ({
          classId: s.classId,
          subjectId: s.subjectId,
          isActive: s.isActive
        }))
      );
      
      const scheduleAccess = await Schedule.findOne({
        teacherId: teacherId,
        classId: classId,
        subjectId: resolvedSubjectId,
        isActive: true
      });
      
      console.log('Vérification accès via Schedule (même classe + même matière):', scheduleAccess ? 'Trouvé' : 'Non trouvé');
      
      // Si pas trouvé avec la matière exacte, vérifions si l'enseignant a accès à cette classe pour n'importe quelle matière
      if (!scheduleAccess) {
        const classScheduleAccess = await Schedule.findOne({
          teacherId: teacherId,
          classId: classId,
          isActive: true
        });
        
        console.log('Vérification accès via Schedule (même classe, toute matière):', classScheduleAccess ? 'Trouvé' : 'Non trouvé');
        
        if (classScheduleAccess) {
          console.log('Schedule trouvé pour la classe (autre matière):', {
            classId: classScheduleAccess.classId,
            subjectId: classScheduleAccess.subjectId,
            matière_demandée: resolvedSubjectId,
            matière_trouvée: classScheduleAccess.subjectId
          });
          hasAccess = true;
        }
      } else {
        console.log('Schedule trouvé (même classe + même matière):', scheduleAccess);
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
    console.log('Données reçues pour création évaluation:');
    console.log('- type:', type);
    console.log('- semester:', semester, '(type:', typeof semester, ')');
    console.log('- plannedDate:', plannedDate);
    
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
    
    console.log('Données converties:');
    console.log('- evaluationType:', evaluationType);
    console.log('- numericSemester:', numericSemester);
    console.log('- formattedDate:', formattedDate);

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

    console.log('Récupération évaluations pour teacherId:', teacherId);

    const query = { teacherId };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;

    const evaluations = await Evaluation.find(query)
      .populate('classId', 'name level')
      .populate('subjectId', 'name code')
      .sort({ plannedDate: -1 });

    console.log('Évaluations trouvées:', evaluations.length);
    if (evaluations.length > 0) {
      console.log('Première évaluation:', {
        id: evaluations[0]._id,
        title: evaluations[0].title,
        subjectId: evaluations[0].subjectId,
        classId: evaluations[0].classId
      });
    }

    res.json({
      success: true,
      data: evaluations
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

    console.log('DEBUG - Evaluation found:', evaluation);
    console.log('DEBUG - Students from classId:', evaluation.classId.students);
    console.log('DEBUG - First student:', evaluation.classId.students?.[0]);

    res.json({
      success: true,
      data: {
        evaluation,
        students: evaluation.classId.students,
        existingGrades: existingGrades
      }
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

    console.log('[DEBUG] submitGrades - Début sauvegarde des notes');
    console.log('[DEBUG] evaluationId:', evaluationId);
    console.log('[DEBUG] teacherId:', teacherId);
    console.log('[DEBUG] grades reçues:', JSON.stringify(grades, null, 2));

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

    // Récupérer les informations de la matière
    const subject = await Subject.findById(evaluation.subjectId);

    // Préparer les données pour la création des notes
    const gradesData = grades.map(grade => ({
      ...grade,
      subject: subject.name
    }));

    // Supprimer les anciennes notes si elles existent
    await Grade.deleteMany({ evaluationId });

    // Créer les nouvelles notes
    console.log('[DEBUG] Données à sauvegarder:', JSON.stringify(gradesData, null, 2));
    const createdGrades = await Grade.createGradesFromEvaluation(evaluationId, gradesData);
    console.log('[DEBUG] Notes créées avec succès, nombre:', createdGrades.length);

    // Mettre à jour le statut de l'évaluation
    evaluation.status = 'corrigee';
    await evaluation.save();
    console.log('[DEBUG] Évaluation mise à jour avec statut: corrigee');

    res.json({
      success: true,
      message: 'Notes saisies avec succès',
      data: {
        gradesCount: createdGrades.length,
        evaluation
      }
    });

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