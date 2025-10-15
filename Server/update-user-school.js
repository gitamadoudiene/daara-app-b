const mongoose = require('mongoose');

async function updateUserSchool() {
  try {
    console.log('=== MISE À JOUR DE L\'UTILISATEUR ===\n');
    
    await mongoose.connect('mongodb://localhost:27017/daara_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connecté à MongoDB');
    
    const User = require('./models/User');
    const School = require('./models/School');
    
    // Trouver l'école créée
    const school = await School.findOne({ name: 'École Daara' });
    if (!school) {
      console.log('❌ École non trouvée');
      process.exit(1);
    }
    
    console.log(`✓ École trouvée: ${school.name} (ID: ${school._id})`);
    
    // Trouver tous les utilisateurs sans école
    const users = await User.find({});
    console.log(`${users.length} utilisateur(s) trouvé(s)`);
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Vous devez d\'abord vous créer un compte.');
      process.exit(1);
    }
    
    // Mettre à jour tous les utilisateurs pour les associer à l'école
    for (const user of users) {
      if (!user.schoolId) {
        user.schoolId = school._id;
        await user.save();
        console.log(`✓ Utilisateur ${user.name} (${user.email}) associé à l'école`);
      } else {
        console.log(`○ Utilisateur ${user.name} (${user.email}) déjà associé à une école`);
      }
    }
    
    // Vérification finale
    const updatedUsers = await User.find({}).populate('schoolId');
    console.log('\n=== VÉRIFICATION ===');
    updatedUsers.forEach(user => {
      console.log(`${user.name} (${user.role}) -> École: ${user.schoolId ? user.schoolId.name : 'Aucune'}`);
    });
    
    console.log('\n✅ Mise à jour terminée !');
    console.log('⚠️  IMPORTANT: Vous devez vous reconnecter dans l\'application pour obtenir un nouveau token JWT.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateUserSchool();