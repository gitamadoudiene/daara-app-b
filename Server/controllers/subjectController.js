const Subject = require('../models/Subject');
const User = require('../models/User');
const School = require('../models/School');

// Créer une nouvelle matière
const createSubject = async (req, res) => {
  try {
    const { name, code, description, teacherId, schoolId } = req.body;

    // Vérifications
    if (!name || !code || !schoolId) {
      return res.status(400).json({ 
        message: 'Le nom, le code et l\'ID de l\'école sont requis' 
      });
    }

    // Vérifier si l'école existe
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'École non trouvée' });
    }

    // Vérifier si l'enseignant existe (si fourni)
    if (teacherId) {
      const teacher = await User.findOne({ 
        _id: teacherId, 
        role: 'teacher',
        schoolId: schoolId 
      });
      if (!teacher) {
        return res.status(404).json({ message: 'Enseignant non trouvé dans cette école' });
      }
    }

    // Créer la matière
    const subject = new Subject({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      schoolId,
      teacherId: teacherId || null
    });

    await subject.save();

    // Populer les données pour la réponse
    await subject.populate('teacherId', 'name firstName lastName');
    await subject.populate('schoolId', 'name');

    res.status(201).json({
      message: 'Matière créée avec succès',
      subject
    });

  } catch (error) {
    console.error('Erreur lors de la création de la matière:', error);
    
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      const message = duplicateField === 'code' 
        ? 'Ce code de matière existe déjà dans cette école'
        : 'Cette matière existe déjà dans cette école';
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de la création de la matière' 
    });
  }
};

// Récupérer toutes les matières d'une école
const getSubjectsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const subjects = await Subject.find({ schoolId })
      .populate('teacherId', 'name firstName lastName')
      .populate('schoolId', 'name')
      .sort({ name: 1 });

    res.json(subjects);

  } catch (error) {
    console.error('Erreur lors de la récupération des matières:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des matières' 
    });
  }
};

// Récupérer une matière par ID
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id)
      .populate('teacherId', 'name firstName lastName')
      .populate('schoolId', 'name');

    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    res.json(subject);

  } catch (error) {
    console.error('Erreur lors de la récupération de la matière:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de la matière' 
    });
  }
};

// Mettre à jour une matière
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, teacherId, status } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    // Vérifier si l'enseignant existe (si fourni)
    if (teacherId && teacherId !== 'null') {
      const teacher = await User.findOne({ 
        _id: teacherId, 
        role: 'teacher',
        schoolId: subject.schoolId 
      });
      if (!teacher) {
        return res.status(404).json({ message: 'Enseignant non trouvé dans cette école' });
      }
    }

    // Mettre à jour les champs
    if (name) subject.name = name.trim();
    if (code) subject.code = code.trim().toUpperCase();
    if (description !== undefined) subject.description = description.trim();
    if (teacherId !== undefined) {
      subject.teacherId = teacherId === 'null' ? null : teacherId;
    }
    if (status) subject.status = status;

    await subject.save();

    // Populer les données pour la réponse
    await subject.populate('teacherId', 'name firstName lastName');
    await subject.populate('schoolId', 'name');

    res.json({
      message: 'Matière mise à jour avec succès',
      subject
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la matière:', error);
    
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      const message = duplicateField === 'code' 
        ? 'Ce code de matière existe déjà dans cette école'
        : 'Cette matière existe déjà dans cette école';
      return res.status(400).json({ message });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour de la matière' 
    });
  }
};

// Supprimer une matière
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    await Subject.findByIdAndDelete(id);

    res.json({ message: 'Matière supprimée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de la matière:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression de la matière' 
    });
  }
};

module.exports = {
  createSubject,
  getSubjectsBySchool,
  getSubjectById,
  updateSubject,
  deleteSubject
};