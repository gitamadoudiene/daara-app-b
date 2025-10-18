const mongoose = require('mongoose');
require('dotenv').config();

const checkDatabases = async () => {
  try {
    // Se connecter sans spécifier de base de données
    await mongoose.connect('mongodb://localhost:27017/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');
    
    // Lister toutes les bases de données
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    
    console.log('🗃️ Bases de données disponibles:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name} (taille: ${db.sizeOnDisk} bytes)`);
    });
    
    // Vérifier dans chaque base de données
    for (const database of databases.databases) {
      if (database.name !== 'admin' && database.name !== 'local' && database.name !== 'config') {
        console.log(`\n📂 Exploration de la base: ${database.name}`);
        
        const db = mongoose.connection.client.db(database.name);
        const collections = await db.listCollections().toArray();
        
        console.log(`   Collections:`, collections.map(c => c.name));
        
        // Chercher spécifiquement les évaluations
        for (const collection of collections) {
          if (collection.name.toLowerCase().includes('evaluation') || 
              collection.name.toLowerCase().includes('assessment') ||
              collection.name.toLowerCase().includes('exam')) {
            
            const count = await db.collection(collection.name).countDocuments();
            console.log(`   📊 ${collection.name}: ${count} documents`);
            
            if (count > 0) {
              const sample = await db.collection(collection.name).findOne();
              console.log(`   📄 Exemple:`, JSON.stringify(sample, null, 2));
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
};

checkDatabases();