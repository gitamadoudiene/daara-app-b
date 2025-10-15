const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetTestUser() {
  try {
    console.log('=== RÉINITIALISATION DE L\'UTILISATEUR TEST ===\n');
    
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
      console.log('❌ École "École Daara" non trouvée.');
      console.log('Exécutez d\'abord: node create-school-subjects.js');
      process.exit(1);
    }
    
    console.log(`✓ École trouvée: ${school.name} (ID: ${school._id})`);
    
    // Supprimer l'utilisateur test s'il existe
    const deleted = await User.deleteMany({ email: 'prof.test@daara.sn' });
    if (deleted.deletedCount > 0) {
      console.log(`✓ ${deleted.deletedCount} ancien(s) utilisateur(s) supprimé(s)`);
    }
    
    // Créer un nouvel utilisateur test avec un mot de passe simple
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const testUser = new User({
      name: 'Professeur Test',
      email: 'prof.test@daara.sn',
      password: hashedPassword,
      role: 'teacher',
      schoolId: school._id
    });
    
    await testUser.save();
    console.log('✅ Nouvel utilisateur test créé avec succès !');
    
    // Tester le mot de passe
    const testLogin = await bcrypt.compare('123456', testUser.password);
    console.log(`✓ Test du mot de passe: ${testLogin ? 'OK' : 'ÉCHEC'}`);
    
    console.log('\n=== INFORMATIONS POUR POSTMAN ===');
    console.log('URL: POST http://localhost:5000/api/auth/login');
    console.log('Body JSON:');
    console.log(JSON.stringify({
      email: 'prof.test@daara.sn',
      password: '123456'
    }, null, 2));
    
    console.log('\n=== VÉRIFICATION ===');
    console.log(`Email: ${testUser.email}`);
    console.log(`Nom: ${testUser.name}`);
    console.log(`Rôle: ${testUser.role}`);
    console.log(`École ID: ${testUser.schoolId}`);
    console.log(`Mot de passe hashé: ${testUser.password.substring(0, 20)}...`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

resetTestUser();