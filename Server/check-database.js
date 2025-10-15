const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connecté à MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    return false;
  }
}

async function checkDatabase() {
  try {
    console.log('=== VÉRIFICATION DE LA BASE DE DONNÉES ===\n');
    
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    const User = require('./models/User');
    const School = require('./models/School');
    const Subject = require('./models/Subject');
    
    // Vérifier les utilisateurs
    const users = await User.find({}).populate('schoolId');
    console.log(`${users.length} utilisateur(s) trouvé(s):`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Rôle: ${user.role} - École: ${user.schoolId ? user.schoolId.name : 'Aucune'}`);
    });
    console.log('');
    
    // Vérifier les écoles
    const schools = await School.find({});
    console.log(`${schools.length} école(s) trouvée(s):`);
    schools.forEach(school => {
      console.log(`  - ${school.name} (ID: ${school._id})`);
    });
    console.log('');
    
    // Vérifier les matières
    const subjects = await Subject.find({}).populate('schoolId');
    console.log(`${subjects.length} matière(s) trouvée(s):`);
    subjects.forEach(subject => {
      console.log(`  - ${subject.name} (École: ${subject.schoolId ? subject.schoolId.name : 'Aucune'})`);
    });
    
    // Si nous avons des utilisateurs mais pas d'écoles, créons une école par défaut
    if (users.length > 0 && schools.length === 0) {
      console.log('\n=== CRÉATION D\'UNE ÉCOLE PAR DÉFAUT ===');
      
      const defaultSchool = new School({
        name: 'École Daara',
        address: 'Dakar, Sénégal',
        phone: '+221 33 xxx xx xx',
        email: 'contact@ecole-daara.sn',
        principalName: 'Directeur Principal',
        status: 'Actif'
      });
      
      await defaultSchool.save();
      console.log(`✓ École créée: ${defaultSchool.name} (ID: ${defaultSchool._id})`);
      
      // Assigner tous les utilisateurs à cette école
      for (const user of users) {
        if (!user.schoolId) {
          user.schoolId = defaultSchool._id;
          await user.save();
          console.log(`✓ Utilisateur ${user.name} assigné à l'école`);
        }
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkDatabase();