const mongoose = require('mongoose');
const School = require('./models/School');
const User = require('./models/User');

require('dotenv').config();

async function testSchoolsAPI() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Vérifier les écoles existantes
    const schools = await School.find();
    console.log('\n📚 Écoles dans la base de données:');
    console.log(`Nombre d'écoles: ${schools.length}`);
    schools.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} (ID: ${school._id})`);
    });

    // 2. Vérifier les utilisateurs avec schoolId
    const usersWithSchool = await User.find({ schoolId: { $exists: true, $ne: null } })
      .populate('schoolId', 'name')
      .limit(5);
    
    console.log('\n👥 Utilisateurs avec école assignée:');
    console.log(`Nombre d'utilisateurs avec école: ${usersWithSchool.length}`);
    usersWithSchool.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - École: ${user.schoolId?.name || 'Non populé'} (ID école: ${user.schoolId?._id})`);
    });

    // 3. Vérifier les utilisateurs sans école
    const usersWithoutSchool = await User.find({ 
      $or: [
        { schoolId: { $exists: false } },
        { schoolId: null },
        { schoolId: '' }
      ]
    }).limit(5);
    
    console.log('\n❌ Utilisateurs SANS école assignée:');
    console.log(`Nombre d'utilisateurs sans école: ${usersWithoutSchool.length}`);
    usersWithoutSchool.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - École: ${user.schoolId || 'null/undefined'}`);
    });

    // 4. Si pas d'écoles, en créer une pour test
    if (schools.length === 0) {
      console.log('\n🔧 Création d\'une école de test...');
      const testSchool = new School({
        name: 'École de Test',
        address: '123 Rue Test',
        phone: '+221 77 123 45 67',
        email: 'test@ecole.com',
        director: 'Directeur Test',
        createdYear: 2023,
        type: 'Publique',
        status: 'Actif'
      });
      
      const savedSchool = await testSchool.save();
      console.log(`✅ École de test créée: ${savedSchool.name} (ID: ${savedSchool._id})`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

testSchoolsAPI();