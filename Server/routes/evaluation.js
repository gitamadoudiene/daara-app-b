const express = require('express');
const router = express.Router();
const {
  createEvaluation,
  getTeacherEvaluations,
  getEvaluationWithStudents,
  submitGrades,
  publishGrades,
  updateEvaluation,
  deleteEvaluation,
  getEvaluationStats
} = require('../controllers/evaluationController');

const auth = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes pour les évaluations

/**
 * @route   POST /api/evaluations
 * @desc    Créer une nouvelle évaluation (étape 1: programmation)
 * @access  Enseignants uniquement
 */
router.post('/', createEvaluation);

/**
 * @route   GET /api/evaluations/teacher
 * @desc    Récupérer les évaluations d'un enseignant
 * @access  Enseignants uniquement
 * @query   academicYear, semester, status
 */
router.get('/teacher', getTeacherEvaluations);

/**
 * @route   GET /api/evaluations/:evaluationId/students
 * @desc    Récupérer une évaluation avec la liste des élèves pour saisir les notes
 * @access  Enseignant propriétaire de l'évaluation
 */
router.get('/:evaluationId/students', getEvaluationWithStudents);

/**
 * @route   POST /api/evaluations/:evaluationId/grades
 * @desc    Saisir les notes pour une évaluation (étape 2: saisie des notes)
 * @access  Enseignant propriétaire de l'évaluation
 */
router.post('/:evaluationId/grades', submitGrades);

/**
 * @route   POST /api/evaluations/:evaluationId/publish
 * @desc    Publier les notes d'une évaluation
 * @access  Enseignant propriétaire de l'évaluation
 */
router.post('/:evaluationId/publish', publishGrades);

/**
 * @route   PUT /api/evaluations/:evaluationId
 * @desc    Modifier une évaluation (avant saisie des notes uniquement)
 * @access  Enseignant propriétaire de l'évaluation
 */
router.put('/:evaluationId', updateEvaluation);

/**
 * @route   DELETE /api/evaluations/:evaluationId
 * @desc    Supprimer une évaluation
 * @access  Enseignant propriétaire de l'évaluation
 */
router.delete('/:evaluationId', deleteEvaluation);

/**
 * @route   GET /api/evaluations/:evaluationId/stats
 * @desc    Récupérer les statistiques d'une évaluation
 * @access  Enseignant propriétaire de l'évaluation
 */
router.get('/:evaluationId/stats', getEvaluationStats);

module.exports = router;