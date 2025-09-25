const Schedule = require('../models/Schedule');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const mongoose = require('mongoose');

// Créer un nouveau créneau d'emploi du temps
exports.createSchedule = async (req, res) => {
  try {
    const { 
      classId, 
      subjectId, 
      teacherId, 
      dayOfWeek, 
      startTime, 
      endTime, 
      room, 
      semester,
      notes 
    } = req.body;

    // Validation des données obligatoires
    if (!classId || !subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'Les champs classId, subjectId, teacherId, dayOfWeek, startTime et endTime sont obligatoires' 
      });
    }

    // Vérifier que l'enseignant enseigne bien cette matière
    const teacher = await User.findById(teacherId);
    const subject = await Subject.findById(subjectId);
    
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Enseignant introuvable ou rôle invalide' });
    }

    if (!subject) {
      return res.status(400).json({ message: 'Matière introuvable' });
    }

    // Vérifier que l'enseignant peut enseigner cette matière
    if (!teacher.subjects || !teacher.subjects.includes(subject.name)) {
      return res.status(400).json({ 
        message: `${teacher.name} n'est pas habilité à enseigner ${subject.name}` 
      });
    }

    // Récupérer l'école depuis la classe
    const classObj = await Class.findById(classId).populate('schoolId');
    if (!classObj) {
      return res.status(400).json({ message: 'Classe introuvable' });
    }

    const scheduleData = {
      schoolId: classObj.schoolId._id,
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room: room || 'Salle à définir',
      semester: semester || '2024-2025',
      notes
    };

    // Vérifier les conflits avant la création
    const conflicts = await Schedule.checkConflicts(scheduleData);
    if (conflicts.length > 0) {
      return res.status(409).json({ 
        message: 'Conflits détectés', 
        conflicts 
      });
    }

    // Créer le créneau
    const schedule = new Schedule(scheduleData);
    await schedule.save();

    // Populer les références pour la réponse
    await schedule.populate([
      { path: 'subjectId', select: 'name code' },
      { path: 'teacherId', select: 'name email' },
      { path: 'classId', select: 'name level' },
      { path: 'schoolId', select: 'name' }
    ]);

    res.status(201).json({
      message: 'Créneau créé avec succès',
      schedule
    });

  } catch (error) {
    console.error('Erreur lors de la création du créneau:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la création du créneau',
      error: error.message 
    });
  }
};

// Obtenir tous les créneaux (avec filtres optionnels)
exports.getAllSchedules = async (req, res) => {
  try {
    const { 
      schoolId, 
      classId, 
      teacherId, 
      semester, 
      dayOfWeek,
      page = 1,
      limit = 50
    } = req.query;

    // Construction du filtre
    const filter = { isActive: true };
    
    if (schoolId) filter.schoolId = schoolId;
    if (classId) filter.classId = classId;
    if (teacherId) filter.teacherId = teacherId;
    if (semester) filter.semester = semester;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

    // Si l'utilisateur n'est pas super_user, filtrer par son école
    if (req.user.role !== 'super_user' && req.user.schoolId) {
      filter.schoolId = req.user.schoolId;
    }

    const schedules = await Schedule.find(filter)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email')
      .populate('classId', 'name level')
      .populate('schoolId', 'name')
      .sort({ dayOfWeek: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalSchedules = await Schedule.countDocuments(filter);

    res.json({
      schedules,
      totalPages: Math.ceil(totalSchedules / limit),
      currentPage: page,
      totalSchedules
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des créneaux',
      error: error.message 
    });
  }
};

// Obtenir un créneau par ID
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de créneau invalide' });
    }

    const schedule = await Schedule.findById(id)
      .populate('subjectId', 'name code description')
      .populate('teacherId', 'name email phone')
      .populate('classId', 'name level room')
      .populate('schoolId', 'name address');

    if (!schedule) {
      return res.status(404).json({ message: 'Créneau introuvable' });
    }

    res.json(schedule);

  } catch (error) {
    console.error('Erreur lors de la récupération du créneau:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération du créneau',
      error: error.message 
    });
  }
};

// Mettre à jour un créneau
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de créneau invalide' });
    }

    const existingSchedule = await Schedule.findById(id);
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Créneau introuvable' });
    }

    // Préparer les données pour la validation des conflits
    const scheduleData = {
      ...updateData,
      _id: id // Exclure ce créneau de la vérification des conflits
    };

    // Vérifier les conflits si les horaires ou l'enseignant changent
    if (updateData.startTime || updateData.endTime || updateData.teacherId || updateData.dayOfWeek) {
      const conflicts = await Schedule.checkConflicts({
        teacherId: updateData.teacherId || existingSchedule.teacherId,
        dayOfWeek: updateData.dayOfWeek || existingSchedule.dayOfWeek,
        startTime: updateData.startTime || existingSchedule.startTime,
        endTime: updateData.endTime || existingSchedule.endTime,
        room: updateData.room || existingSchedule.room,
        _id: id
      });

      if (conflicts.length > 0) {
        return res.status(409).json({ 
          message: 'Conflits détectés', 
          conflicts 
        });
      }
    }

    // Mettre à jour le créneau
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'subjectId', select: 'name code' },
      { path: 'teacherId', select: 'name email' },
      { path: 'classId', select: 'name level' },
      { path: 'schoolId', select: 'name' }
    ]);

    res.json({
      message: 'Créneau mis à jour avec succès',
      schedule: updatedSchedule
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du créneau:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour du créneau',
      error: error.message 
    });
  }
};

// Supprimer un créneau
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de créneau invalide' });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Créneau introuvable' });
    }

    // Suppression soft (désactivation)
    await Schedule.findByIdAndUpdate(id, { isActive: false });

    res.json({ message: 'Créneau supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du créneau:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression du créneau',
      error: error.message 
    });
  }
};

// Obtenir l'emploi du temps complet d'une classe
exports.getClassSchedule = async (req, res) => {
  try {
    const { classId } = req.params;
    const { semester = '2024-2025' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: 'ID de classe invalide' });
    }

    const schedules = await Schedule.getClassSchedule(classId, semester);
    
    // Organiser par jour de la semaine
    const scheduleByDay = {
      'Lundi': [],
      'Mardi': [],
      'Mercredi': [],
      'Jeudi': [],
      'Vendredi': [],
      'Samedi': []
    };

    schedules.forEach(schedule => {
      scheduleByDay[schedule.dayOfWeek].push(schedule);
    });

    res.json({
      classId,
      semester,
      scheduleByDay,
      totalCourses: schedules.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'emploi du temps de la classe:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de l\'emploi du temps',
      error: error.message 
    });
  }
};

// Obtenir l'emploi du temps d'un enseignant
exports.getTeacherSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { semester = '2024-2025' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'ID d\'enseignant invalide' });
    }

    const schedules = await Schedule.getTeacherSchedule(teacherId, semester);
    const workload = await Schedule.getTeacherWorkload(teacherId, semester);

    // Organiser par jour de la semaine
    const scheduleByDay = {
      'Lundi': [],
      'Mardi': [],
      'Mercredi': [],
      'Jeudi': [],
      'Vendredi': [],
      'Samedi': []
    };

    schedules.forEach(schedule => {
      scheduleByDay[schedule.dayOfWeek].push(schedule);
    });

    res.json({
      teacherId,
      semester,
      scheduleByDay,
      workload,
      totalCourses: schedules.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'emploi du temps de l\'enseignant:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de l\'emploi du temps',
      error: error.message 
    });
  }
};

// Vérifier les disponibilités pour un créneau donné
exports.checkAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, classId, subjectId } = req.query;

    if (!dayOfWeek || !startTime || !endTime || !classId || !subjectId) {
      return res.status(400).json({ 
        message: 'Les paramètres dayOfWeek, startTime, endTime, classId et subjectId sont obligatoires' 
      });
    }

    // Récupérer les enseignants qui peuvent enseigner cette matière
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(400).json({ message: 'Matière introuvable' });
    }

    const availableTeachers = await User.find({
      role: 'teacher',
      subjects: subject.name,
      schoolId: subject.schoolId,
      status: 'Actif'
    });

    // Vérifier la disponibilité de chaque enseignant
    const teacherAvailability = await Promise.all(
      availableTeachers.map(async (teacher) => {
        const conflicts = await Schedule.checkConflicts({
          teacherId: teacher._id,
          dayOfWeek,
          startTime,
          endTime
        });

        return {
          teacher: {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email
          },
          isAvailable: conflicts.length === 0,
          conflicts: conflicts.length > 0 ? conflicts : null
        };
      })
    );

    const available = teacherAvailability.filter(t => t.isAvailable);
    const busy = teacherAvailability.filter(t => !t.isAvailable);

    res.json({
      timeSlot: { dayOfWeek, startTime, endTime },
      availableTeachers: available,
      busyTeachers: busy,
      summary: {
        total: availableTeachers.length,
        available: available.length,
        busy: busy.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification des disponibilités:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la vérification des disponibilités',
      error: error.message 
    });
  }
};