const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const Evaluation = require('./models/Evaluation');
const Grade = require('./models/Grade');

async function testStats() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connecté à MongoDB');

    // ID de l'évaluation qui pose problème (d'après vos logs)
    const evaluationId = '68ef047bdb8946c06a9ccd69'; // Composition Math 1

    console.log(`\n🔍 Test calcul stats pour évaluation: ${evaluationId}\n`);

    // Récupérer l'évaluation
    const evaluation = await Evaluation.findById(evaluationId)
      .populate('classId', 'name students')
      .populate('subjectId', 'name');

    if (!evaluation) {
      console.log('❌ Évaluation non trouvée');
      return;
    }

    console.log(`📋 Évaluation: ${evaluation.title}`);
    console.log(`🏫 Classe: ${evaluation.classId?.name}`);
    console.log(`📚 Matière: ${evaluation.subjectId?.name}`);

    // Récupérer toutes les notes pour cette évaluation (sans filtre)
    const allGrades = await Grade.find({ 
      evaluationId: evaluation._id 
    });

    console.log(`\n📊 Analyse des notes:`);
    console.log(`Total notes en DB: ${allGrades.length}`);

    if (allGrades.length > 0) {
      console.log('Détail des notes:');
      allGrades.forEach((grade, index) => {
        console.log(`${index + 1}. Étudiant: ${grade.studentId}, Score: ${grade.score}, Absent: ${grade.isAbsent}, Publié: ${grade.isPublished}`);
      });
    }

    // Tester le calcul des statistiques
    console.log(`\n🧮 Test calcul des statistiques:`);
    const stats = await evaluation.calculateStats();
    
    console.log(`📈 Résultat:`, stats);

    // Sauvegarder pour voir si ça persiste
    await evaluation.save();
    console.log(`✅ Évaluation sauvegardée avec nouvelles stats`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testStats();