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
    if (teacherId && teacherId !== null && teacherId !== 'null' && teacherId !== 'none' && teacherId !== '') {
      console.log('🔍 Vérification enseignant pour création:', { teacherId, schoolId });
      const teacher = await User.findOne({ 
        _id: teacherId, 
        role: 'teacher',
        schoolId: schoolId 
      });
      console.log('👨‍🏫 Enseignant trouvé pour création:', teacher);
      if (!teacher) {
        return res.status(404).json({ message: 'Enseignant non trouvé dans cette école' });
      }
    }

    // Préparer teacherId pour la création
    const finalTeacherId = (teacherId && teacherId !== 'null' && teacherId !== 'none' && teacherId !== '') ? teacherId : null;
    console.log('📝 teacherId final pour création:', finalTeacherId);

    // Créer la matière
    const subject = new Subject({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      schoolId,
      teacherId: finalTeacherId
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

// Récupérer toutes les matières (pour l'interface admin)
const getAllSubjects = async (req, res) => {
  try {
    // Récupérer l'école de l'utilisateur connecté depuis le token
    const userSchoolId = req.user.schoolId;
    
    const subjects = await Subject.find({ schoolId: userSchoolId })
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
    console.log('🔄 === DÉBUT MODIFICATION MATIÈRE ===');
    const { id } = req.params;
    const { name, code, description, teacherId, status } = req.body;
    console.log('📝 Données reçues:', { id, name, code, description, teacherId, status });

    const subject = await Subject.findById(id);
    console.log('📚 Matière trouvée:', subject);
    
    if (!subject) {
      console.log('❌ Matière non trouvée');
      return res.status(404).json({ message: 'Matière non trouvée' });
    }

    console.log('✅ Matière existante trouvée');

    // Vérifier si l'enseignant existe (si fourni)
    if (teacherId && teacherId !== null && teacherId !== 'null' && teacherId !== '') {
      console.log('🔍 Vérification enseignant:', { teacherId, schoolId: subject.schoolId });
      const teacher = await User.findOne({ 
        _id: teacherId, 
        role: 'teacher',
        schoolId: subject.schoolId 
      });
      console.log('👨‍🏫 Enseignant trouvé:', teacher);
      if (!teacher) {
        console.log('❌ Enseignant non trouvé');
        return res.status(404).json({ message: 'Enseignant non trouvé dans cette école' });
      }
    }

    console.log('🔄 Mise à jour des champs...');

    // Mettre à jour les champs
    if (name) {
      console.log('📝 Mise à jour nom:', name);
      subject.name = name.trim();
    }
    if (code) {
      console.log('📝 Mise à jour code:', code);
      subject.code = code.trim().toUpperCase();
    }
    if (description !== undefined) {
      console.log('📝 Mise à jour description:', description);
      subject.description = description.trim();
    }
    
    // Gestion spéciale pour teacherId
    if (teacherId !== undefined) {
      console.log('📝 Mise à jour teacherId:', { teacherId, type: typeof teacherId });
      if (teacherId === null || teacherId === 'null' || teacherId === 'none' || teacherId === '') {
        subject.teacherId = null;
        console.log('✅ teacherId mis à null');
      } else {
        subject.teacherId = teacherId;
        console.log('✅ teacherId mis à jour:', teacherId);
      }
    }
    
    if (status) {
      console.log('📝 Mise à jour status:', status);
      subject.status = status;
    }

    console.log('💾 Sauvegarde en cours...');
    await subject.save();
    console.log('✅ Sauvegarde réussie');

    // Populer les données pour la réponse
    console.log('🔄 Population des données...');
    await subject.populate('teacherId', 'name firstName lastName');
    await subject.populate('schoolId', 'name');

    console.log('📚 Matière finale:', subject);
    console.log('✅ === MODIFICATION RÉUSSIE ===');

    res.json({
      message: 'Matière mise à jour avec succès',
      subject
    });

  } catch (error) {
    console.error('❌ === ERREUR MODIFICATION MATIÈRE ===');
    console.error('📝 Erreur détaillée:', error);
    console.error('📝 Stack trace:', error.stack);
    
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