const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('=== CRÉATION D\'UN UTILISATEUR TEST ===\n');
    
    await mongoose.connect('mongodb://localhost:27017/daara_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connecté à MongoDB');
    
    const User = require('./models/User');
    const School = require('./models/School');
    
    // Vérifier que l'école existe
    const school = await School.findOne({ name: 'École Daara' });
    if (!school) {
      console.log('❌ École "École Daara" non trouvée. Exécutez d\'abord create-school-subjects.js');
      process.exit(1);
    }
    
    console.log(`✓ École trouvée: ${school.name} (ID: ${school._id})`);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: 'prof.test@daara.sn' });
    if (existingUser) {
      console.log('○ Utilisateur test existe déjà');
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Nom: ${existingUser.name}`);
      console.log(`  Rôle: ${existingUser.role}`);
      console.log(`  École: ${existingUser.schoolId || 'Non assignée'}`);
      
      // Mettre à jour l'école si nécessaire
      if (!existingUser.schoolId) {
        existingUser.schoolId = school._id;
        await existingUser.save();
        console.log('✓ École assignée à l\'utilisateur existant');
      }
    } else {
      // Créer un nouvel utilisateur
      const hashedPassword = await bcrypt.hash('motdepasse123', 10);
      
      const testUser = new User({
        name: 'Professeur Test',
        email: 'prof.test@daara.sn',
        password: hashedPassword,
        role: 'teacher',
        schoolId: school._id
      });
      
      await testUser.save();
      console.log('✓ Utilisateur test créé');
      console.log(`  Email: ${testUser.email}`);
      console.log(`  Mot de passe: motdepasse123`);
      console.log(`  Rôle: ${testUser.role}`);
      console.log(`  École: ${school.name}`);
    }
    
    console.log('\n=== INFORMATIONS POUR LES TESTS ===');
    console.log('Email: prof.test@daara.sn');
    console.log('Mot de passe: motdepasse123');
    console.log(`École ID: ${school._id}`);
    console.log('Utilisez ces informations dans Postman pour vous connecter.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestUser();