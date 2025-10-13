const express = require('express');
const router = express.Router();
const { 
  createTeacher, 
  getAllTeachers, 
  getTeachersBySchool,
  getTeacherById, 
  updateTeacher, 
  deleteTeacher,
  getTeacherClasses,
  getTeacherSubjects
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/auth');

// Protection des routes avec authentification
router.use(authMiddleware);

// Routes pour les enseignants
router.post('/', createTeacher);
router.get('/', getAllTeachers);
router.get('/classes', getTeacherClasses); // Nouvelle route pour récupérer les classes de l'enseignant connecté
router.get('/subjects', getTeacherSubjects); // Nouvelle route pour récupérer les matières de l'enseignant connecté
router.get('/school/:schoolId', getTeachersBySchool);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
