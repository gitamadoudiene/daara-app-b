const express = require('express');
const router = express.Router();
const { 
  createClass,
  getAllClasses,
  getClassesBySchool,
  getClassById,
  updateClass,
  deleteClass,
  getAllSubjects
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
router.get('/:id', getClassById);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

module.exports = router;
