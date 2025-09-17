const mongoose = require('mongoose');
const User = require('./models/User');

// Charger les variables d'environnement
require('dotenv').config();

async function addStatusField() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connexion à MongoDB établie');
    
    // Ajouter le champ status à tous les utilisateurs existants
    const result = await User.updateMany(
      { status: { $exists: false } }, // Tous les utilisateurs sans champ status
      { $set: { status: 'Actif' } }   // Définir status à 'Actif'
    );
    
    console.log(`📝 ${result.modifiedCount} utilisateurs mis à jour avec le statut 'Actif'`);
    
    // Vérifier le résultat
    const users = await User.find({}, 'name email role status');
    console.log('\n📋 Liste des utilisateurs avec leur statut :');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Rôle: ${user.role} - Statut: ${user.status || 'Non défini'}`);
    });
    
    console.log('\n✅ Migration terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

addStatusField();