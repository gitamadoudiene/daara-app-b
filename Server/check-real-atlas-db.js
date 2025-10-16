// Script pour vérifier la VRAIE base de données utilisée par le serveur
require('dotenv').config();
const mongoose = require('mongoose');

async function checkRealDatabase() {
  try {
    console.log('🔗 Connexion à la base de données RÉELLE...');
    console.log('📋 MONGO_URI:', process.env.MONGO_URI);
    
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Connexion établie à la vraie BD');
    
    // Obtenir la liste des collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 COLLECTIONS DISPONIBLES:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Vérifier les modèles utilisés par l'app
    console.log('\n🔍 VÉRIFICATION DES DONNÉES RÉELLES:');
    
    // Matières
    const subjectsCount = await mongoose.connection.db.collection('subjects').countDocuments();
    console.log(`\n📚 MATIÈRES: ${subjectsCount} trouvées`);
    
    if (subjectsCount > 0) {
      const subjects = await mongoose.connection.db.collection('subjects').find({}).limit(5).toArray();
      subjects.forEach((subject, index) => {
        console.log(`  ${index + 1}. ${subject.name} (ID: ${subject._id})`);
      });
    }
    
    // Coefficients
    const coefficientsCount = await mongoose.connection.db.collection('subjectcoefficients').countDocuments();
    console.log(`\n📊 COEFFICIENTS: ${coefficientsCount} trouvés`);
    
    if (coefficientsCount > 0) {
      const coefficients = await mongoose.connection.db.collection('subjectcoefficients').find({}).limit(5).toArray();
      coefficients.forEach((coeff, index) => {
        console.log(`  ${index + 1}. Coefficient ${coeff.coefficient} (Matière: ${coeff.subjectId}, Classe: ${coeff.classLevel})`);
      });
    }
    
    // Écoles
    const schoolsCount = await mongoose.connection.db.collection('schools').countDocuments();
    console.log(`\n🏫 ÉCOLES: ${schoolsCount} trouvées`);
    
    if (schoolsCount > 0) {
      const schools = await mongoose.connection.db.collection('schools').find({}).toArray();
      schools.forEach((school, index) => {
        console.log(`  ${index + 1}. ${school.name} (ID: ${school._id})`);
        console.log(`      - Semestre par défaut: ${school.defaultSemester || 'Non défini'}`);
        console.log(`      - Année académique: ${school.defaultAcademicYear || 'Non définie'}`);
      });
    }
    
    // Utilisateurs
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\n👤 UTILISATEURS: ${usersCount} trouvés`);
    
    if (usersCount > 0) {
      const users = await mongoose.connection.db.collection('users').find({}).limit(3).toArray();
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Rôle: ${user.role}`);
      });
    }
    
    console.log('\n🔚 Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRealDatabase();