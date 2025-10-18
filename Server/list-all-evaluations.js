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

const listAllEvaluations = async () => {
  await connectDB();
  
  try {
    // Définir le schéma Evaluation
    const evaluationSchema = new mongoose.Schema({}, { strict: false });
    const Evaluation = mongoose.model('Evaluation', evaluationSchema);
    
    console.log('🔍 Recherche de toutes les évaluations...');
    
    // Récupérer TOUTES les évaluations sans filtre
    const allEvaluations = await Evaluation.find({});
    console.log(`📊 Total évaluations trouvées: ${allEvaluations.length}`);
    
    if (allEvaluations.length > 0) {
      console.log('\n📋 Liste des évaluations:');
      allEvaluations.forEach((eval, index) => {
        console.log(`\n--- Évaluation ${index + 1} ---`);
        console.log(`ID: ${eval._id}`);
        console.log(`Titre: ${eval.title || 'N/A'}`);
        console.log(`Classe ID: ${eval.classId || 'N/A'}`);
        console.log(`Professeur ID: ${eval.teacherId || 'N/A'}`);
        console.log(`Type: ${eval.type || 'N/A'}`);
        console.log(`Statut: ${eval.status || 'N/A'}`);
        console.log(`Date création: ${eval.createdAt || 'N/A'}`);
        if (eval.stats) {
          console.log(`Stats:`, JSON.stringify(eval.stats, null, 2));
        }
      });
    } else {
      console.log('❌ Aucune évaluation trouvée dans la collection');
    }
    
    // Vérifier aussi les collections disponibles
    console.log('\n🗃️ Collections disponibles:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
};

listAllEvaluations();