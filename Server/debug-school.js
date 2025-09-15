// debug-school.js
require('dotenv').config();
const mongoose = require('mongoose');
const School = require('./models/School');

const schoolId = '68c7700cd9f7c4207d3c9ea6';

async function debugSchool() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connecté à MongoDB');

    // Récupérer toutes les écoles
    const schools = await School.find();
    console.log('Liste des écoles:');
    schools.forEach(school => {
      console.log(`- ID: ${school._id}, Nom: ${school.name}`);
    });

    // Tester l'ID spécifique
    console.log(`\nTest de l'ID: ${schoolId}`);

    // Test 1: Recherche directe
    const directResult = await School.findById(schoolId).catch(e => null);
    console.log('1. Recherche directe:', directResult ? 'Trouvé' : 'Non trouvé');

    // Test 2: Avec ObjectId explicite
    try {
      const objectId = new mongoose.Types.ObjectId(schoolId);
      const objectIdResult = await School.findById(objectId).catch(e => null);
      console.log('2. Avec ObjectId explicite:', objectIdResult ? 'Trouvé' : 'Non trouvé');
    } catch (error) {
      console.log('2. Avec ObjectId explicite: Erreur -', error.message);
    }

    // Test 3: Avec recherche sur _id en string
    const stringResult = await School.findOne({ _id: schoolId }).catch(e => null);
    console.log('3. Recherche avec string:', stringResult ? 'Trouvé' : 'Non trouvé');

    // Créer une école de test si aucune n'existe
    if (schools.length === 0) {
      console.log("\nAucune école n'existe. Création d'une école de test...");
      
      const testSchool = new School({
        name: "École de Test",
        address: "123 Rue Test",
        phone: "+221 77 000 0000",
        email: "test@ecole.com",
        director: "Directeur Test",
        createdYear: "2025",
        type: "Public",
        status: "Actif"
      });

      await testSchool.save();
      console.log(`École de test créée avec l'ID: ${testSchool._id}`);
    }

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnexion de MongoDB');
  }
}

debugSchool();

