const express = require('express');
const router = express.Router();
const { 
  createTeacher, 
  getAllTeachers, 
  getTeacherById, 
  updateTeacher, 
  deleteTeacher 
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/auth');

// Protection des routes avec authentification
router.use(authMiddleware);

// Routes pour les enseignants
router.post('/', createTeacher);
router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
