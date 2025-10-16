const School = require('../models/School');

exports.createSchool = async (req, res) => {
  try {
    const { name, address, phone, email, director, createdYear, type, status } = req.body;
    if (!name || !address || !phone || !email || !director || !createdYear || !type || !status) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Format d\'email invalide.' });
    }
    const school = new School({
      name,
      address,
      phone,
      email,
      director,
      createdYear,
      type,
      status,
      adminCount: req.body.adminCount || 0,
      teacherCount: req.body.teacherCount || 0,
      studentCount: req.body.studentCount || 0,
      addedDate: req.body.addedDate || new Date().toISOString()
    });
    await school.save();
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json(school);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const school = await School.findByIdAndDelete(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json({ message: 'School deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les paramètres par défaut de l'école de l'utilisateur connecté
exports.getSchoolDefaults = async (req, res) => {
  try {
    // Récupérer l'ID de l'école depuis le token utilisateur
    const userId = req.user.userId;
    const User = require('../models/User');
    
    const user = await User.findById(userId).populate('schoolId');
    
    if (!user || !user.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'École non trouvée pour cet utilisateur' 
      });
    }
    
    const school = user.schoolId;
    
    const responseData = {
      success: true,
      data: {
        schoolId: school._id,
        schoolName: school.name,
        defaultSemester: school.defaultSemester || 1,
        defaultAcademicYear: school.defaultAcademicYear || '2025-2026'
      }
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('❌ getSchoolDefaults - Erreur:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des paramètres' 
    });
  }
};

// Mettre à jour les paramètres par défaut de l'école
exports.updateSchoolDefaults = async (req, res) => {
  try {
    const { defaultSemester, defaultAcademicYear } = req.body;
    
    // Validation
    if (defaultSemester && ![1, 2].includes(defaultSemester)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le semestre doit être 1 ou 2' 
      });
    }
    
    // Récupérer l'ID de l'école depuis le token utilisateur
    const userId = req.user.userId;
    const User = require('../models/User');
    
    const user = await User.findById(userId).populate('schoolId');
    
    if (!user || !user.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'École non trouvée pour cet utilisateur' 
      });
    }
    
    const updateData = {};
    if (defaultSemester !== undefined) updateData.defaultSemester = defaultSemester;
    if (defaultAcademicYear !== undefined) updateData.defaultAcademicYear = defaultAcademicYear;
    
    const school = await School.findByIdAndUpdate(
      user.schoolId._id, 
      updateData, 
      { new: true }
    );
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'École non trouvée' 
      });
    }
    
    res.json({
      success: true,
      message: 'Paramètres par défaut mis à jour avec succès',
      data: {
        schoolId: school._id,
        schoolName: school.name,
        defaultSemester: school.defaultSemester,
        defaultAcademicYear: school.defaultAcademicYear
      }
    });
  } catch (err) {
    console.error('❌ updateSchoolDefaults - Erreur:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour des paramètres' 
    });
  }
};
