const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  createParent, 
  getAllParents, 
  createStudent, 
  getAllStudents, 
  getParentsBySchool,
  getUnassignedStudents,
  assignStudentsToClass,
  removeStudentFromClass,
  transferStudent
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Routes générales pour les utilisateurs
router.get('/', getAllUsers);
router.get('/parents', getAllParents);
router.get('/parents/school/:schoolId', auth, getParentsBySchool);
router.post('/parents', auth, createParent);
router.get('/students', getAllStudents);
router.post('/students', auth, createStudent);

// Routes pour les affectations d'étudiants
router.get('/students/unassigned/:schoolId', auth, getUnassignedStudents);
router.post('/students/assign', auth, assignStudentsToClass);
router.delete('/students/:studentId/class', auth, removeStudentFromClass);
router.post('/students/:studentId/transfer', auth, transferStudent);

// Routes pour les utilisateurs spécifiques
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
