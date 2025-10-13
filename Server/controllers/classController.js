const Class = require('../models/Class');
const School = require('../models/School');
const mongoose = require('mongoose');

// Créer une nouvelle classe
exports.createClass = async (req, res) => {
  try {
    const { 
      name, level, section, room, capacity, schoolId, 
      academicYear, subjects, teacherId, teachers, resTeacher 
    } = req.body;
    
    console.log('📝 Données reçues pour création:', { name, level, room, capacity, resTeacher, teacherId });
    
    // Vérifier si l'école existe
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'École non trouvée' });
    }
    
    // Vérifier si une classe avec le même nom existe déjà dans cette école
    const existingClass = await Class.findOne({ name, schoolId });
    if (existingClass) {
      return res.status(400).json({ message: 'Une classe avec ce nom existe déjà dans cette école' });
    }

    // Générer l'année scolaire si non fournie
    const currentYear = new Date().getFullYear();
    const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;
    
    const newClass = new Class({
      name,
      level,
      section,
      room: room || 'Salle à définir',
      capacity: capacity || 40,
      schoolId,
      anneeScolaire: academicYear || defaultAcademicYear,
      subjects: subjects || [],
      
      // Gestion des professeurs (nouvelle structure)
      teachers: teachers || [],
      resTeacher: (resTeacher || teacherId) ? new mongoose.Types.ObjectId(resTeacher || teacherId) : null,
      
      // Initialisation des élèves et parents
      students: [],
      parents: [],
      emploiDuTemps: null,
      
      // Compatibilité avec l'ancienne structure
      academicYear: academicYear || defaultAcademicYear
    });
    
    const savedClass = await newClass.save();
    console.log('✅ Classe créée:', { id: savedClass._id, name: savedClass.name, resTeacher: savedClass.resTeacher });
    res.status(201).json(savedClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer toutes les classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('schoolId', 'name');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer toutes les classes d'une école spécifique
exports.getClassesBySchool = async (req, res) => {
  console.log('\n=== 📚 CONTROLLER: GET CLASSES BY SCHOOL ===');
  console.log('⚡ Endpoint: GET /api/classes/school/:schoolId');
  
  try {
    const { schoolId } = req.params;
    console.log(`🔍 Recherche de classes pour l'école ID: ${schoolId}`);
    
    // NOUVEAU: Traçage détaillé de l'authentification
    if (!req.user) {
      console.warn('⚠️ ANOMALIE: Aucun utilisateur authentifié trouvé dans la requête');
      console.warn('⚠️ Le middleware auth.js devrait toujours définir req.user, même en mode contournement');
    } else {
      console.log(`👤 Utilisateur: ID=${req.user.userId}, Rôle=${req.user.role || 'non spécifié'}`);
      
      // Vérifier si c'est un utilisateur fantôme (mode contournement)
      if (req.user.isGhostUser) {
        console.log('⚠️ Mode contournement actif: Utilisateur fantôme détecté');
        console.log('⚠️ L\'accès est accordé sans vérification d\'autorisation réelle');
      }
    }
    
    // 1. Nettoyage et validation de l'ID d'école
    const cleanSchoolId = schoolId.trim();
    console.log(`🧹 ID d'école nettoyé: ${cleanSchoolId}`);
    
    // Vérification du format de l'ID avec gestion d'erreur détaillée
    let isValidObjectId = false;
    try {
      isValidObjectId = mongoose.Types.ObjectId.isValid(cleanSchoolId);
      console.log(`🔢 Validation de l'ID MongoDB: ${isValidObjectId ? 'Valide ✓' : 'Invalide ✗'}`);
    } catch (validationErr) {
      console.error(`❌ Erreur lors de la validation de l'ID: ${validationErr.message}`);
    }
    
    if (!isValidObjectId) {
      console.error(`❌ ID d'école invalide: ${cleanSchoolId}`);
      return res.status(400).json({ 
        message: 'ID d\'école invalide', 
        details: 'Format MongoDB ObjectId invalide',
        schoolId: cleanSchoolId
      });
    }
    
    // 2. Recherche de l'école avec gestion robuste d'erreurs
    console.log(`🔍 Recherche de l'école avec ID: ${cleanSchoolId}...`);
    
    let school = null;
    try {
      school = await School.findById(cleanSchoolId);
    } catch (schoolFindErr) {
      console.error(`❌ Erreur lors de la recherche de l'école: ${schoolFindErr.message}`);
      return res.status(500).json({ 
        message: 'Erreur lors de la recherche de l\'école',
        details: schoolFindErr.message
      });
    }
    
    // Gérer le cas où l'école n'est pas trouvée
    if (!school) {
      console.error(`❌ École non trouvée avec l'ID: ${cleanSchoolId}`);
      
      // CONTOURNEMENT: Si l'école n'est pas trouvée, créer une école fictive pour les tests
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ CONTOURNEMENT: Création d\'une école fictive pour les tests');
        
        const dummySchool = {
          _id: cleanSchoolId,
          name: "École fictive pour débogage",
          address: "123 Rue Debug",
          status: "Test"
        };
        
        // Utiliser cette école fictive pour continuer le traitement
        school = dummySchool;
        console.log(`✅ École fictive créée: ${school.name}`);
      } else {
        // En production, renvoyer une erreur 404 normale
        return res.status(404).json({ 
          message: 'École non trouvée', 
          details: `Aucune école trouvée avec l'ID ${cleanSchoolId}`,
          schoolId: cleanSchoolId
        });
      }
    } else {
      console.log(`✅ École trouvée: ${school.name} (ID: ${school._id})`);
    }
    
    // 3. Récupération des classes avec protection contre les erreurs
    try {
      console.log(`🔍 Recherche des classes pour l'école ${school.name}...`);
      
      // IMPORTANT: Utiliser une requête optimisée avec la nouvelle structure
      const classQuery = Class.find({ schoolId: cleanSchoolId })
        .populate('schoolId', 'name')
        .populate('teachers', 'firstName lastName name email') // Tous les professeurs
        .populate('resTeacher', 'firstName lastName name email') // Professeur principal - inclut name et firstName/lastName
        .populate('students', 'firstName lastName name email') // Élèves assignés
        .populate('parents', 'firstName lastName name email') // Parents des élèves
        .select('name level section room capacity studentCount teachers resTeacher students parents subjects anneeScolaire createdAt updatedAt') // Nouvelle structure
        .limit(500); // Sécurité: limiter le nombre de résultats
      
      // Exécuter la requête
      const classes = await classQuery;
      
      console.log(`✅ ${classes.length} classes trouvées pour l'école ${school.name}`);
      
      // Traçage pour le débogage
      if (classes.length > 0) {
        console.log('📋 Exemples de classes trouvées:');
        classes.slice(0, 3).forEach(c => {
          console.log(`   - ${c._id}: ${c.name} (${c.level || 'Niveau non spécifié'})`);
        });
      }
      
      // Renvoyer les données en format JSON
      return res.json(classes);
    } catch (classError) {
      console.error(`❌ Erreur lors de la recherche des classes: ${classError.message}`);
      console.log('Renvoi d\'un tableau vide comme solution de contournement');
      
      // Même en cas d'erreur, renvoyer un tableau vide pour éviter de bloquer le client
      return res.json([]);
    }
  } catch (err) {
    console.error(`Erreur lors de la récupération des classes: ${err.message}`);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des classes', details: err.message });
  }
};

// Récupérer une classe par ID
exports.getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('schoolId', 'name')
      .populate('teacherIds', 'name email');
    
    if (!classItem) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour une classe
exports.updateClass = async (req, res) => {
  try {
    const { 
      name, level, section, room, capacity, academicYear, anneeScolaire, subjects,
      teachers, resTeacher, students, parents, emploiDuTemps
    } = req.body;
    
    console.log('📝 Données reçues pour mise à jour:', { name, level, room, capacity, resTeacher, id: req.params.id });
    
    // Vérifier si une classe avec le même nom existe déjà (si le nom est mis à jour)
    if (name) {
      const existingClass = await Class.findOne({ 
        name, 
        schoolId: req.body.schoolId || req.params.schoolId,
        _id: { $ne: req.params.id }
      });
      
      if (existingClass) {
        return res.status(400).json({ message: 'Une classe avec ce nom existe déjà dans cette école' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (level !== undefined) updateData.level = level;
    if (section !== undefined) updateData.section = section;
    if (room !== undefined) updateData.room = room;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (anneeScolaire !== undefined) updateData.anneeScolaire = anneeScolaire;
    if (subjects !== undefined) updateData.subjects = subjects;
    
    // Nouveaux champs de la structure
    if (teachers !== undefined) updateData.teachers = teachers;
    if (resTeacher !== undefined) {
      updateData.resTeacher = resTeacher ? new mongoose.Types.ObjectId(resTeacher) : null;
    }
    if (students !== undefined) {
      updateData.students = students;
      updateData.studentCount = students.length; // Calculer automatiquement
    }
    if (parents !== undefined) updateData.parents = parents;
    if (emploiDuTemps !== undefined) updateData.emploiDuTemps = emploiDuTemps;
    
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedClass) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    
    console.log('✅ Classe mise à jour:', { id: updatedClass._id, name: updatedClass.name, resTeacher: updatedClass.resTeacher });
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une classe
exports.deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const deletedClass = await Class.findByIdAndDelete(classId);
    
    if (!deletedClass) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    
    // Mettre à jour les utilisateurs (étudiants) assignés à cette classe
    // pour les rendre "non assignés"
    const User = require('../models/User');
    await User.updateMany(
      { classId: classId }, 
      { $unset: { classId: 1 } }
    );
    
    console.log(`Classe ${deletedClass.nom} supprimée. Étudiants remis en "non assignés".`);
    res.json({ message: 'Classe supprimée avec succès et étudiants remis en "non assignés"' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la classe:', err);
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les statistiques d'une classe
exports.getClassStats = async (req, res) => {
  try {
    const { classId } = req.params;
    
    // Vérifier si la classe existe
    const classInfo = await Class.findById(classId);
    if (!classInfo) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }
    
    // Importer le modèle User pour compter les étudiants
    const User = require('../models/User');
    
    // Compter le nombre d'étudiants assignés à cette classe
    const studentsCount = await User.countDocuments({ 
      classId: classId,
      role: 'student' 
    });
    
    // Calculer les statistiques
    const stats = {
      classInfo: {
        _id: classInfo._id,
        name: classInfo.name,
        level: classInfo.level,
        section: classInfo.section,
        capacity: classInfo.capacity || 0,
        academicYear: classInfo.academicYear,
        subjects: classInfo.subjects || []
      },
      studentsCount: studentsCount,
      availableSpots: Math.max(0, (classInfo.capacity || 0) - studentsCount),
      occupancyRate: classInfo.capacity ? Math.round((studentsCount / classInfo.capacity) * 100) : 0,
      isFull: classInfo.capacity ? studentsCount >= classInfo.capacity : false
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques de classe:', err);
    res.status(500).json({ message: err.message });
  }
};

// Récupérer la liste de toutes les matières existantes
exports.getAllSubjects = async (req, res) => {
  try {
    const classes = await Class.find();
    
    // Extraire toutes les matières de toutes les classes
    const allSubjects = classes.reduce((acc, cls) => {
      if (cls.subjects && cls.subjects.length) {
        return [...acc, ...cls.subjects];
      }
      return acc;
    }, []);
    
    // Supprimer les doublons
    const uniqueSubjects = [...new Set(allSubjects)].sort();
    
    res.json(uniqueSubjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtenir les étudiants d'une classe
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const classInfo = await Class.findById(classId)
      .populate('students', 'firstName lastName email phone dateOfBirth');
    
    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: classInfo.students
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des étudiants',
      error: error.message
    });
  }
};
