const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  // Références organisationnelles
  schoolId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'School', 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Temporalité - Durée libre définie par l'admin
  dayOfWeek: { 
    type: String, 
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'], 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        // Format HH:MM (ex: 08:00, 14:30)
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Le format de l\'heure de début doit être HH:MM'
    }
  },
  endTime: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        // Format HH:MM (ex: 09:00, 16:30)
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Le format de l\'heure de fin doit être HH:MM'
    }
  },

  // Métadonnées
  room: { 
    type: String, 
    default: 'Salle à définir',
    trim: true
  },
  semester: { 
    type: String, 
    required: true,
    default: '2024-2025'
  },
  
  // Gestion de l'état
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Notes et commentaires
  notes: {
    type: String,
    trim: true
  },
  
  // Pour la gestion des absences
  isRecurring: {
    type: Boolean,
    default: true // Par défaut, un cours se répète chaque semaine
  },
  
  // Méta-informations calculées automatiquement
  duration: {
    type: Number, // Durée en minutes, calculée automatiquement
    default: 0
  }
}, {
  timestamps: true
});

// Index pour les performances et l'unicité
scheduleSchema.index({ schoolId: 1, classId: 1, semester: 1 });
scheduleSchema.index({ teacherId: 1, dayOfWeek: 1, startTime: 1 });
scheduleSchema.index({ dayOfWeek: 1, startTime: 1, endTime: 1 });

// Validation personnalisée : endTime doit être après startTime
scheduleSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    if (endMinutes <= startMinutes) {
      this.invalidate('endTime', 'L\'heure de fin doit être après l\'heure de début');
    }
    
    // Calculer la durée en minutes
    this.duration = endMinutes - startMinutes;
    
    // Validation de durée maximale (6h = 360 minutes)
    if (this.duration > 360) {
      this.invalidate('endTime', 'Un cours ne peut pas dépasser 6 heures');
    }
    
    // Validation de durée minimale (30 minutes)
    if (this.duration < 30) {
      this.invalidate('endTime', 'Un cours doit durer au minimum 30 minutes');
    }
  }
  next();
});

// Méthode pour vérifier les conflits d'horaires
scheduleSchema.statics.checkConflicts = async function(scheduleData) {
  const { teacherId, dayOfWeek, startTime, endTime, room, _id } = scheduleData;
  const conflicts = [];

  // Conflit enseignant
  const teacherConflict = await this.findOne({
    teacherId,
    dayOfWeek,
    isActive: true,
    _id: { $ne: _id || null },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  }).populate(['classId', 'subjectId']);

  if (teacherConflict) {
    conflicts.push({
      type: 'teacher',
      message: `Conflit enseignant : ${teacherConflict.teacherId} a déjà cours de ${teacherConflict.startTime} à ${teacherConflict.endTime}`,
      conflictWith: {
        class: teacherConflict.classId.name,
        subject: teacherConflict.subjectId.name,
        time: `${teacherConflict.startTime}-${teacherConflict.endTime}`
      }
    });
  }

  // Conflit salle (spécialement pour salle informatique)
  if (room && room.toLowerCase().includes('informatique')) {
    const roomConflict = await this.findOne({
      room,
      dayOfWeek,
      isActive: true,
      _id: { $ne: _id || null },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    }).populate(['classId', 'subjectId', 'teacherId']);

    if (roomConflict) {
      conflicts.push({
        type: 'room',
        message: `Conflit salle : ${room} est occupée de ${roomConflict.startTime} à ${roomConflict.endTime}`,
        conflictWith: {
          class: roomConflict.classId.name,
          subject: roomConflict.subjectId.name,
          teacher: roomConflict.teacherId.name,
          time: `${roomConflict.startTime}-${roomConflict.endTime}`
        }
      });
    }
  }

  return conflicts;
};

// Méthode pour obtenir l'emploi du temps d'une classe
scheduleSchema.statics.getClassSchedule = async function(classId, semester = '2024-2025') {
  return await this.find({
    classId,
    semester,
    isActive: true
  })
  .populate('subjectId', 'name code')
  .populate('teacherId', 'name email')
  .populate('classId', 'name level')
  .sort({ dayOfWeek: 1, startTime: 1 });
};

// Méthode pour obtenir l'emploi du temps d'un enseignant
scheduleSchema.statics.getTeacherSchedule = async function(teacherId, semester = '2024-2025') {
  return await this.find({
    teacherId,
    semester,
    isActive: true
  })
  .populate('subjectId', 'name code')
  .populate('classId', 'name level')
  .populate('schoolId', 'name')
  .sort({ dayOfWeek: 1, startTime: 1 });
};

// Méthode pour calculer la charge horaire d'un enseignant
scheduleSchema.statics.getTeacherWorkload = async function(teacherId, semester = '2024-2025') {
  const schedules = await this.find({
    teacherId,
    semester,
    isActive: true
  });

  const totalMinutes = schedules.reduce((sum, schedule) => sum + schedule.duration, 0);
  const totalHours = Math.round((totalMinutes / 60) * 100) / 100; // Arrondir à 2 décimales

  return {
    totalHours,
    totalMinutes,
    courseCount: schedules.length,
    averageCourseLength: schedules.length > 0 ? Math.round(totalMinutes / schedules.length) : 0
  };
};

module.exports = mongoose.model('Schedule', scheduleSchema);