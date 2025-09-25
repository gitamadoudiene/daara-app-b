const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/daara-app')
.then(() => {
  console.log('Connexion à MongoDB réussie');
  
  // Chercher l'utilisateur adminpeds
  return User.find({
    $or: [
      {email: {$regex: 'adminpeds', $options: 'i'}},
      {firstName: {$regex: 'adminpeds', $options: 'i'}},
      {lastName: {$regex: 'adminpeds', $options: 'i'}},
      {name: {$regex: 'adminpeds', $options: 'i'}}
    ]
  });
})
.then(users => {
  console.log(`${users.length} utilisateur(s) trouvé(s):`);
  users.forEach(user => {
    console.log('---');
    console.log('Email:', user.email);
    console.log('Nom:', user.firstName, user.lastName);
    console.log('Name:', user.name);
    console.log('Rôle:', user.role);
    console.log('École ID:', user.schoolId);
  });
  
  // Chercher aussi tous les admins
  return User.find({role: 'admin'});
})
.then(admins => {
  console.log(`\n${admins.length} admin(s) trouvé(s):`);
  admins.forEach(admin => {
    console.log(`- ${admin.email} (${admin.firstName} ${admin.lastName})`);
  });
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('Erreur:', err);
  mongoose.disconnect();
});