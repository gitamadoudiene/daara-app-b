const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

require('dotenv').config();

async function testUsersAPI() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Vérifier les écoles dans la DB
    const schools = await School.find();
    console.log(`\n🏫 ${schools.length} école(s) dans la DB:`);
    schools.forEach((school, i) => {
      console.log(`  ${i+1}. ${school.name} (ID: ${school._id})`);
    });

    // 2. Simuler exactement ce que fait l'API getAllUsers
    console.log('\n👥 Test de getAllUsers (avec populate):');
    const usersWithPopulate = await User.find()
      .populate('schoolId', 'name')
      .select('-password');
    
    console.log(`Nombre d'utilisateurs: ${usersWithPopulate.length}`);
    
    // Afficher les 5 premiers utilisateurs avec leurs écoles
    console.log('\n📊 Échantillon d\'utilisateurs (comme l\'API):');
    usersWithPopulate.slice(0, 5).forEach((user, i) => {
      console.log(`${i+1}. ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Rôle: ${user.role}`);
      console.log(`   - SchoolId brut: ${user.schoolId}`);
      console.log(`   - Type de schoolId: ${typeof user.schoolId}`);
      if (user.schoolId) {
        console.log(`   - École populée: ${user.schoolId.name} (ID: ${user.schoolId._id})`);
      } else {
        console.log(`   - École: Non assignée`);
      }
      console.log('');
    });

    // 3. Vérifier la structure JSON exacte
    console.log('\n🔍 Structure JSON brute (comme reçue par le frontend):');
    const sampleUser = usersWithPopulate[0];
    if (sampleUser) {
      console.log('JSON.stringify du premier utilisateur:');
      console.log(JSON.stringify(sampleUser, null, 2));
    }

    // 4. Simuler la transformation du frontend
    console.log('\n🔄 Simulation de la transformation frontend:');
    if (sampleUser) {
      const transformed = {
        id: sampleUser._id,
        name: sampleUser.name,
        email: sampleUser.email,
        phone: sampleUser.phone || '',
        role: sampleUser.role,
        school: sampleUser.schoolId?.name || 'Non assigné',
        schoolId: sampleUser.schoolId?._id || '',
        status: sampleUser.status || 'Actif'
      };
      console.log('Utilisateur transformé:');
      console.log(JSON.stringify(transformed, null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

testUsersAPI();