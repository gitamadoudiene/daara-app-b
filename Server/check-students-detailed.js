const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/daara-app')
.then(() => {
  console.log('Connexion à MongoDB réussie');
  
  // Chercher tous les étudiants
  return User.find({ role: 'student' });
})
.then(students => {
  console.log(`\n📚 ${students.length} étudiant(s) trouvé(s):`);
  students.forEach((student, index) => {
    console.log(`\n--- Étudiant ${index + 1} ---`);
    console.log('ID:', student._id);
    console.log('Nom:', student.firstName, student.lastName);
    console.log('Email:', student.email);
    console.log('École ID:', student.schoolId);
    console.log('Classe ID:', student.classId || 'NON ASSIGNÉ');
    console.log('Rôle:', student.role);
  });
  
  // Chercher l'admin connecté pour comparer l'école
  return User.findOne({ email: 'adminpeds@lespedagogues.com' });
})
.then(admin => {
  if (admin) {
    console.log(`\n👤 Admin - École ID: ${admin.schoolId}`);
  }
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('Erreur:', err);
  mongoose.disconnect();
});