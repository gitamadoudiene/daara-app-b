const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const Evaluation = require('./models/Evaluation');
const Grade = require('./models/Grade');

async function listEvaluations() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connecté à MongoDB');

    // Récupérer toutes les évaluations
    const evaluations = await Evaluation.find({})
      .populate('classId', 'name')
      .populate('subjectId', 'name')
      .sort({ plannedDate: -1 });

    console.log(`\n📋 Liste des évaluations (${evaluations.length}):\n`);

    for (let i = 0; i < evaluations.length; i++) {
      const eval = evaluations[i];
      
      // Compter les notes pour chaque évaluation
      const gradeCount = await Grade.countDocuments({ 
        evaluationId: eval._id 
      });

      console.log(`${i + 1}. ID: ${eval._id}`);
      console.log(`   Titre: ${eval.title}`);
      console.log(`   Classe: ${eval.classId?.name || 'N/A'}`);
      console.log(`   Matière: ${eval.subjectId?.name || 'N/A'}`);
      console.log(`   Stats actuelles: ${JSON.stringify(eval.stats || {})}`);
      console.log(`   Notes en DB: ${gradeCount}`);
      console.log('---');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

listEvaluations();