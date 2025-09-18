const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

// Script pour tester la récupération des enseignants par école
async function testTeachersBySchool() {
  try {
    // Connexion à la base de données
    await mongoose.connect('mongodb://localhost:27017/daara-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connecté à MongoDB');

    // Récupérer une école existante
    const school = await School.findOne();
    if (!school) {
      console.log('❌ Aucune école trouvée');
      return;
    }

    console.log(`🏫 École trouvée: ${school.name} (ID: ${school._id})`);

    // Récupérer les enseignants de cette école
    const teachers = await User.find({
      role: 'teacher',
      schoolId: school._id
    }).select('-password');

    console.log(`👩‍🏫 Nombre d'enseignants dans l'école: ${teachers.length}`);

    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. ${teacher.name} (${teacher.email})`);
      console.log(`   Matières: ${teacher.subjects?.join(', ') || 'Aucune'}`);
      console.log(`   Téléphone: ${teacher.phone || 'Non défini'}`);
      console.log('');
    });

    // Tester l'API endpoint simulé
    console.log('🌐 Test de l\'endpoint /api/teachers/school/:schoolId');
    console.log(`URL: /api/teachers/school/${school._id}`);
    console.log(`Résultat attendu: ${teachers.length} enseignants`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Déconnecté de MongoDB');
  }
}

// Exécuter le test
testTeachersBySchool();