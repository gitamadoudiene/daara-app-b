const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleAccess');

// Routes pour les enseignants, admins et super-utilisateurs
router.get('/class', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.getClassGrades
);

router.post('/', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.createGrade
);

router.put('/:gradeId', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.updateGrade
);

router.delete('/:gradeId', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.deleteGrade
);

router.post('/publish', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.toggleGradePublishStatus
);

// Routes accessibles aux parents, étudiants, enseignants et administrateurs
router.get('/student/:studentId', 
  auth, 
  checkRole(['student', 'parent', 'teacher', 'admin', 'super_user']), 
  gradeController.getStudentGrades
);

router.get('/report/:studentId', 
  auth, 
  checkRole(['student', 'parent', 'teacher', 'admin', 'super_user']), 
  gradeController.getStudentReport
);

// Nouvelles routes pour les évaluations d'enseignants
router.get('/teacher/assessments', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.getTeacherAssessments
);

router.post('/assessment', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.createAssessment
);

router.get('/assessment/:assessmentId/grades', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.getAssessmentGrades
);

router.post('/assessment/:assessmentId/grades', 
  auth, 
  checkRole(['teacher', 'admin', 'super_user']), 
  gradeController.submitAssessmentGrades
);

module.exports = router;