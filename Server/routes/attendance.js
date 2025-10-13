const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// Enregistrer ou modifier la présence
router.post('/mark', auth, attendanceController.markAttendance);

// Récupérer la présence pour une session
router.get('/session/:schedule', auth, attendanceController.getAttendanceBySession);

// Récupérer la présence d'un élève
router.get('/student/:student', auth, attendanceController.getAttendanceByStudent);

// Récupérer la présence par classe et date
router.get('/class', auth, attendanceController.getAttendanceByClassDate);

module.exports = router;
