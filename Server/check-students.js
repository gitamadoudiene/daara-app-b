const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

mongoose.connect('mongodb://localhost:27017/daara-app')
.then(() => {
  console.log('Connexion à MongoDB réussie');
  
  // Trouver l'école Les Pédagogues
  return School.findOne({name: {$regex: 'pédagogues', $options: 'i'}});
})
.then(school => {
  if (!school) {
    console.log('❌ École Les Pédagogues non trouvée');
    return;
  }
  
  console.log('🏫 École trouvée:', school.name, 'ID:', school._id);
  
  // Chercher tous les étudiants de cette école
  return User.find({
    schoolId: school._id,
    role: 'student'
  });
})
.then(students => {
  if (!students) return;
  
  console.log(`\n📚 ${students.length} étudiant(s) trouvé(s):`);
  students.forEach(student => {
    console.log(`- ${student.firstName} ${student.lastName} (${student.email}) - Classe: ${student.classId || 'NON ASSIGNÉ'}`);
  });
  
  // Compter ceux non assignés
  const unassigned = students.filter(s => !s.classId);
  console.log(`\n🎯 ${unassigned.length} étudiant(s) non assigné(s):`);
  unassigned.forEach(student => {
    console.log(`- ${student.firstName} ${student.lastName} (${student.email})`);
  });
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('Erreur:', err);
  mongoose.disconnect();
});