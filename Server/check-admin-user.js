const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/daara-app')
.then(() => {
  console.log('✅ Connexion MongoDB réussie');
  
  // Chercher l'admin avec l'email exact
  return User.findOne({ email: 'admin@lespedagogues.com' });
})
.then(admin => {
  if (admin) {
    console.log('\n✅ UTILISATEUR TROUVÉ:');
    console.log('ID:', admin._id);
    console.log('Email:', admin.email);
    console.log('Nom:', admin.firstName, admin.lastName);
    console.log('Rôle:', admin.role);
    console.log('École ID:', admin.schoolId);
    console.log('Mot de passe hashé:', admin.password ? 'PRÉSENT' : 'ABSENT');
    console.log('Date création:', admin.createdAt);
  } else {
    console.log('\n❌ UTILISATEUR NON TROUVÉ avec email: admin@lespedagogues.com');
    
    // Chercher tous les admins pour voir ce qui existe
    return User.find({ role: 'admin' });
  }
})
.then(admins => {
  if (admins && admins.length > 0) {
    console.log('\n📋 TOUS LES ADMINS EXISTANTS:');
    admins.forEach((admin, i) => {
      console.log(`${i+1}. ${admin.email} - ${admin.firstName} ${admin.lastName}`);
    });
  }
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('❌ Erreur:', err);
  mongoose.disconnect();
});