const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Modèles
const User = require('./models/User');
const School = require('./models/School');

async function createUnassignedStudents() {
  try {
    // Connexion à MongoDB avec la variable d'environnement
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Récupérer l'école "Les Pedagogues" par son ID
    const schoolId = new mongoose.Types.ObjectId('68c7700cd9f7c4207d3c9ea6');
    const school = await School.findById(schoolId);
    if (!school) {
      console.error('❌ École non trouvée avec l\'ID spécifié');
      // Essayons de lister les écoles pour debug
      const schools = await School.find();
      console.log('🏫 Écoles disponibles:');
      schools.forEach(s => console.log(`   - ${s._id}: ${s.name}`));
      return;
    }
    console.log(`✅ École trouvée: ${school.name} (ID: ${school._id})`);

    // Étudiants à créer (non assignés à des classes)
    const studentsData = [
      { name: 'Fatou Sall', email: 'fatou.sall@etudiant.com', age: 13, gender: 'Féminin' },
      { name: 'Moussa Diop', email: 'moussa.diop@etudiant.com', age: 14, gender: 'Masculin' },
      { name: 'Aïssa Ndiaye', email: 'aissa.ndiaye@etudiant.com', age: 12, gender: 'Féminin' },
      { name: 'Ibrahima Fall', email: 'ibrahima.fall@etudiant.com', age: 13, gender: 'Masculin' },
      { name: 'Khadija Mbaye', email: 'khadija.mbaye@etudiant.com', age: 14, gender: 'Féminin' },
      { name: 'Abdoulaye Sarr', email: 'abdoulaye.sarr@etudiant.com', age: 12, gender: 'Masculin' },
      { name: 'Rama Diallo', email: 'rama.diallo@etudiant.com', age: 13, gender: 'Féminin' },
      { name: 'Cheikh Diouf', email: 'cheikh.diouf@etudiant.com', age: 14, gender: 'Masculin' },
      { name: 'Marième Ba', email: 'marieme.ba@etudiant.com', age: 12, gender: 'Féminin' },
      { name: 'Ousmane Wade', email: 'ousmane.wade@etudiant.com', age: 13, gender: 'Masculin' }
    ];

    console.log(`🎯 Création de ${studentsData.length} étudiants non assignés...`);

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      
      // Vérifier si l'étudiant existe déjà
      const existingStudent = await User.findOne({ email: studentData.email });
      if (existingStudent) {
        console.log(`⚠️  Étudiant déjà existant: ${studentData.name}`);
        continue;
      }

      // Hacher le mot de passe par défaut
      const defaultPassword = 'password123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Créer l'étudiant (SANS classId pour qu'il soit non assigné)
      const student = new User({
        name: studentData.name,
        email: studentData.email,
        password: hashedPassword,
        role: 'student',
        schoolId: school._id,
        gender: studentData.gender,
        dateOfBirth: new Date(2025 - studentData.age, 0, 1), // Approximatif
        // Pas de classId = étudiant non assigné
        status: 'Actif',
        createdAt: new Date()
      });

      await student.save();
      console.log(`✅ Étudiant créé: ${studentData.name} (${studentData.email})`);
    }

    console.log('🎉 Tous les étudiants non assignés ont été créés avec succès !');
    console.log('📝 Mot de passe par défaut pour tous: password123');

    // Vérification: compter les étudiants non assignés
    const unassignedCount = await User.countDocuments({
      role: 'student',
      schoolId: school._id,
      classId: { $exists: false }
    });
    console.log(`📊 Total d'étudiants non assignés: ${unassignedCount}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Lancer le script
createUnassignedStudents();