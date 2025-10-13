const Attendance = require('../models/Attendance');

// Enregistrer la présence d'un élève
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

// Récupérer la présence pour une session
exports.getAttendanceBySession = async (req, res) => {
  try {
    const { schedule } = req.params;
    const attendance = await Attendance.find({ schedule }).populate('student');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer la présence d'un élève
exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { student } = req.params;
    const attendance = await Attendance.find({ student }).populate('schedule class');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer la présence par classe/date
exports.getAttendanceByClassDate = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const attendance = await Attendance.find({ class: classId, date }).populate('student');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
