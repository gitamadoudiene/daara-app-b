const express = require('express');
const router = express.Router();
const {
  initializeDefaultCoefficients,
  getSchoolCoefficients,
  upsertCoefficient,
  deleteCoefficient,
  deactivateCoefficient,
  getCoefficientForSubjectAndLevel,
  getAvailableClassLevels,
  copyCoefficientsToNewYear
} = require('../controllers/coefficientController');

const auth = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes pour les coefficients

/**
 * @route   POST /api/coefficients/initialize
 * @desc    Initialiser les coefficients par défaut pour une école
 * @access  Admins uniquement
 */
router.post('/initialize', initializeDefaultCoefficients);

/**
 * @route   GET /api/coefficients
 * @desc    Récupérer tous les coefficients d'une école
 * @access  Tous les utilisateurs authentifiés
 * @query   academicYear, classLevel
 */
router.get('/', getSchoolCoefficients);

/**
 * @route   POST /api/coefficients
 * @desc    Créer un nouveau coefficient
 * @access  Admins uniquement
 */
router.post('/', upsertCoefficient);

/**
 * @route   PUT /api/coefficients
 * @desc    Modifier un coefficient existant
 * @access  Admins uniquement
 */
router.put('/', upsertCoefficient);

/**
 * @route   DELETE /api/coefficients/:coefficientId
 * @desc    Supprimer un coefficient
 * @access  Admins uniquement
 */
router.delete('/:coefficientId', deleteCoefficient);

/**
 * @route   PUT /api/coefficients/:coefficientId/deactivate
 * @desc    Désactiver un coefficient
 * @access  Admins uniquement
 */
router.put('/:coefficientId/deactivate', deactivateCoefficient);

/**
 * @route   GET /api/coefficients/:subjectId/:classLevel/:academicYear
 * @desc    Récupérer le coefficient d'une matière pour un niveau donné
 * @access  Tous les utilisateurs authentifiés
 */
router.get('/:subjectId/:classLevel/:academicYear', getCoefficientForSubjectAndLevel);

/**
 * @route   GET /api/coefficients/class-levels
 * @desc    Récupérer les niveaux de classe disponibles
 * @access  Tous les utilisateurs authentifiés
 */
router.get('/class-levels', getAvailableClassLevels);

/**
 * @route   POST /api/coefficients/copy
 * @desc    Copier les coefficients d'une année vers une autre
 * @access  Admins uniquement
 */
router.post('/copy', copyCoefficientsToNewYear);

module.exports = router;