const Bulletin = require('../models/Bulletin');
const Grade = require('../models/Grade');
const User = require('../models/User');
const Class = require('../models/Class');
const SubjectCoefficient = require('../models/SubjectCoefficient');

// Générer le bulletin d'un élève pour un semestre
const generateBulletin = async (req, res) => {
  try {
    const { studentId, classId, semester, academicYear } = req.body;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Vérifier les permissions
    if (requesterRole === 'teacher') {
      // Vérifier que l'enseignant enseigne dans cette classe
      const classInfo = await Class.findById(classId);
      if (!classInfo || !classInfo.teachers.includes(requesterId)) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à générer ce bulletin"
        });
      }
    } else if (requesterRole === 'parent') {
      // Vérifier que c'est bien l'enfant du parent
      const student = await User.findById(studentId);
      if (!student || student.parentId?.toString() !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "Vous n'êtes pas autorisé à consulter ce bulletin"
        });
      }
    } else if (requesterRole === 'student') {
      // Vérifier que c'est bien l'élève lui-même
      if (studentId !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "Vous ne pouvez consulter que votre propre bulletin"
        });
      }
    }

    // Générer le bulletin
    const bulletin = await Bulletin.generateBulletin(studentId, classId, semester, academicYear);

    res.json({
      success: true,
      message: 'Bulletin généré avec succès',
      data: bulletin
    });

  } catch (error) {
    console.error('Erreur génération bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du bulletin',
      error: error.message
    });
  }
};

// Récupérer le bulletin d'un élève
const getBulletin = async (req, res) => {
  try {
    const { studentId, semester, academicYear } = req.params;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Construire la requête
    const query = { studentId, semester: parseInt(semester), academicYear };

    // Vérifier les permissions et ajuster la requête selon le rôle
    if (requesterRole === 'student') {
      if (studentId !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }
      query.isPublished = true; // Les élèves ne voient que les bulletins publiés
    } else if (requesterRole === 'parent') {
      const student = await User.findById(studentId);
      if (!student || student.parentId?.toString() !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }
      query.isPublished = true; // Les parents ne voient que les bulletins publiés
    } else if (requesterRole === 'teacher') {
      // Les enseignants peuvent voir les brouillons de leurs classes
      const bulletin = await Bulletin.findOne(query);
      if (bulletin) {
        const classInfo = await Class.findById(bulletin.classId);
        if (!classInfo || !classInfo.teachers.includes(requesterId)) {
          return res.status(403).json({
            success: false,
            message: "Accès non autorisé"
          });
        }
      }
    }

    const bulletin = await Bulletin.findOne(query)
      .populate('studentId', 'name email dateOfBirth')
      .populate('classId', 'name level');

    if (!bulletin) {
      return res.status(404).json({
        success: false,
        message: 'Bulletin non trouvé'
      });
    }

    res.json({
      success: true,
      data: bulletin
    });

  } catch (error) {
    console.error('Erreur récupération bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du bulletin',
      error: error.message
    });
  }
};

// Calculer les classements pour une classe
const calculateClassRankings = async (req, res) => {
  try {
    const { classId, semester, academicYear } = req.body;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Vérifier les permissions (admin, directeur ou professeur principal)
    if (requesterRole !== 'admin' && requesterRole !== 'super_user') {
      const classInfo = await Class.findById(classId);
      if (!classInfo) {
        return res.status(404).json({
          success: false,
          message: 'Classe non trouvée'
        });
      }

      if (requesterRole === 'teacher' && classInfo.resTeacher?.toString() !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "Seul le professeur principal peut calculer les classements"
        });
      }
    }

    // Calculer les classements
    const bulletins = await Bulletin.calculateClassRankings(classId, semester, academicYear);

    res.json({
      success: true,
      message: 'Classements calculés avec succès',
      data: {
        classId,
        semester,
        academicYear,
        bulletinsCount: bulletins.length,
        bulletins: bulletins.map(b => ({
          studentId: b.studentId,
          studentName: b.studentInfo.name,
          generalAverage: b.generalAverage,
          rank: b.rankInClass
        }))
      }
    });

  } catch (error) {
    console.error('Erreur calcul classements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des classements',
      error: error.message
    });
  }
};

// Publier les bulletins d'une classe
const publishClassBulletins = async (req, res) => {
  try {
    const { classId, semester, academicYear } = req.body;
    const validatedBy = req.user.userId;
    const requesterRole = req.user.role;

    // Vérifier les permissions (admin ou directeur)
    if (requesterRole !== 'admin' && requesterRole !== 'super_user') {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent publier les bulletins"
      });
    }

    // Récupérer tous les bulletins de la classe pour ce semestre
    const bulletins = await Bulletin.find({
      classId,
      semester,
      academicYear,
      status: { $in: ['brouillon', 'provisoire', 'definitif'] }
    });

    if (bulletins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun bulletin trouvé pour cette classe et ce semestre'
      });
    }

    // Publier tous les bulletins
    const publishedBulletins = [];
    for (const bulletin of bulletins) {
      await bulletin.publish(validatedBy);
      publishedBulletins.push(bulletin);
    }

    res.json({
      success: true,
      message: `${publishedBulletins.length} bulletins publiés avec succès`,
      data: {
        publishedCount: publishedBulletins.length,
        classId,
        semester,
        academicYear
      }
    });

  } catch (error) {
    console.error('Erreur publication bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la publication des bulletins',
      error: error.message
    });
  }
};

// Récupérer les bulletins d'une classe
const getClassBulletins = async (req, res) => {
  try {
    const { classId } = req.params;
    const { semester, academicYear, status } = req.query;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Vérifier les permissions
    if (requesterRole === 'teacher') {
      const classInfo = await Class.findById(classId);
      if (!classInfo || !classInfo.teachers.includes(requesterId)) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé à cette classe"
        });
      }
    }

    // Construire la requête
    const query = { classId };
    if (semester) query.semester = parseInt(semester);
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    // Les enseignants ne voient que les bulletins publiés sauf s'ils sont prof principal
    if (requesterRole === 'teacher') {
      const classInfo = await Class.findById(classId);
      if (classInfo.resTeacher?.toString() !== requesterId) {
        query.isPublished = true;
      }
    }

    const bulletins = await Bulletin.find(query)
      .populate('studentId', 'name email')
      .sort({ rankInClass: 1, 'studentInfo.name': 1 });

    res.json({
      success: true,
      data: bulletins
    });

  } catch (error) {
    console.error('Erreur récupération bulletins classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des bulletins',
      error: error.message
    });
  }
};

// Ajouter un commentaire à un bulletin
const addBulletinComment = async (req, res) => {
  try {
    const { bulletinId } = req.params;
    const { comment, commentType } = req.body; // commentType: 'main_teacher', 'principal'
    const commenterId = req.user.userId;
    const requesterRole = req.user.role;

    const bulletin = await Bulletin.findById(bulletinId);
    if (!bulletin) {
      return res.status(404).json({
        success: false,
        message: 'Bulletin non trouvé'
      });
    }

    // Vérifier les permissions selon le type de commentaire
    if (commentType === 'main_teacher') {
      if (requesterRole !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: "Seuls les enseignants peuvent ajouter des commentaires pédagogiques"
        });
      }
      
      const classInfo = await Class.findById(bulletin.classId);
      if (classInfo.resTeacher?.toString() !== commenterId) {
        return res.status(403).json({
          success: false,
          message: "Seul le professeur principal peut ajouter ce commentaire"
        });
      }
      
      bulletin.mainTeacherComment = comment;
    } else if (commentType === 'principal') {
      if (requesterRole !== 'admin' && requesterRole !== 'super_user') {
        return res.status(403).json({
          success: false,
          message: "Seuls les administrateurs peuvent ajouter des commentaires de direction"
        });
      }
      
      bulletin.principalComment = comment;
    } else {
      return res.status(400).json({
        success: false,
        message: "Type de commentaire invalide"
      });
    }

    await bulletin.save();

    res.json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: bulletin
    });

  } catch (error) {
    console.error('Erreur ajout commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};

// Récupérer les moyennes d'un élève pour toutes les matières
const getStudentAverages = async (req, res) => {
  try {
    const { studentId, semester, academicYear } = req.params;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Vérifier les permissions
    if (requesterRole === 'student' && studentId !== requesterId) {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    }

    if (requesterRole === 'parent') {
      const student = await User.findById(studentId);
      if (!student || student.parentId?.toString() !== requesterId) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }
    }

    // Récupérer l'élève et sa classe
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    // Calculer les moyennes pour chaque matière
    const grades = await Grade.find({
      studentId,
      semester: parseInt(semester),
      academicYear,
      isPublished: true,
      isAbsent: false
    });

    // Grouper par matière
    const subjectAverages = {};
    
    for (const grade of grades) {
      if (!subjectAverages[grade.subject]) {
        subjectAverages[grade.subject] = {
          subject: grade.subject,
          homeworks: [],
          exams: []
        };
      }
      
      if (grade.evaluationType === 'examen') {
        subjectAverages[grade.subject].exams.push(grade);
      } else {
        subjectAverages[grade.subject].homeworks.push(grade);
      }
    }

    // Calculer les moyennes détaillées
    const results = [];
    for (const [subjectName, data] of Object.entries(subjectAverages)) {
      const average = await Grade.calculateSubjectAverage(
        studentId, 
        subjectName, 
        parseInt(semester), 
        academicYear
      );
      
      if (average) {
        results.push({
          subject: subjectName,
          ...average
        });
      }
    }

    res.json({
      success: true,
      data: {
        studentId,
        studentName: student.name,
        semester: parseInt(semester),
        academicYear,
        subjects: results
      }
    });

  } catch (error) {
    console.error('Erreur récupération moyennes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des moyennes',
      error: error.message
    });
  }
};

module.exports = {
  generateBulletin,
  getBulletin,
  calculateClassRankings,
  publishClassBulletins,
  getClassBulletins,
  addBulletinComment,
  getStudentAverages
};