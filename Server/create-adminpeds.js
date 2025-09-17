const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/daara-app')
.then(() => {
  console.log('Connexion à MongoDB réussie');
  
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  const adminUser = new User({
    email: 'adminpeds@lespedagogues.com',
    name: 'AdminPeds Admin',
    firstName: 'AdminPeds',
    lastName: 'Admin',
    role: 'admin',
    schoolId: '68c8d3125f2fd9a7fe8d2e78', // Même école que testuser
    gender: 'Masculin',
    password: hashedPassword
  });
  
  return adminUser.save();
})
.then(savedUser => {
  console.log('Utilisateur adminpeds créé avec succès:');
  console.log('Email:', savedUser.email);
  console.log('Rôle:', savedUser.role);
  console.log('École ID:', savedUser.schoolId);
  mongoose.disconnect();
})
.catch(err => {
  console.error('Erreur:', err);
  mongoose.disconnect();
});