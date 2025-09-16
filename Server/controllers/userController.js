const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Créer un nouveau parent
exports.createParent = async (req, res) => {
  try {
    const { name, email, phone, address, schoolId, gender, status } = req.body;
    
    // Validation des champs requis
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Les champs nom, email et téléphone sont obligatoires' });
    }
    
    // Validation du sexe si fourni
    if (gender && !['Masculin', 'Féminin'].includes(gender)) {
      return res.status(400).json({ message: 'Le sexe doit être "Masculin" ou "Féminin"' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Valider le schoolId si fourni
    let validSchoolId = null;
    if (schoolId && schoolId.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: 'ID d\'école invalide' });
      }
      validSchoolId = new mongoose.Types.ObjectId(schoolId);
    }
    
    // Générer un mot de passe temporaire
    const tempPassword = `${email.substring(0, 6)}${name.substring(0, 2)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Créer le nouveau parent
    const parent = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: 'parent',
      gender: gender || undefined,
      schoolId: validSchoolId,
      password: hashedPassword
    });
    
    const savedParent = await parent.save();
    
    res.status(201).json({
      message: 'Parent créé avec succès',
      parent: {
        id: savedParent._id,
        name: savedParent.name,
        email: savedParent.email,
        role: savedParent.role,
        phone: savedParent.phone
      },
      tempPassword
    });
  } catch (err) {
    console.error('Erreur lors de la création du parent:', err);
    res.status(500).json({ message: err.message });
  }
};

// Récupérer tous les parents
exports.getAllParents = async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' })
      .populate('schoolId', 'name')
      .select('-password');
    res.json(parents);
  } catch (err) {
    console.error('Erreur lors de la récupération des parents:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Cast children IDs to ObjectId if present
    if (req.body.children && Array.isArray(req.body.children)) {
      const mongoose = require('mongoose');
      const validIds = req.body.children.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length !== req.body.children.length) {
        return res.status(400).json({ message: 'One or more children IDs are invalid ObjectIds.' });
      }
      req.body.children = validIds.map(id => new mongoose.Types.ObjectId(id));
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Créer un nouvel étudiant
exports.createStudent = async (req, res) => {
  try {
    const { name, email, phone, address, schoolId, classId, parentId, dateOfBirth, gender, status } = req.body;
    
    // Validation des champs requis
    if (!name || !phone || !schoolId || !classId) {
      return res.status(400).json({ message: 'Les champs nom, téléphone, école et classe sont obligatoires' });
    }
    
    // Validation du sexe si fourni
    if (gender && !['Masculin', 'Féminin'].includes(gender)) {
      return res.status(400).json({ message: 'Le sexe doit être "Masculin" ou "Féminin"' });
    }
    
    // Vérifier si l'utilisateur existe déjà (si email fourni)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
      }
    }
    
    // Valider le schoolId
    let validSchoolId = null;
    if (schoolId && schoolId.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: 'ID d\'école invalide' });
      }
      validSchoolId = new mongoose.Types.ObjectId(schoolId);
    }
    
    // Valider le parentId si fourni
    let validParentId = null;
    if (parentId && parentId.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: 'ID de parent invalide' });
      }
      validParentId = new mongoose.Types.ObjectId(parentId);
    }
    
    // Générer un email temporaire si non fourni
    const studentEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@student.daara.sn`;
    
    // Générer un mot de passe temporaire
    const tempPassword = `${studentEmail.substring(0, 6)}${name.substring(0, 2)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Créer le nouvel étudiant
    const student = new User({
      name: name.trim(),
      email: studentEmail.toLowerCase(),
      phone: phone.trim(),
      role: 'student',
      gender: gender || undefined,
      schoolId: validSchoolId,
      class: classId,
      password: hashedPassword
    });
    
    const savedStudent = await student.save();
    
    // Ajouter l'étudiant à la liste des enfants du parent s'il est spécifié
    if (validParentId) {
      await User.findByIdAndUpdate(
        validParentId,
        { $addToSet: { children: savedStudent._id } }
      );
    }
    
    res.status(201).json({
      message: 'Étudiant créé avec succès',
      student: {
        id: savedStudent._id,
        name: savedStudent.name,
        email: savedStudent.email,
        role: savedStudent.role,
        phone: savedStudent.phone,
        class: savedStudent.class
      },
      tempPassword
    });
  } catch (err) {
    console.error('Erreur lors de la création de l\'étudiant:', err);
    res.status(500).json({ message: err.message });
  }
};

// Récupérer tous les étudiants
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .populate('schoolId', 'name')
      .select('-password');
    res.json(students);
  } catch (err) {
    console.error('Erreur lors de la récupération des étudiants:', err);
    res.status(500).json({ message: err.message });
  }
};
