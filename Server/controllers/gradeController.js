const Grade = require('../models/Grade');
const User = require('../models/User');
const Class = require('../models/Class');
const Evaluation = require('../models/Evaluation');
const mongoose = require('mongoose');

// Obtenir toutes les notes d'une classe par matière, semestre et année académique
exports.getClassGrades = async (req, res) => {
  try {
    const { classId, subject, semester, academicYear } = req.query;
    
    // Validation des paramètres requis
    if (!classId || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les paramètres classId et subject sont obligatoires' 
      });
    }
    
    // Préparation de la requête
    const query = { 
      classId, 
      subject
    };
    
    // Ajout des filtres optionnels s'ils sont fournis
    if (semester) query.semester = semester;
    if (academicYear) query.academicYear = academicYear;
    
    // Récupération des notes et population des données étudiants
    const grades = await Grade.find(query)
      .populate('studentId', 'name email')
      .populate('teacherId', 'name')
      .sort({ 'studentId.name': 1, evaluationDate: -1 });
      
    // Calcul de la moyenne de classe si demandé
    let classAverage = null;
    if (semester && academicYear) {
      classAverage = await Grade.calculateClassAverage(classId, subject, parseInt(semester), academicYear);
    }
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        grades,
        classAverage: classAverage ? parseFloat(classAverage.toFixed(2)) : null
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes de classe:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des notes',
      error: error.message
    });
  }
};

// Obtenir les notes d'un étudiant spécifique
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, semester, academicYear } = req.query;
    
    // Vérification de l'existence de l'étudiant
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }
    
    // Préparation de la requête
    const query = { 
      studentId,
      isPublished: true // Ne renvoyer que les notes publiées
    };
    
    // Ajout des filtres optionnels s'ils sont fournis
    if (subject) query.subject = subject;
    if (semester) query.semester = parseInt(semester);
    if (academicYear) query.academicYear = academicYear;
    
    // Récupération des notes
    const grades = await Grade.find(query)
      .populate('teacherId', 'name')
      .sort({ subject: 1, evaluationDate: -1 });
    
    // Calcul de moyennes par matière si demandé
    let averages = {};
    if (semester && academicYear) {
      // Récupérer toutes les matières pour lesquelles l'étudiant a des notes
      const subjects = [...new Set(grades.map(grade => grade.subject))];
      
      // Calculer la moyenne pour chaque matière
      for (const subj of subjects) {
        const average = await Grade.calculateAverage(
          studentId, 
          subj, 
          parseInt(semester), 
          academicYear
        );
        if (average !== null) {
          averages[subj] = parseFloat(average.toFixed(2));
        }
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        grades,
        averages
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes d\'étudiant:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des notes',
      error: error.message
    });
  }
};

// Créer une nouvelle note
exports.createGrade = async (req, res) => {
  try {
    const {
      studentId,
      classId,
      subject,
      evaluationType,
      score,
      maxScore,
      title,
      description,
      comment,
      semester,
      academicYear,
      coefficient,
      homeworkId,
      isPublished
    } = req.body;
    
    // Validation des champs obligatoires
    if (!studentId || !classId || !subject || !evaluationType || score === undefined || !title || !semester || !academicYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir tous les champs obligatoires' 
      });
    }
    
    // Vérification que l'étudiant existe
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }
    
    // Vérification que la classe existe
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ 
        success: false, 
        message: 'Classe non trouvée' 
      });
    }
    
    // Vérification que l'enseignant est authentifié et a les droits
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé. Seuls les enseignants peuvent créer des notes.' 
      });
    }
    
    // NOTE: Cette méthode est dépréciée mais maintenue temporairement pour compatibilité
    // Les nouvelles notes doivent être créées via le système d'évaluation en 2 étapes
    
    // Création d'une évaluation temporaire pour maintenir la compatibilité
    const tempEvaluation = await Evaluation.create({
      teacherId: req.user.userId,
      classId,
      subjectId: null, // Sera mis à jour plus tard si nécessaire
      schoolId: req.user.schoolId,
      title: title + ' (Migration)',
      type: evaluationType,
      plannedDate: new Date(),
      semester,
      academicYear,
      status: 'terminee',
      maxScore: maxScore || 20,
      coefficient: coefficient || 1,
      isLegacyGrade: true // Marqueur pour les notes migrées
    });

    // Création de la note avec la référence à l'évaluation temporaire
    const newGrade = new Grade({
      studentId,
      teacherId: req.user.userId,
      classId,
      schoolId: req.user.schoolId,
      evaluationId: tempEvaluation._id, // Référence à l'évaluation temporaire
      subject,
      evaluationType,
      score,
      maxScore: maxScore || 20,
      title,
      description,
      comment,
      semester,
      academicYear,
      coefficient: coefficient || 1,
      isPublished: isPublished !== undefined ? isPublished : false,
      isLegacyGrade: true // Marqueur pour les notes créées via l'ancien système
    });
    
    // Sauvegarde de la note dans la base de données
    await newGrade.save();
    
    return res.status(201).json({ 
      success: true, 
      message: 'Note créée avec succès', 
      data: newGrade 
    });
  } catch (error) {
    console.error('Erreur lors de la création d\'une note:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création de la note',
      error: error.message
    });
  }
};

// Mettre à jour une note existante
exports.updateGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const updateData = req.body;
    
    // Vérification que la note existe
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note non trouvée' 
      });
    }
    
    // Vérification des droits d'accès (seul le professeur qui a créé la note peut la modifier)
    if (grade.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous n\'êtes pas autorisé à modifier cette note' 
      });
    }
    
    // Mise à jour des champs autorisés
    const allowedFields = [
      'score', 'maxScore', 'title', 'description', 'comment', 
      'evaluationType', 'coefficient', 'isPublished'
    ];
    
    const updateFields = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });
    
    // Mise à jour de la note
    const updatedGrade = await Grade.findByIdAndUpdate(
      gradeId, 
      updateFields, 
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({ 
      success: true, 
      message: 'Note mise à jour avec succès', 
      data: updatedGrade 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'une note:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour de la note',
      error: error.message
    });
  }
};

// Supprimer une note
exports.deleteGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    
    // Vérification que la note existe
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note non trouvée' 
      });
    }
    
    // Vérification des droits d'accès (seul le professeur qui a créé la note ou un admin peut la supprimer)
    if (grade.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous n\'êtes pas autorisé à supprimer cette note' 
      });
    }
    
    // Suppression de la note
    await Grade.findByIdAndDelete(gradeId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Note supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une note:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la suppression de la note',
      error: error.message
    });
  }
};

// Obtenir le bulletin complet d'un étudiant
exports.getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, academicYear } = req.query;
    
    // Vérification des paramètres obligatoires
    if (!semester || !academicYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le semestre et l\'année académique sont obligatoires' 
      });
    }
    
    // Vérification que l'étudiant existe
    const student = await User.findById(studentId)
      .populate('classId');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }
    
    // Récupération de toutes les matières pour la classe de l'étudiant
    const classObj = await Class.findById(student.classId);
    if (!classObj) {
      return res.status(404).json({ 
        success: false, 
        message: 'Classe de l\'étudiant non trouvée' 
      });
    }
    
    const subjects = classObj.subjects;
    
    // Récupération de toutes les notes publiées de l'étudiant
    const grades = await Grade.find({
      studentId,
      semester: parseInt(semester),
      academicYear,
      isPublished: true
    }).sort({ subject: 1, evaluationDate: 1 });
    
    // Préparation du bulletin
    const report = {
      studentInfo: {
        id: student._id,
        name: student.name,
        class: student.classId ? student.classId.name : 'Non assigné'
      },
      academicInfo: {
        semester,
        academicYear
      },
      subjects: [],
      generalAverage: 0,
      totalCoefficient: 0
    };
    
    // Organisation des notes par matière
    const gradesBySubject = {};
    subjects.forEach(subject => {
      gradesBySubject[subject] = [];
    });
    
    grades.forEach(grade => {
      if (gradesBySubject[grade.subject]) {
        gradesBySubject[grade.subject].push(grade);
      }
    });
    
    // Calcul des moyennes par matière
    let totalWeightedAverage = 0;
    let totalCoefficient = 0;
    
    for (const subject of subjects) {
      const subjectGrades = gradesBySubject[subject] || [];
      
      // Calculer la moyenne de la matière
      const average = await Grade.calculateAverage(
        studentId, 
        subject, 
        parseInt(semester), 
        academicYear
      );
      
      // Récupérer un coefficient standard pour la matière (à partir de la première note ou par défaut 1)
      const subjectCoefficient = subjectGrades.length > 0 ? subjectGrades[0].coefficient : 1;
      
      report.subjects.push({
        name: subject,
        grades: subjectGrades,
        average: average !== null ? parseFloat(average.toFixed(2)) : null,
        coefficient: subjectCoefficient
      });
      
      // Ajouter à la moyenne générale si une moyenne est disponible
      if (average !== null) {
        totalWeightedAverage += average * subjectCoefficient;
        totalCoefficient += subjectCoefficient;
      }
    }
    
    // Calcul de la moyenne générale
    if (totalCoefficient > 0) {
      report.generalAverage = parseFloat((totalWeightedAverage / totalCoefficient).toFixed(2));
      report.totalCoefficient = totalCoefficient;
    }
    
    return res.status(200).json({ 
      success: true, 
      data: report 
    });
  } catch (error) {
    console.error('Erreur lors de la génération du bulletin:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la génération du bulletin',
      error: error.message
    });
  }
};

// Publier ou dépublier des notes (en lot)
exports.toggleGradePublishStatus = async (req, res) => {
  try {
    const { gradeIds, isPublished } = req.body;
    
    if (!Array.isArray(gradeIds) || gradeIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir une liste d\'identifiants de notes valides' 
      });
    }
    
    // Vérifier que l'utilisateur est autorisé à publier/dépublier ces notes
    const grades = await Grade.find({ _id: { $in: gradeIds } });
    
    // Si certaines notes n'existent pas
    if (grades.length !== gradeIds.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certaines notes n\'ont pas été trouvées' 
      });
    }
    
    // Vérifier que l'utilisateur est bien le professeur de toutes ces notes
    const unauthorizedGrades = grades.filter(
      grade => grade.teacherId.toString() !== req.user._id.toString()
    );
    
    if (unauthorizedGrades.length > 0 && req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous n\'êtes pas autorisé à modifier certaines de ces notes' 
      });
    }
    
    // Mettre à jour le statut de publication
    await Grade.updateMany(
      { _id: { $in: gradeIds } },
      { $set: { isPublished } }
    );
    
    return res.status(200).json({ 
      success: true, 
      message: isPublished 
        ? 'Notes publiées avec succès' 
        : 'Notes dépubliées avec succès',
      count: gradeIds.length
    });
  } catch (error) {
    console.error('Erreur lors de la modification du statut de publication:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la modification du statut de publication',
      error: error.message
    });
  }
};

// Nouvelles méthodes pour les évaluations d'enseignants

// Obtenir les évaluations d'un enseignant
exports.getTeacherAssessments = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    
    // Récupérer toutes les évaluations créées par cet enseignant
    const assessments = await Grade.find({ 
      teacherId: teacherId,
      evaluationType: { $exists: true } // Assurer qu'il s'agit d'évaluations
    })
    .populate('classId', 'name level')
    .populate('studentId', 'name')
    .sort({ evaluationDate: -1 });
    
    // Grouper par évaluation (titre, classe, matière, date)
    const groupedAssessments = {};
    
    assessments.forEach(assessment => {
      const key = `${assessment.title}_${assessment.classId?._id}_${assessment.subject}_${assessment.evaluationDate}`;
      
      if (!groupedAssessments[key]) {
        groupedAssessments[key] = {
          _id: assessment._id,
          title: assessment.title,
          className: assessment.classId?.name || 'Classe inconnue',
          classId: assessment.classId?._id,
          subject: assessment.subject,
          evaluationType: assessment.evaluationType,
          evaluationDate: assessment.evaluationDate,
          semester: assessment.semester,
          academicYear: assessment.academicYear,
          description: assessment.description,
          totalStudents: 0,
          gradedStudents: 0,
          averageGrade: 0,
          status: 'pending'
        };
      }
      
      groupedAssessments[key].totalStudents++;
      if (assessment.score !== undefined && assessment.score !== null) {
        groupedAssessments[key].gradedStudents++;
      }
    });
    
    // Calculer les moyennes et statuts
    Object.values(groupedAssessments).forEach(assessment => {
      if (assessment.gradedStudents > 0) {
        const relevantGrades = assessments.filter(g => 
          g.title === assessment.title && 
          g.classId?.name === assessment.className &&
          g.subject === assessment.subject &&
          g.score !== undefined && g.score !== null
        );
        
        const totalScore = relevantGrades.reduce((sum, g) => sum + g.score, 0);
        assessment.averageGrade = totalScore / relevantGrades.length;
        
        if (assessment.gradedStudents === assessment.totalStudents) {
          assessment.status = 'completed';
        } else {
          assessment.status = 'inProgress';
        }
      }
    });
    
    return res.status(200).json({
      success: true,
      data: Object.values(groupedAssessments)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des évaluations',
      error: error.message
    });
  }
};

// Créer une nouvelle évaluation
exports.createAssessment = async (req, res) => {
  try {
    // Cette méthode est dépréciée en faveur du nouveau système d'évaluation
    return res.status(410).json({
      success: false,
      message: 'Cette méthode de création d\'évaluation est dépréciée. Veuillez utiliser le nouveau système d\'évaluation en 2 étapes.',
      details: {
        reason: 'Migration vers le nouveau système d\'évaluation',
        newEndpoint: '/api/evaluations',
        workflow: [
          '1. Créer une évaluation via POST /api/evaluations',
          '2. Saisir les notes via POST /api/evaluations/:id/grades'
        ]
      },
      redirectTo: '/api/evaluations'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'évaluation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'évaluation',
      error: error.message
    });
  }
};

// Obtenir les notes d'une évaluation spécifique
exports.getAssessmentGrades = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    // Récupérer l'évaluation de référence
    const referenceAssessment = await Grade.findById(assessmentId);
    if (!referenceAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    // Récupérer toutes les notes de cette évaluation
    const grades = await Grade.find({
      title: referenceAssessment.title,
      classId: referenceAssessment.classId,
      subject: referenceAssessment.subject,
      evaluationDate: referenceAssessment.evaluationDate
    })
    .populate('studentId', 'name email')
    .sort({ 'studentId.name': 1 });
    
    return res.status(200).json({
      success: true,
      data: grades.map(grade => ({
        studentId: grade.studentId._id,
        score: grade.score,
        comment: grade.comment || ''
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes d\'évaluation:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notes',
      error: error.message
    });
  }
};

// Soumettre les notes d'une évaluation
exports.submitAssessmentGrades = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { grades } = req.body;
    
    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre grades est requis et doit être un tableau'
      });
    }
    
    // Récupérer l'évaluation de référence
    const referenceAssessment = await Grade.findById(assessmentId);
    if (!referenceAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }
    
    // Mettre à jour les notes
    const updatePromises = grades.map(async (gradeData) => {
      const { studentId, score, comment } = gradeData;
      
      return await Grade.findOneAndUpdate(
        {
          studentId: studentId,
          title: referenceAssessment.title,
          classId: referenceAssessment.classId,
          subject: referenceAssessment.subject,
          evaluationDate: referenceAssessment.evaluationDate
        },
        {
          score: score,
          comment: comment || '',
          gradedDate: new Date()
        },
        { new: true }
      );
    });
    
    const updatedGrades = await Promise.all(updatePromises);
    
    // Calculer la moyenne
    const validGrades = updatedGrades.filter(g => g && g.score !== null);
    const averageGrade = validGrades.length > 0 
      ? validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length 
      : 0;
    
    return res.status(200).json({
      success: true,
      message: `${grades.length} note(s) enregistrée(s) avec succès`,
      data: {
        updatedCount: updatedGrades.filter(g => g !== null).length,
        averageGrade: averageGrade
      }
    });
  } catch (error) {
    console.error('Erreur lors de la soumission des notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la soumission des notes',
      error: error.message
    });
  }
};