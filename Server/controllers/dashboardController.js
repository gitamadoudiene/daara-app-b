const User = require('../models/User');
const Class = require('../models/Class');
const School = require('../models/School');

exports.getDashboardData = async (req, res) => {
  try {
    // Example: return user count by role
    const roles = ['super_user', 'admin', 'teacher', 'parent', 'student'];
    const data = {};
    for (const role of roles) {
      data[role] = await User.countDocuments({ role });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Récupère les statistiques pour le tableau de bord administrateur
 */
exports.getAdminStats = async (req, res) => {
  try {
    const { schoolId } = req.user || {};
    
    if (!schoolId) {
      return res.status(400).json({ error: 'ID de l\'école non disponible' });
    }

    // Récupération des statistiques utilisateurs
    const totalUsers = await User.countDocuments({ schoolId });
    const totalStudents = await User.countDocuments({ schoolId, role: 'student' });
    const totalTeachers = await User.countDocuments({ schoolId, role: 'teacher' });
    const totalParents = await User.countDocuments({ schoolId, role: 'parent' });
    const activeUsers = await User.countDocuments({ schoolId, status: 'Actif' });
    
    // Récupération des statistiques de classes
    const classes = await Class.find({ schoolId });
    const totalClasses = classes.length;
    
    // Les classes actives sont celles qui ont au moins un étudiant
    const activeClasses = await Class.countDocuments({ 
      schoolId, 
      'students.0': { $exists: true } // Au moins un étudiant dans la liste
    });

    // Récupérer le nombre de rapports en attente (à implémenter si le modèle de rapports existe)
    const pendingReports = 0;
    
    // Statistiques sur la santé du système (peut être calculée en fonction de la charge, etc.)
    const systemHealth = 98;

    return res.status(200).json({
      totalUsers,
      total: totalUsers,
      totalStudents,
      students: totalStudents,
      totalTeachers,
      teachers: totalTeachers,
      parents: totalParents,
      active: activeUsers,
      totalClasses,
      classes: totalClasses,
      activeClasses,
      pendingReports,
      systemHealth
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
  }
};

/**
 * Récupère les statistiques des utilisateurs par école
 */
exports.getUserCounts = async (req, res) => {
  try {
    const { schoolId } = req.user || {};
    
    if (!schoolId) {
      return res.status(400).json({ error: 'ID de l\'école non disponible' });
    }
    
    // Compter les utilisateurs par rôle pour cette école
    const total = await User.countDocuments({ schoolId });
    const students = await User.countDocuments({ schoolId, role: 'student' });
    const teachers = await User.countDocuments({ schoolId, role: 'teacher' });
    const parents = await User.countDocuments({ schoolId, role: 'parent' });
    const active = await User.countDocuments({ schoolId, status: 'Actif' });
    
    // Compter les classes pour cette école
    const classCount = await Class.countDocuments({ schoolId });
    const activeClasses = await Class.countDocuments({ 
      schoolId, 
      'students.0': { $exists: true } // Au moins un étudiant dans la liste
    });
    
    return res.status(200).json({
      total,
      students,
      teachers,
      parents,
      active,
      classes: classCount,
      activeClasses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques d\'utilisateurs:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
  }
};
