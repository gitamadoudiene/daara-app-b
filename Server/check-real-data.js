const mongoose = require('mongoose');
require('dotenv').config();

async function checkRealData() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara-app');
    console.log('✅ Connexion établie');
    
    console.log('🔍 Vérification RÉELLE des collections...');
    
    const db = mongoose.connection.db;
    
    // Vérifier les matières
    console.log('\n📚 MATIÈRES:');
    const subjects = await db.collection('subjects').find({}).toArray();
    console.log(`✅ ${subjects.length} matières trouvées:`);
    subjects.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.name} (ID: ${subject._id}, Code: ${subject.code})`);
    });
    
    // Vérifier les coefficients
    console.log('\n📊 COEFFICIENTS:');
    const coefficients = await db.collection('subjectcoefficients').find({}).toArray();
    console.log(`✅ ${coefficients.length} coefficients trouvés:`);
    coefficients.forEach((coeff, index) => {
      console.log(`  ${index + 1}. Matière: ${coeff.subjectId}, Niveau: ${coeff.classLevel}, Coeff: ${coeff.coefficient}, École: ${coeff.schoolId}`);
    });
    
    // Vérifier les écoles avec leurs paramètres
    console.log('\n🏫 ÉCOLES:');
    const schools = await db.collection('schools').find({}).toArray();
    console.log(`✅ ${schools.length} écoles trouvées:`);
    schools.forEach((school, index) => {
      console.log(`  ${index + 1}. ${school.name} (ID: ${school._id})`);
      console.log(`      - Semestre par défaut: ${school.defaultSemester || 'Non défini'}`);
      console.log(`      - Année académique: ${school.defaultAcademicYear || 'Non définie'}`);
    });
    
    // Vérifier les utilisateurs pour trouver les admins
    console.log('\n👤 UTILISATEURS ADMIN:');
    const users = await db.collection('users').find({ role: 'admin' }).toArray();
    console.log(`✅ ${users.length} admins trouvés:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - École: ${user.schoolId}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Vérification terminée');
  }
}

checkRealData();