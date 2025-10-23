const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// ============= NOUVEAU SYSTÈME D'ATTENDANCE =============

// Test endpoint (sans authentification pour les tests)
router.get('/test', attendanceController.testAttendance);

// Récupérer les sessions d'attendance pour un enseignant aujourd'hui
router.get('/sessions/teacher/:teacherId/today', auth, attendanceController.getTeacherSessionsToday);

// Récupérer les sessions d'attendance pour un enseignant cette semaine
router.get('/sessions/teacher/:teacherId/week', auth, attendanceController.getTeacherSessionsWeek);

// Récupérer les enregistrements d'attendance pour une session
router.get('/sessions/:sessionId/records', auth, attendanceController.getSessionRecords);

// Sauvegarder les enregistrements d'attendance
router.post('/sessions/:sessionId/records', auth, attendanceController.saveAttendanceRecords);

// Finaliser une session d'attendance
router.put('/sessions/:sessionId/complete', auth, attendanceController.completeSession);

// ============= ANCIEN SYSTÈME (LEGACY) =============

// Enregistrer ou modifier la présence
router.post('/mark', auth, attendanceController.markAttendance);

// Récupérer la présence pour une session
router.get('/session/:schedule', auth, attendanceController.getAttendanceBySession);

// Récupérer la présence d'un élève
router.get('/student/:student', auth, attendanceController.getAttendanceByStudent);

// Récupérer la présence par classe et date
router.get('/class', auth, attendanceController.getAttendanceByClassDate);

module.exports = router;
