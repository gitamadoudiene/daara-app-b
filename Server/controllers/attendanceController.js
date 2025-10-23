const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

// Test endpoint pour vérifier si les routes fonctionnent
exports.testAttendance = async (req, res) => {
  try {
    res.json({ 
      message: 'Attendance API fonctionne correctement',
      timestamp: new Date(),
      endpoint: req.originalUrl 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les sessions d'attendance pour un enseignant aujourd'hui
exports.getTeacherSessionsToday = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await AttendanceSession.find({
      teacherId,
      date: { $gte: today, $lt: tomorrow }
    })
    .populate('classId', 'name level')
    .populate('subjectId', 'name code')
    .sort({ startTime: 1 });

    // Calculer des statistiques
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      pendingSessions: sessions.filter(s => s.status === 'pending').length,
      totalStudents: sessions.reduce((total, s) => total + s.totalStudents, 0),
      averageAttendance: sessions.length > 0 ? 
        Math.round((sessions.reduce((total, s) => total + (s.totalStudents > 0 ? (s.presentStudents / s.totalStudents) * 100 : 0), 0) / sessions.length)) : 0
    };

    res.json({ sessions, stats });
  } catch (err) {
    console.error('Error getting teacher sessions:', err);
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les sessions d'attendance pour un enseignant cette semaine
exports.getTeacherSessionsWeek = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const sessions = await AttendanceSession.find({
      teacherId,
      date: { $gte: startOfWeek, $lt: endOfWeek }
    })
    .populate('classId', 'name level')
    .populate('subjectId', 'name code')
    .sort({ date: -1, startTime: 1 });

    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      pendingSessions: sessions.filter(s => s.status === 'pending').length,
      totalStudents: sessions.reduce((total, s) => total + s.totalStudents, 0),
      averageAttendance: sessions.length > 0 ? 
        Math.round((sessions.reduce((total, s) => total + (s.totalStudents > 0 ? (s.presentStudents / s.totalStudents) * 100 : 0), 0) / sessions.length)) : 0
    };

    res.json({ sessions, stats });
  } catch (err) {
    console.error('Error getting teacher sessions:', err);
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les enregistrements d'attendance pour une session
exports.getSessionRecords = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Récupérer la session
    const session = await AttendanceSession.findById(sessionId)
      .populate('classId', 'name level')
      .populate('subjectId', 'name code');
    
    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    // Récupérer les enregistrements existants ou créer des enregistrements vides pour tous les étudiants de la classe
    let records = await AttendanceRecord.find({ sessionId })
      .populate('studentId', 'name email');

    // Si pas d'enregistrements, créer des enregistrements vides pour tous les étudiants de la classe
    if (records.length === 0) {
      const students = await User.find({ 
        role: 'student', 
        classId: session.classId._id 
      }).select('name email');

      const newRecords = students.map(student => ({
        sessionId,
        studentId: student._id,
        status: 'absent'
      }));

      if (newRecords.length > 0) {
        const createdRecords = await AttendanceRecord.insertMany(newRecords);
        records = await AttendanceRecord.find({ sessionId })
          .populate('studentId', 'name email');
      }
    }

    res.json({ session, records });
  } catch (err) {
    console.error('Error getting session records:', err);
    res.status(500).json({ error: err.message });
  }
};

// Sauvegarder les enregistrements d'attendance
exports.saveAttendanceRecords = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { records } = req.body;

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Données d\'enregistrements invalides' });
    }

    // Mettre à jour les enregistrements
    const updatePromises = records.map(record => 
      AttendanceRecord.findOneAndUpdate(
        { sessionId, studentId: record.studentId._id || record.studentId },
        {
          status: record.status,
          arrivalTime: record.arrivalTime,
          comment: record.comment,
          recordedBy: req.user._id,
          recordedAt: new Date()
        },
        { upsert: true, new: true }
      )
    );

    await Promise.all(updatePromises);

    // Mettre à jour les statistiques de la session
    const updatedRecords = await AttendanceRecord.find({ sessionId });
    const presentCount = updatedRecords.filter(r => r.status === 'present').length;
    const absentCount = updatedRecords.filter(r => r.status === 'absent').length;
    const lateCount = updatedRecords.filter(r => r.status === 'late').length;
    const excusedCount = updatedRecords.filter(r => r.status === 'excused').length;

    await AttendanceSession.findByIdAndUpdate(sessionId, {
      presentStudents: presentCount,
      absentStudents: absentCount,
      lateStudents: lateCount,
      excusedStudents: excusedCount,
      totalStudents: updatedRecords.length
    });

    res.json({ message: 'Attendance sauvegardée avec succès' });
  } catch (err) {
    console.error('Error saving attendance records:', err);
    res.status(500).json({ error: err.message });
  }
};

// Finaliser une session d'attendance
exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await AttendanceSession.findByIdAndUpdate(sessionId, {
      status: 'completed',
      completedAt: new Date()
    });

    res.json({ message: 'Session finalisée avec succès' });
  } catch (err) {
    console.error('Error completing session:', err);
    res.status(500).json({ error: err.message });
  }
};

// LEGACY: Enregistrer la présence d'un élève (ancien système)
const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    const { schedule, class: classId, student, date, status, justification } = req.body;
    const recordedBy = req.user._id;
    const attendance = await Attendance.findOneAndUpdate(
      { schedule, class: classId, student, date },
      { status, justification, recordedBy },
      { upsert: true, new: true }
    );
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LEGACY: Récupérer la présence pour une session (ancien système)
exports.getAttendanceBySession = async (req, res) => {
  try {
    const { schedule } = req.params;
    const attendance = await Attendance.find({ schedule }).populate('student');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LEGACY: Récupérer la présence d'un élève (ancien système)
exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { student } = req.params;
    const attendance = await Attendance.find({ student }).populate('schedule class');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LEGACY: Récupérer la présence par classe/date (ancien système)
exports.getAttendanceByClassDate = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const attendance = await Attendance.find({ class: classId, date }).populate('student');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
