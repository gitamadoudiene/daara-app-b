const express = require('express');
const router = express.Router();
const { 
  createClass,
  getAllClasses,
  getClassesBySchool,
  getClassById,
  updateClass,
  deleteClass,
  getAllSubjects,
  getClassStats,
  getClassStudents
} = require('../controllers/classController');
const authMiddleware = require('../middleware/auth');
// Commenté pour permettre l'accès aux classes sans restrictions de rôle
// const { checkRole } = require('../middleware/roleAccess');

// Protection des routes avec authentification
router.use(authMiddleware);

// Routes pour les classes - SANS restriction de rôle pour permettre à tous les utilisateurs d'accéder aux classes
router.post('/', createClass);
router.get('/', getAllClasses);
router.get('/school/:schoolId', getClassesBySchool); // Pas de restriction de rôle ici
router.get('/subjects', getAllSubjects);
router.get('/:classId/stats', getClassStats); // Nouvelle route pour les statistiques
router.get('/:classId/students', getClassStudents); // Nouvelle route pour récupérer les étudiants d'une classe
router.get('/:id', getClassById);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

module.exports = router;
