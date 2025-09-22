const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getClassSchedule,
  getTeacherSchedule,
  checkAvailability
} = require('../controllers/scheduleController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/roleAccess');

// Routes protégées - Authentification obligatoire
router.use(auth);

// Routes CRUD - Gestion des créneaux (Admin uniquement)
router.post('/', checkRole(['admin', 'super_user']), createSchedule);
router.get('/', getAllSchedules); // Accessible à tous les utilisateurs authentifiés
router.get('/:id', getScheduleById);
router.put('/:id', checkRole(['admin', 'super_user']), updateSchedule);
router.delete('/:id', checkRole(['admin', 'super_user']), deleteSchedule);

// Routes spécialisées - Consultation des emplois du temps
router.get('/class/:classId', getClassSchedule); // Emploi du temps d'une classe
router.get('/teacher/:teacherId', getTeacherSchedule); // Emploi du temps d'un enseignant

// Routes utilitaires - Vérifications et outils
router.get('/availability/check', checkRole(['admin', 'super_user']), checkAvailability);

module.exports = router;