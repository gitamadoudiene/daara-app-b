const mongoose = require('mongoose');
require('dotenv').config();

// Connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const exploreAllCollections = async () => {
  await connectDB();
  
  try {
    console.log('🔍 Exploration de toutes les collections...\n');
    
    // Lister toutes les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`📂 Collection: ${collectionName}`);
      
      try {
        // Compter les documents
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`   📊 Nombre de documents: ${count}`);
        
        if (count > 0) {
          // Récupérer un échantillon de documents
          const sample = await mongoose.connection.db.collection(collectionName).findOne();
          console.log(`   📄 Exemple de document:`, JSON.stringify(sample, null, 2));
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur lors de l'exploration: ${error.message}`);
      }
      
      console.log(''); // Ligne vide pour la lisibilité
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
};

exploreAllCollections();