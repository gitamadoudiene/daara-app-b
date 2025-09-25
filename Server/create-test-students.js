const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const SCHOOL_ID = '68c7700cd9f7c4207d3c9ea6';

async function createTestStudents() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara-app');
    console.log('✅ Connexion MongoDB réussie');
    
    const hashedPassword = bcrypt.hashSync('password123', 10);
    
    // Créer 2 étudiants non assignés pour l'école Les Pedagogues
    const students = [
      {
        email: 'etudiant1@lespedagogues.com',
        name: 'Awa Diop',
        firstName: 'Awa', 
        lastName: 'Diop',
        role: 'student',
        schoolId: SCHOOL_ID,
        gender: 'Féminin',
        password: hashedPassword,
        // PAS de classId = non assigné
      },
      {
        email: 'etudiant2@lespedagogues.com',
        name: 'Moussa Kane',
        firstName: 'Moussa',
        lastName: 'Kane', 
        role: 'student',
        schoolId: SCHOOL_ID,
        gender: 'Masculin',
        password: hashedPassword,
        // PAS de classId = non assigné
      }
    ];
    
    // Supprimer les anciens étudiants de test s'ils existent
    await User.deleteMany({ email: { $in: ['etudiant1@lespedagogues.com', 'etudiant2@lespedagogues.com'] } });
    
    // Créer les nouveaux étudiants
    const createdStudents = await User.insertMany(students);
    console.log(`✅ ${createdStudents.length} étudiants créés avec succès`);
    
    createdStudents.forEach(student => {
      console.log(`- ${student.firstName} ${student.lastName} (${student.email})`);
      console.log(`  École: ${student.schoolId}`); 
      console.log(`  Classe: ${student.classId || 'NON ASSIGNÉ'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestStudents();