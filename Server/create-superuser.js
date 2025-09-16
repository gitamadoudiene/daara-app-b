const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer les modèles
const User = require('./models/User');
const School = require('./models/School');
const Class = require('./models/Class');

async function createSuperUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Vérifier si le super utilisateur existe déjà
    const existingSuperUser = await User.findOne({ email: 'superuser@daara.com' });
    if (existingSuperUser) {
      console.log('⚠️ Le super utilisateur existe déjà');
      
      // Mettre à jour ses informations pour s'assurer qu'il a toutes les permissions
      existingSuperUser.role = 'super_user';
      existingSuperUser.name = 'Super Utilisateur';
      // Réinitialiser le mot de passe au cas où
      const hashedPassword = await bcrypt.hash('password', 10);
      existingSuperUser.password = hashedPassword;
      
      await existingSuperUser.save();
      console.log('✅ Super utilisateur mis à jour');
    } else {
      // Créer le super utilisateur
      const hashedPassword = await bcrypt.hash('password', 10);
      
      const superUser = new User({
        email: 'superuser@daara.com',
        name: 'Super Utilisateur',
        role: 'super_user',
        password: hashedPassword,
        phone: '+221 77 123 45 67',
        avatar: null,
        schoolId: null, // Super user n'est lié à aucune école spécifique
        classes: [], 
        subjects: [],
        children: [],
        qualification: 'Administrateur Système',
        experience: 'Administration complète du système'
      });

      await superUser.save();
      console.log('✅ Super utilisateur créé avec succès');
    }

    // Créer une école de test si elle n'existe pas
    let testSchool = await School.findOne({ name: 'École de Test DAARA' });
    if (!testSchool) {
      testSchool = new School({
        name: 'École de Test DAARA',
        address: 'Dakar, Sénégal',
        phone: '+221 33 123 45 67',
        email: 'test@daara.com',
        director: 'Directeur Test',
        adminCount: 1,
        teacherCount: 0,
        studentCount: 0,
        createdYear: '2024',
        addedDate: new Date().toISOString().split('T')[0],
        status: 'Actif',
        type: 'Public'
      });
      await testSchool.save();
      console.log('✅ École de test créée');
    }

    // Créer quelques classes de test
    const testClasses = [
      { name: 'CP', schoolId: testSchool._id, level: 'Primaire', capacity: 30, academicYear: '2024-2025' },
      { name: 'CE1', schoolId: testSchool._id, level: 'Primaire', capacity: 30, academicYear: '2024-2025' },
      { name: 'CE2', schoolId: testSchool._id, level: 'Primaire', capacity: 30, academicYear: '2024-2025' },
      { name: '6ème', schoolId: testSchool._id, level: 'Collège', capacity: 35, academicYear: '2024-2025' },
      { name: '5ème', schoolId: testSchool._id, level: 'Collège', capacity: 35, academicYear: '2024-2025' },
      { name: '2nde', schoolId: testSchool._id, level: 'Lycée', capacity: 40, academicYear: '2024-2025' }
    ];

    for (const classData of testClasses) {
      const existingClass = await Class.findOne({ 
        name: classData.name, 
        schoolId: classData.schoolId 
      });
      
      if (!existingClass) {
        const newClass = new Class(classData);
        await newClass.save();
        console.log(`✅ Classe ${classData.name} créée`);
      }
    }

    // Créer un admin test lié à l'école
    const existingAdmin = await User.findOne({ email: 'testuser@example.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const adminUser = new User({
        email: 'testuser@example.com',
        name: 'Administrateur Test',
        role: 'admin',
        password: hashedPassword,
        phone: '+221 77 234 56 78',
        schoolId: testSchool._id,
        classes: [],
        subjects: [],
        children: []
      });

      await adminUser.save();
      console.log('✅ Administrateur test créé');
    }

    // Créer un enseignant test
    const existingTeacher = await User.findOne({ email: 'teacher1@example.com' });
    if (!existingTeacher) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const teacherUser = new User({
        email: 'teacher1@example.com',
        name: 'Enseignant Test',
        role: 'teacher',
        password: hashedPassword,
        phone: '+221 77 345 67 89',
        schoolId: testSchool._id,
        classes: ['6ème', '5ème'],
        subjects: ['Mathématiques', 'Physique'],
        children: [],
        qualification: 'Licence en Mathématiques',
        experience: '5 ans d\'enseignement'
      });

      await teacherUser.save();
      console.log('✅ Enseignant test créé');
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('📧 Email super utilisateur: superuser@daara.com');
    console.log('🔑 Mot de passe: password');
    console.log('🏫 École de test créée avec des classes');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  createSuperUser();
}

module.exports = createSuperUser;