const SubjectCoefficient = require('../models/SubjectCoefficient');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

// Initialiser les coefficients par défaut pour une école
const initializeDefaultCoefficients = async (req, res) => {
  try {
    const { academicYear } = req.body;
    const schoolId = req.user.schoolId;
    const adminId = req.user.userId;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent initialiser les coefficients"
      });
    }

    // Initialiser les coefficients par défaut
    const coefficients = await SubjectCoefficient.initializeDefaultCoefficients(
      schoolId, 
      academicYear, 
      adminId
    );

    res.json({
      success: true,
      message: `${coefficients.length} coefficients par défaut créés avec succès`,
      data: coefficients
    });

  } catch (error) {
    console.error('Erreur initialisation coefficients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation des coefficients',
      error: error.message
    });
  }
};

// Récupérer tous les coefficients d'une école
const getSchoolCoefficients = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { academicYear, classLevel } = req.query;

    const query = { schoolId, isActive: true };
    if (academicYear) query.academicYear = academicYear;
    if (classLevel) query.classLevel = classLevel;

    const coefficients = await SubjectCoefficient.find(query)
      .populate('subjectId', 'name code')
      .populate('createdBy', 'name')
      .sort({ classLevel: 1, 'subjectId.name': 1 });

    // Grouper par niveau de classe
    const groupedCoefficients = {};
    coefficients.forEach(coeff => {
      if (!groupedCoefficients[coeff.classLevel]) {
        groupedCoefficients[coeff.classLevel] = [];
      }
      groupedCoefficients[coeff.classLevel].push(coeff);
    });

    res.json({
      success: true,
      data: {
        coefficients,
        groupedByLevel: groupedCoefficients
      }
    });

  } catch (error) {
    console.error('Erreur récupération coefficients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des coefficients',
      error: error.message
    });
  }
};

// Créer ou modifier un coefficient
const upsertCoefficient = async (req, res) => {
  try {
    const { subjectId, classLevel, coefficient, academicYear, notes } = req.body;
    const schoolId = req.user.schoolId;
    const adminId = req.user.userId;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent modifier les coefficients"
      });
    }

    // Vérifier que la matière existe
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    // Chercher s'il existe déjà un coefficient
    let existingCoefficient = await SubjectCoefficient.findOne({
      subjectId,
      classLevel,
      schoolId,
      academicYear
    });

    if (existingCoefficient) {
      // Modifier le coefficient existant
      existingCoefficient.coefficient = coefficient;
      existingCoefficient.notes = notes;
      existingCoefficient.createdBy = adminId;
      await existingCoefficient.save();
      
      await existingCoefficient.populate('subjectId', 'name code');
      
      res.json({
        success: true,
        message: 'Coefficient modifié avec succès',
        data: existingCoefficient
      });
    } else {
      // Créer un nouveau coefficient
      const newCoefficient = new SubjectCoefficient({
        subjectId,
        classLevel,
        coefficient,
        schoolId,
        academicYear,
        notes,
        createdBy: adminId
      });

      await newCoefficient.save();
      await newCoefficient.populate('subjectId', 'name code');

      res.status(201).json({
        success: true,
        message: 'Coefficient créé avec succès',
        data: newCoefficient
      });
    }

  } catch (error) {
    console.error('Erreur création/modification coefficient:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un coefficient existe déjà pour cette matière et ce niveau'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création/modification du coefficient',
      error: error.message
    });
  }
};

// Supprimer un coefficient
const deleteCoefficient = async (req, res) => {
  try {
    const { coefficientId } = req.params;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent supprimer les coefficients"
      });
    }

    const coefficient = await SubjectCoefficient.findOneAndDelete({
      _id: coefficientId,
      schoolId: req.user.schoolId
    });

    if (!coefficient) {
      return res.status(404).json({
        success: false,
        message: 'Coefficient non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Coefficient supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression coefficient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du coefficient',
      error: error.message
    });
  }
};

// Désactiver un coefficient au lieu de le supprimer
const deactivateCoefficient = async (req, res) => {
  try {
    const { coefficientId } = req.params;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent désactiver les coefficients"
      });
    }

    const coefficient = await SubjectCoefficient.findOneAndUpdate(
      { _id: coefficientId, schoolId: req.user.schoolId },
      { isActive: false },
      { new: true }
    ).populate('subjectId', 'name code');

    if (!coefficient) {
      return res.status(404).json({
        success: false,
        message: 'Coefficient non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Coefficient désactivé avec succès',
      data: coefficient
    });

  } catch (error) {
    console.error('Erreur désactivation coefficient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation du coefficient',
      error: error.message
    });
  }
};

// Récupérer le coefficient d'une matière pour un niveau donné
const getCoefficientForSubjectAndLevel = async (req, res) => {
  try {
    const { subjectId, classLevel, academicYear } = req.params;
    const schoolId = req.user.schoolId;

    const coefficient = await SubjectCoefficient.getCoefficientForSubjectAndLevel(
      subjectId,
      classLevel,
      schoolId,
      academicYear
    );

    res.json({
      success: true,
      data: {
        subjectId,
        classLevel,
        academicYear,
        coefficient
      }
    });

  } catch (error) {
    console.error('Erreur récupération coefficient:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du coefficient',
      error: error.message
    });
  }
};

// Récupérer les niveaux de classe disponibles dans l'école
const getAvailableClassLevels = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    // Récupérer les niveaux uniques des classes de l'école
    const classLevels = await Class.distinct('level', { schoolId });

    // Niveaux standard du système sénégalais
    const standardLevels = [
      '6ème', '5ème', '4ème', '3ème',
      '2nde', '1ère S', '1ère L', '1ère ES',
      'Terminale S', 'Terminale L', 'Terminale ES'
    ];

    // Combiner et dédupliquer
    const allLevels = [...new Set([...classLevels, ...standardLevels])];

    res.json({
      success: true,
      data: {
        classLevelsInSchool: classLevels,
        standardLevels,
        allAvailableLevels: allLevels
      }
    });

  } catch (error) {
    console.error('Erreur récupération niveaux:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des niveaux',
      error: error.message
    });
  }
};

// Copier les coefficients d'une année vers une autre
const copyCoefficientsToNewYear = async (req, res) => {
  try {
    const { sourceYear, targetYear } = req.body;
    const schoolId = req.user.schoolId;
    const adminId = req.user.userId;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_user') {
      return res.status(403).json({
        success: false,
        message: "Seuls les administrateurs peuvent copier les coefficients"
      });
    }

    // Récupérer les coefficients de l'année source
    const sourceCoefficients = await SubjectCoefficient.find({
      schoolId,
      academicYear: sourceYear,
      isActive: true
    });

    if (sourceCoefficients.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucun coefficient trouvé pour l'année ${sourceYear}`
      });
    }

    // Créer les nouveaux coefficients pour l'année cible
    const newCoefficients = [];
    for (const sourceCoeff of sourceCoefficients) {
      try {
        const newCoeff = new SubjectCoefficient({
          subjectId: sourceCoeff.subjectId,
          classLevel: sourceCoeff.classLevel,
          coefficient: sourceCoeff.coefficient,
          schoolId,
          academicYear: targetYear,
          notes: `Copié depuis ${sourceYear}`,
          createdBy: adminId
        });

        await newCoeff.save();
        newCoefficients.push(newCoeff);
      } catch (error) {
        // Ignorer les doublons
        if (error.code !== 11000) {
          console.error('Erreur copie coefficient:', error);
        }
      }
    }

    res.json({
      success: true,
      message: `${newCoefficients.length} coefficients copiés avec succès`,
      data: {
        sourceYear,
        targetYear,
        copiedCount: newCoefficients.length,
        totalSourceCount: sourceCoefficients.length
      }
    });

  } catch (error) {
    console.error('Erreur copie coefficients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la copie des coefficients',
      error: error.message
    });
  }
};

module.exports = {
  initializeDefaultCoefficients,
  getSchoolCoefficients,
  upsertCoefficient,
  deleteCoefficient,
  deactivateCoefficient,
  getCoefficientForSubjectAndLevel,
  getAvailableClassLevels,
  copyCoefficientsToNewYear
};