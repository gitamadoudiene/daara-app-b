const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Créer un nouveau parent
exports.createParent = async (req, res) => {
  try {
    const { name, email, phone, address, schoolId, gender, status, profession, emergencyPhone, relation } = req.body;
    
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
      password: hashedPassword,
      address: address?.trim(),
      status: status || 'Actif',
      profession: profession?.trim(),
      emergencyPhone: emergencyPhone?.trim(),
      relation: relation?.trim()
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

// Récupérer les parents d'une école spécifique
exports.getParentsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: 'ID d\'école invalide' });
    }
    
    const parents = await User.find({ 
      role: 'parent', 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    })
      .populate('schoolId', 'name')
      .select('-password');
      
    res.json(parents);
  } catch (err) {
    console.error('Erreur lors de la récupération des parents par école:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('schoolId', 'name')
      .populate('classId', 'name level section')
      .select('-password');
    
    // Mapper les données pour la compatibilité frontend
    const mappedUsers = users.map(user => {
      const userObj = user.toObject();
      // Pour les enseignants, mapper subjects[0] vers subject pour la compatibilité
      if (userObj.role === 'teacher' && userObj.subjects && userObj.subjects.length > 0) {
        userObj.subject = userObj.subjects[0];
      }
      return userObj;
    });
    
    res.json(mappedUsers);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
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
    // Harmonisation de class et classId
    if (req.body.class !== undefined && req.body.classId === undefined) {
      req.body.classId = req.body.class;
      delete req.body.class;
    } else if (req.body.classId !== undefined && req.body.class === undefined) {
      // Si on a classId mais pas class, garder classId uniquement
    }
    
    // Cast children IDs to ObjectId if present
    if (req.body.children && Array.isArray(req.body.children)) {
      const mongoose = require('mongoose');
      const validIds = req.body.children.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length !== req.body.children.length) {
        return res.status(400).json({ message: 'One or more children IDs are invalid ObjectIds.' });
      }
      req.body.children = validIds.map(id => new mongoose.Types.ObjectId(id));
    }
    
    // Traiter l'ID de classe s'il est fourni
    if (req.body.classId && req.body.classId !== 'null' && req.body.classId !== null) {
      if (!mongoose.Types.ObjectId.isValid(req.body.classId)) {
        return res.status(400).json({ message: 'ID de classe invalide' });
      }
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
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
      classId: classId, // Correction : utiliser classId au lieu de class
      parentId: validParentId,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address: address?.trim(),
      status: status || 'Actif',
      password: hashedPassword
    });
    
    const savedStudent = await student.save();
    
    // Mettre à jour le nombre d'étudiants dans la classe si une classe est assignée
    if (classId) {
      await Class.findByIdAndUpdate(classId, { $inc: { studentCount: 1 } });
    }
    
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
        classId: savedStudent.classId // Correction : retourner classId au lieu de class
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
      .populate('classId', 'name level')
      .select('-password');
    res.json(students);
  } catch (err) {
    console.error('Erreur lors de la récupération des étudiants:', err);
    res.status(500).json({ message: err.message });
  }
};

// Récupérer tous les étudiants non assignés à une classe
exports.getUnassignedStudents = async (req, res) => {
  try {
    const { schoolId } = req.query;
    
    let filter = { 
      role: 'student',
      $or: [
        { classId: { $exists: false } },
        { classId: null }
      ]
    };

    if (schoolId) {
      filter.schoolId = schoolId;
    }

    const unassignedStudents = await User.find(filter)
      .populate('schoolId', 'name')
      .select('-password')
      .sort({ name: 1 });

    res.json(unassignedStudents);
  } catch (err) {
    console.error('Erreur lors de la récupération des étudiants non assignés:', err);
    res.status(500).json({ message: err.message });
  }
};

// Affecter des étudiants à une classe
exports.assignStudentsToClass = async (req, res) => {
  try {
    const { studentIds, classId } = req.body;
    
    // Validation des paramètres
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Liste d\'étudiants requise' });
    }
    
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: 'ID de classe invalide' });
    }

    // Vérifier que la classe existe
    const Class = require('../models/Class');
    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      return res.status(404).json({ message: 'Classe introuvable' });
    }

    // Compter les étudiants actuels dans la classe
    const currentEnrollment = await User.countDocuments({ 
      classId: classId, 
      role: 'student' 
    });

    // Vérifier la capacité
    if (currentEnrollment + studentIds.length > targetClass.capacity) {
      return res.status(400).json({ 
        message: `Capacité insuffisante. Places disponibles: ${targetClass.capacity - currentEnrollment}` 
      });
    }

    // Vérifier que tous les étudiants existent et ne sont pas déjà assignés
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'Certains étudiants sont introuvables' });
    }

    // Vérifier qu'aucun étudiant n'est déjà assigné à une classe
    const alreadyAssigned = students.filter(student => student.classId);
    if (alreadyAssigned.length > 0) {
      return res.status(400).json({ 
        message: `Certains étudiants sont déjà assignés à une classe: ${alreadyAssigned.map(s => s.name).join(', ')}` 
      });
    }

    // Affecter les étudiants à la classe
    const result = await User.updateMany(
      { _id: { $in: studentIds } },
      { classId: classId }
    );

    // Mettre à jour le nombre d'étudiants dans la classe
    const newEnrollmentCount = currentEnrollment + result.modifiedCount;
    await Class.findByIdAndUpdate(classId, { studentCount: newEnrollmentCount });

    // Récupérer les étudiants mis à jour
    const updatedStudents = await User.find({ _id: { $in: studentIds } })
      .populate('classId', 'name level')
      .populate('schoolId', 'name')
      .select('-password');

    res.json({
      message: `${result.modifiedCount} étudiant(s) affecté(s) à la classe ${targetClass.name}`,
      students: updatedStudents,
      classInfo: {
        id: targetClass._id,
        name: targetClass.name,
        level: targetClass.level,
        newEnrollment: newEnrollmentCount
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'affectation des étudiants:', err);
    res.status(500).json({ message: err.message });
  }
};

// Retirer un étudiant d'une classe
exports.removeStudentFromClass = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'ID d\'étudiant invalide' });
    }

    const student = await User.findOne({ 
      _id: studentId, 
      role: 'student' 
    }).populate('classId', 'name level');

    if (!student) {
      return res.status(404).json({ message: 'Étudiant introuvable' });
    }

    if (!student.classId) {
      return res.status(400).json({ message: 'L\'étudiant n\'est assigné à aucune classe' });
    }

    const previousClass = student.classId;
    
    // Retirer l'affectation
    student.classId = null;
    await student.save();

    // Mettre à jour le nombre d'étudiants dans la classe précédente
    await Class.findByIdAndUpdate(previousClass._id, { $inc: { studentCount: -1 } });

    // Récupérer l'étudiant mis à jour
    const updatedStudent = await User.findById(studentId)
      .populate('schoolId', 'name')
      .select('-password');

    res.json({
      message: `Étudiant ${student.name} retiré de la classe ${previousClass.name}`,
      student: updatedStudent,
      previousClass: {
        id: previousClass._id,
        name: previousClass.name,
        level: previousClass.level
      }
    });
  } catch (err) {
    console.error('Erreur lors du retrait de l\'étudiant:', err);
    res.status(500).json({ message: err.message });
  }
};

// Transférer un étudiant d'une classe à une autre
exports.transferStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { newClassId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'ID d\'étudiant invalide' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(newClassId)) {
      return res.status(400).json({ message: 'ID de nouvelle classe invalide' });
    }

    const student = await User.findOne({ 
      _id: studentId, 
      role: 'student' 
    }).populate('classId', 'name level');

    if (!student) {
      return res.status(404).json({ message: 'Étudiant introuvable' });
    }

    const Class = require('../models/Class');
    const newClass = await Class.findById(newClassId);
    if (!newClass) {
      return res.status(404).json({ message: 'Nouvelle classe introuvable' });
    }

    // Vérifier la capacité de la nouvelle classe
    const currentEnrollment = await User.countDocuments({ 
      classId: newClassId, 
      role: 'student' 
    });

    if (currentEnrollment >= newClass.capacity) {
      return res.status(400).json({ 
        message: `Capacité insuffisante dans la classe ${newClass.name}` 
      });
    }

    const previousClass = student.classId;
    
    // Effectuer le transfert
    student.classId = newClassId;
    await student.save();

    // Mettre à jour les compteurs d'étudiants
    if (previousClass) {
      // Décrémenter l'ancienne classe
      await Class.findByIdAndUpdate(previousClass._id, { $inc: { studentCount: -1 } });
    }
    // Incrémenter la nouvelle classe
    await Class.findByIdAndUpdate(newClassId, { $inc: { studentCount: 1 } });

    // Récupérer l'étudiant mis à jour
    const updatedStudent = await User.findById(studentId)
      .populate('classId', 'name level')
      .populate('schoolId', 'name')
      .select('-password');

    res.json({
      message: `Étudiant ${student.name} transféré ${previousClass ? `de ${previousClass.name} ` : ''}vers ${newClass.name}`,
      student: updatedStudent,
      transfer: {
        from: previousClass ? {
          id: previousClass._id,
          name: previousClass.name,
          level: previousClass.level
        } : null,
        to: {
          id: newClass._id,
          name: newClass.name,
          level: newClass.level
        }
      }
    });
  } catch (err) {
    console.error('Erreur lors du transfert de l\'étudiant:', err);
    res.status(500).json({ message: err.message });
  }
};
