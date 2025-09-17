const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, createParent, getAllParents, createStudent, getAllStudents, getParentsBySchool } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/', getAllUsers);
router.get('/parents', getAllParents);
router.get('/parents/school/:schoolId', auth, getParentsBySchool);
router.post('/parents', auth, createParent);
router.get('/students', getAllStudents);
router.post('/students', auth, createStudent);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
