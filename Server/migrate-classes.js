const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à la base de données
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB réussie pour la migration');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Script de migration pour ajouter les champs room et capacity aux classes existantes
const migrateClasses = async () => {
  try {
    console.log('🚀 Début de la migration des classes...');
    
    // Connexion à la base de données
    await connectDB();
    
    // Référence à la collection classes
    const db = mongoose.connection.db;
    const classCollection = db.collection('classes');
    
    // Compter les classes avant migration
    const totalClasses = await classCollection.countDocuments();
    console.log(`📊 Nombre total de classes à migrer: ${totalClasses}`);
    
    if (totalClasses === 0) {
      console.log('ℹ️ Aucune classe à migrer');
      return;
    }
    
    // Mettre à jour toutes les classes qui n'ont pas les champs room et capacity
    const updateResult = await classCollection.updateMany(
      {
        $or: [
          { room: { $exists: false } },
          { capacity: { $exists: false } }
        ]
      },
      {
        $set: {
          room: 'Salle à définir',
          capacity: 40
        }
      }
    );
    
    console.log(`✅ Migration terminée avec succès!`);
    console.log(`📝 Classes mises à jour: ${updateResult.modifiedCount}`);
    console.log(`📈 Classes correspondantes: ${updateResult.matchedCount}`);
    
    // Vérification post-migration
    const classesWithNewFields = await classCollection.countDocuments({
      room: { $exists: true },
      capacity: { $exists: true }
    });
    
    console.log(`✅ Vérification: ${classesWithNewFields} classes ont maintenant les nouveaux champs`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter la migration
if (require.main === module) {
  console.log('🔧 Script de migration des classes - Ajout des champs room et capacity');
  console.log('====================================================================');
  migrateClasses();
}

module.exports = { migrateClasses };