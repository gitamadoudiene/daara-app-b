const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

mongoose.connect('mongodb://localhost:27017/daara-app')
.then(() => {
  console.log('Connexion à MongoDB réussie');
  
  // Vérifier l'école avec l'ID correct
  return School.findById('68c7700cd9f7c4207d3c9ea6');
})
.then(school => {
  if (!school) {
    console.log('❌ École avec ID 68c7700cd9f7c4207d3c9ea6 non trouvée');
    return;
  }
  
  console.log('🏫 École trouvée:', school.name, 'ID:', school._id);
  
  // Chercher tous les étudiants de cette école
  return User.find({
    schoolId: '68c7700cd9f7c4207d3c9ea6',
    role: 'student'
  });
})
.then(students => {
  if (!students) return;
  
  console.log(`\n📚 ${students.length} étudiant(s) trouvé(s) dans l'école:`);
  students.forEach(student => {
    console.log(`- ${student.firstName || 'N/A'} ${student.lastName || 'N/A'} (${student.email}) - Classe: ${student.classId || 'NON ASSIGNÉ'}`);
  });
  
  // Compter ceux non assignés
  const unassigned = students.filter(s => !s.classId);
  console.log(`\n🎯 ${unassigned.length} étudiant(s) non assigné(s):`);
  unassigned.forEach(student => {
    console.log(`- ${student.firstName || 'N/A'} ${student.lastName || 'N/A'} (${student.email})`);
  });
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('Erreur:', err);
  mongoose.disconnect();
});