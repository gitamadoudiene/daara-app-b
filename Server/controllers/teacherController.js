const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const School = require('../models/School');

// Fonction pour créer un nouvel enseignant
exports.createTeacher = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      schoolId, 
      subjects, 
      classes,
      qualification,
      experience 
    } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Vérifier si l'école existe
    if (schoolId) {
      const school = await School.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: 'École non trouvée' });
      }
    }
    
    // Générer un mot de passe temporaire (les 6 premiers caractères de l'email + les 2 premiers caractères du nom)
    const tempPassword = `${email.substring(0, 6)}${name.substring(0, 2)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Créer le nouvel enseignant
    const teacher = new User({
      name,
      email,
      phone,
      role: 'teacher',
      schoolId: schoolId ? new mongoose.Types.ObjectId(schoolId) : null,
      subjects,
      classes,
      qualification,
      experience,
      password: hashedPassword
    });
    
    const savedTeacher = await teacher.save();
    
    // Mettre à jour le nombre d'enseignants dans l'école si une école est spécifiée
    if (schoolId) {
      await School.findByIdAndUpdate(
        schoolId,
        { $inc: { teacherCount: 1 } }
      );
    }
    
    res.status(201).json({
      message: 'Enseignant créé avec succès',
      teacher: {
        id: savedTeacher._id,
        name: savedTeacher.name,
        email: savedTeacher.email,
        role: savedTeacher.role
      },
      tempPassword
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer tous les enseignants
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .populate('schoolId', 'name')
      .select('-password');
    
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les enseignants d'une école spécifique
exports.getTeachersBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    if (!schoolId) {
      return res.status(400).json({ message: 'ID de l\'école requis' });
    }
    
    const teachers = await User.find({ 
      role: 'teacher',
      schoolId: new mongoose.Types.ObjectId(schoolId)
    })
    .populate('schoolId', 'name')
    .select('-password')
    .sort({ name: 1 }); // Trier par nom
    
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer un enseignant par ID
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await User.findOne({ 
      _id: req.params.id,
      role: 'teacher'
    })
    .populate('schoolId', 'name')
    .select('-password');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour un enseignant
exports.updateTeacher = async (req, res) => {
  try {
    const { name, email, phone, schoolId, subjects, classes, qualification, experience } = req.body;
    
    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
    }
    
    // Récupérer l'ancien schoolId avant la mise à jour
    const oldTeacher = await User.findById(req.params.id);
    if (!oldTeacher || oldTeacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    
    const oldSchoolId = oldTeacher.schoolId;
    
    // Mettre à jour l'enseignant
    const teacher = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        schoolId: schoolId ? new mongoose.Types.ObjectId(schoolId) : null,
        subjects,
        classes,
        qualification,
        experience
      },
      { new: true }
    ).select('-password');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    
    // Mettre à jour les compteurs des écoles si l'école a changé
    if (schoolId && !oldSchoolId?.equals(schoolId)) {
      if (oldSchoolId) {
        await School.findByIdAndUpdate(
          oldSchoolId,
          { $inc: { teacherCount: -1 } }
        );
      }
      
      await School.findByIdAndUpdate(
        schoolId,
        { $inc: { teacherCount: 1 } }
      );
    }
    
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer un enseignant
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: 'teacher'
    });
    
    if (!teacher) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }
    
    // Mettre à jour le compteur d'enseignants de l'école
    if (teacher.schoolId) {
      await School.findByIdAndUpdate(
        teacher.schoolId,
        { $inc: { teacherCount: -1 } }
      );
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Enseignant supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
