const express = require('express');
const router = express.Router();
const {
  createSubject,
  getSubjectsBySchool,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const authenticateToken = require('../middleware/auth');
const { checkRole } = require('../middleware/roleAccess');

// Routes protégées - nécessitent une authentification
router.use(authenticateToken);

// Créer une nouvelle matière (Admin et SuperUser uniquement)
router.post('/', checkRole(['admin', 'superuser']), createSubject);

// Récupérer toutes les matières d'une école
router.get('/school/:schoolId', getSubjectsBySchool);

// Récupérer une matière par ID
router.get('/:id', getSubjectById);

// Mettre à jour une matière (Admin et SuperUser uniquement)
router.put('/:id', checkRole(['admin', 'superuser']), updateSubject);

// Supprimer une matière (Admin et SuperUser uniquement)
router.delete('/:id', checkRole(['admin', 'superuser']), deleteSubject);

module.exports = router;