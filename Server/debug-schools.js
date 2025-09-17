const mongoose = require('mongoose');

// Modèles
const School = require('./models/School');

async function listAllSchools() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara_app');
    console.log('✅ Connecté à MongoDB');

    const schools = await School.find().lean();
    console.log('Nombre d\'écoles trouvées:', schools.length);
    
    if (schools.length > 0) {
      schools.forEach((school, index) => {
        console.log(`${index + 1}. "${school.name}" (ID: ${school._id})`);
      });
    } else {
      console.log('⚠️ Aucune école trouvée dans la base de données');
      
      // Lister toutes les collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Collections disponibles:');
      collections.forEach(col => console.log('  -', col.name));
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listAllSchools();