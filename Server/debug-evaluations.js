const mongoose = require('mongoose');

const Evaluation = require('./models/Evaluation');
const Grade = require('./models/Grade');
const Class = require('./models/Class');

async function debugEvaluations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara-app');
    console.log('📊 CONNEXION DB RÉUSSIE');

    // Récupérer toutes les évaluations avec les détails complets
    const evaluations = await Evaluation.find()
      .populate({
        path: 'classId',
        populate: { path: 'students', select: 'name email' }
      })
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    console.log(`\n📋 ÉVALUATIONS TROUVÉES: ${evaluations.length}\n`);

    for (const evaluation of evaluations) {
      console.log(`\n📝 ÉVALUATION: ${evaluation.title}`);
      console.log(`   ID: ${evaluation._id}`);
      console.log(`   Type: ${evaluation.type}`);
      console.log(`   Classe: ${evaluation.classId?.name || 'N/A'}`);
      console.log(`   Nombre d'étudiants dans la classe: ${evaluation.classId?.students?.length || 0}`);
      
      // Récupérer les notes pour cette évaluation
      const grades = await Grade.find({ evaluationId: evaluation._id });
      console.log(`   Notes en base: ${grades.length}`);
      
      // Calculer les statistiques manuellement
      const totalStudents = evaluation.classId?.students?.length || 0;
      const submittedGrades = grades.filter(g => g.score !== null && g.score !== undefined).length;
      const absentCount = grades.filter(g => g.isAbsent === true).length;
      
      console.log(`   📊 STATS CALCULÉES MANUELLEMENT:`);
      console.log(`      Total étudiants: ${totalStudents}`);
      console.log(`      Notes soumises: ${submittedGrades}`);
      console.log(`      Absents: ${absentCount}`);
      
      // Comparer avec les stats stockées
      console.log(`   📊 STATS STOCKÉES DANS L'ÉVALUATION:`);
      console.log(`      evaluation.stats:`, evaluation.stats);
      
      // Recalculer les statistiques
      console.log(`   🔄 RECALCUL DES STATISTIQUES...`);
      const newStats = await evaluation.calculateStats();
      console.log(`   📊 NOUVELLES STATS:`, newStats);
    }

  } catch (error) {
    console.error('❌ ERREUR:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugEvaluations();