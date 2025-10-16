const express = require('express');
const router = express.Router();
const {
  createSchool,
  getSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
  getSchoolDefaults,
  updateSchoolDefaults
} = require('../controllers/schoolController');
const auth = require('../middleware/auth');

router.post('/', createSchool);
router.get('/', getSchools);

// Routes pour les paramètres par défaut de l'école (AVANT les routes /:id)
router.get('/defaults/current', auth, getSchoolDefaults);
router.put('/defaults/current', auth, updateSchoolDefaults);

// Routes avec paramètres dynamiques (APRÈS les routes spécifiques)
router.get('/:id', getSchoolById);
router.put('/:id', updateSchool);
router.delete('/:id', deleteSchool);

module.exports = router;
