const express = require('express');
const router = express.Router();
const {
  generateBulletin,
  getBulletin,
  calculateClassRankings,
  publishClassBulletins,
  getClassBulletins,
  addBulletinComment,
  getStudentAverages
} = require('../controllers/bulletinController');

const auth = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes pour les bulletins

/**
 * @route   POST /api/bulletins/generate
 * @desc    Générer le bulletin d'un élève pour un semestre
 * @access  Enseignants, Admins
 */
router.post('/generate', generateBulletin);

/**
 * @route   GET /api/bulletins/student/:studentId/:semester/:academicYear
 * @desc    Récupérer le bulletin d'un élève
 * @access  Élève concerné, Parents de l'élève, Enseignants de la classe, Admins
 */
router.get('/student/:studentId/:semester/:academicYear', getBulletin);

/**
 * @route   POST /api/bulletins/class/rankings
 * @desc    Calculer les classements pour une classe
 * @access  Professeur principal, Admins
 */
router.post('/class/rankings', calculateClassRankings);

/**
 * @route   POST /api/bulletins/class/publish
 * @desc    Publier les bulletins d'une classe
 * @access  Admins uniquement
 */
router.post('/class/publish', publishClassBulletins);

/**
 * @route   GET /api/bulletins/class/:classId
 * @desc    Récupérer les bulletins d'une classe
 * @access  Enseignants de la classe, Admins
 * @query   semester, academicYear, status
 */
router.get('/class/:classId', getClassBulletins);

/**
 * @route   POST /api/bulletins/:bulletinId/comment
 * @desc    Ajouter un commentaire à un bulletin
 * @access  Professeur principal (commentaire pédagogique), Admins (commentaire direction)
 */
router.post('/:bulletinId/comment', addBulletinComment);

/**
 * @route   GET /api/bulletins/averages/:studentId/:semester/:academicYear
 * @desc    Récupérer les moyennes d'un élève pour toutes les matières
 * @access  Élève concerné, Parents de l'élève, Enseignants, Admins
 */
router.get('/averages/:studentId/:semester/:academicYear', getStudentAverages);

module.exports = router;