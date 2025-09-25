// debug-class-loading.js
require('dotenv').config();
const mongoose = require('mongoose');
const Class = require('./models/Class');
const School = require('./models/School');

// ID de l'école que nous voulons tester
const schoolId = '68c7700cd9f7c4207d3c9ea6'; // ID de l'école "Les Pedagogues"

async function debugClassLoading() {
  try {
    // Connexion à la base de données
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connecté à MongoDB');

    // 1. Vérifier l'école
    console.log(`\nRecherche de l'école avec l'ID: ${schoolId}`);
    const school = await School.findById(schoolId);
    
    if (!school) {
      console.error(`École non trouvée avec l'ID: ${schoolId}`);
      return;
    }
    
    console.log(`École trouvée: ${school.name} (ID: ${school._id})`);
    console.log('Type d\'ID:', typeof school._id, 'Valeur brute:', school._id.toString());
    
    // 2. Rechercher les classes avec schoolId en tant que chaîne
    console.log('\nRecherche de classes avec schoolId en tant que chaîne:');
    const classesWithString = await Class.find({ schoolId: schoolId.toString() });
    console.log(`- ${classesWithString.length} classes trouvées avec schoolId string`);
    
    // 3. Rechercher les classes avec schoolId en tant qu'ObjectId
    console.log('\nRecherche de classes avec schoolId en tant qu\'ObjectId:');
    const objectId = new mongoose.Types.ObjectId(schoolId);
    const classesWithObjectId = await Class.find({ schoolId: objectId });
    console.log(`- ${classesWithObjectId.length} classes trouvées avec schoolId ObjectId`);
    
    // 4. Vérifier les classes existantes pour cette école
    console.log('\nClasses trouvées pour cette école:');
    if (classesWithObjectId.length > 0) {
      classesWithObjectId.forEach(cls => {
        console.log(`- ${cls.name} (ID: ${cls._id}, Type schoolId: ${typeof cls.schoolId})`);
        console.log(`  SchoolId stocké: ${cls.schoolId}, Format: ${cls.schoolId instanceof mongoose.Types.ObjectId ? 'ObjectId' : typeof cls.schoolId}`);
      });
    } else {
      console.log('Aucune classe trouvée pour cette école.');
    }
    
    // 5. Si aucune classe n'existe, créer une classe de test
    if (classesWithObjectId.length === 0) {
      console.log('\nCréation d\'une classe de test pour cette école...');
      
      const newClass = new Class({
        name: 'Classe de Test',
        level: 'Niveau Test',
        section: 'Section Test',
        schoolId: school._id, // Utiliser directement l'ObjectId de l'école
        academicYear: '2025-2026',
        subjects: ['Français', 'Mathématiques']
      });
      
      await newClass.save();
      console.log(`Classe de test créée avec succès! ID: ${newClass._id}`);
      console.log(`SchoolId stocké dans la classe: ${newClass.schoolId}`);
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnexion de MongoDB');
  }
}

// Exécuter la fonction de débogage
debugClassLoading();
