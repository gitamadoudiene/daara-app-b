const mongoose = require('mongoose');
require('dotenv').config();

async function checkCoefficients() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara-app');
    console.log('✅ Connexion établie');
    
    console.log('🔍 Vérification des coefficients dans la BD...');
    
    // Essayer différents noms de collection possibles
    const collections = [
      'subjectcoefficients', // Nom MongoDB par défaut pour SubjectCoefficient
      'subjects' // Nom MongoDB par défaut pour Subject
    ];
    
    // Lister toutes les collections
    const db = mongoose.connection.db;
    const allCollections = await db.listCollections().toArray();
    console.log('📊 Collections disponibles:', allCollections.map(c => c.name));
    
    // Chercher les coefficients dans différentes collections
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        if (count > 0) {
          console.log(`\n✅ Collection "${collectionName}" trouvée avec ${count} documents`);
          
          // Afficher quelques exemples
          const examples = await collection.find({}).limit(5).toArray();
          console.log('📋 Exemples de documents:');
          examples.forEach((doc, index) => {
            console.log(`  ${index + 1}.`, JSON.stringify(doc, null, 2));
          });
        } else {
          console.log(`⚠️  Collection "${collectionName}" existe mais est vide`);
        }
      } catch (error) {
        console.log(`❌ Collection "${collectionName}" n'existe pas`);
      }
    }
    
    // Vérifier aussi les sujets/matières
    console.log('\n🔍 Vérification des matières/sujets...');
    try {
      const subjectsCollection = db.collection('subjects');
      const subjectsCount = await subjectsCollection.countDocuments();
      console.log(`📚 ${subjectsCount} matières trouvées`);
      
      if (subjectsCount > 0) {
        const subjectExamples = await subjectsCollection.find({}).limit(3).toArray();
        console.log('📋 Exemples de matières:');
        subjectExamples.forEach((subject, index) => {
          console.log(`  ${index + 1}.`, {
            _id: subject._id,
            name: subject.name,
            code: subject.code
          });
        });
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des matières:', error.message);
    }
    
    // Vérifier les écoles
    console.log('\n🔍 Vérification des écoles...');
    try {
      const schoolsCollection = db.collection('schools');
      const schoolsCount = await schoolsCollection.countDocuments();
      console.log(`🏫 ${schoolsCount} écoles trouvées`);
      
      if (schoolsCount > 0) {
        const schoolExamples = await schoolsCollection.find({}).limit(2).toArray();
        console.log('📋 Exemples d\'écoles:');
        schoolExamples.forEach((school, index) => {
          console.log(`  ${index + 1}.`, {
            _id: school._id,
            name: school.name,
            // Vérifier s'il y a des paramètres par défaut
            defaultSemester: school.defaultSemester,
            defaultAcademicYear: school.defaultAcademicYear
          });
        });
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des écoles:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Vérification terminée');
  }
}

checkCoefficients();