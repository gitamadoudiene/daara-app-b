const mongoose = require('mongoose');
const User = require('./models/User');

const SCHOOL_ID = '68c7700cd9f7c4207d3c9ea6';

mongoose.connect('mongodb://localhost:27017/daara-app')
.then(() => {
  console.log('✅ Connexion MongoDB réussie');
  
  // 1. Vérifier tous les étudiants
  return User.find({ role: 'student' });
})
.then(allStudents => {
  console.log(`\n📚 Total: ${allStudents.length} étudiant(s) dans la base`);
  
  // 2. Étudiants de l'école Les Pedagogues
  const schoolStudents = allStudents.filter(s => s.schoolId && s.schoolId.toString() === SCHOOL_ID);
  console.log(`🏫 École Les Pedagogues: ${schoolStudents.length} étudiant(s)`);
  
  // 3. Étudiants non assignés de cette école
  const unassignedStudents = schoolStudents.filter(s => !s.classId);
  console.log(`🎯 Non assignés: ${unassignedStudents.length} étudiant(s)`);
  
  // Détail des étudiants
  allStudents.forEach((student, i) => {
    console.log(`\n--- Étudiant ${i+1} ---`);
    console.log('Nom:', student.firstName, student.lastName);
    console.log('Email:', student.email);
    console.log('École:', student.schoolId);
    console.log('Classe:', student.classId || 'NON ASSIGNÉ');
    console.log('Correspond à l\'école?', student.schoolId && student.schoolId.toString() === SCHOOL_ID ? '✅' : '❌');
  });
  
  mongoose.disconnect();
})
.catch(err => {
  console.error('❌ Erreur:', err);
  mongoose.disconnect();
});