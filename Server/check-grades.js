const mongoose = require('mongoose');
const Grade = require('./models/Grade');

async function checkGrades() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara_db');
    console.log('Connected to MongoDB');
    
    const grades = await Grade.find().populate('studentId', 'name').populate('evaluationId', 'title');
    console.log('=== NOTES EN BASE DE DONNÉES ===');
    console.log('Nombre total de notes:', grades.length);
    
    if (grades.length > 0) {
      console.log('\nDétail des notes:');
      grades.forEach((grade, index) => {
        const studentName = grade.studentId?.name || 'Étudiant inconnu';
        const evaluationTitle = grade.evaluationId?.title || 'Évaluation inconnue';
        const score = grade.isAbsent ? 'ABS' : `${grade.score}/20`;
        console.log(`${index + 1}. ${studentName} - ${evaluationTitle}: ${score}`);
      });
      
      console.log('\n=== STATISTIQUES ===');
      const validGrades = grades.filter(g => !g.isAbsent && g.score > 0);
      console.log('Notes valides (non absents):', validGrades.length);
      if (validGrades.length > 0) {
        const moyenne = validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length;
        console.log('Moyenne générale:', moyenne.toFixed(2));
      }
      
      // Grouper par évaluation
      const byEvaluation = {};
      grades.forEach(grade => {
        const evalId = grade.evaluationId?._id?.toString();
        if (!byEvaluation[evalId]) {
          byEvaluation[evalId] = {
            title: grade.evaluationId?.title || 'Inconnu',
            grades: []
          };
        }
        byEvaluation[evalId].grades.push(grade);
      });
      
      console.log('\n=== PAR ÉVALUATION ===');
      Object.keys(byEvaluation).forEach(evalId => {
        const evaluation = byEvaluation[evalId];
        const validGrades = evaluation.grades.filter(g => !g.isAbsent && g.score > 0);
        const moyenne = validGrades.length > 0 
          ? validGrades.reduce((sum, g) => sum + g.score, 0) / validGrades.length 
          : 0;
        console.log(`${evaluation.title}: ${evaluation.grades.length} notes, moyenne: ${moyenne.toFixed(2)}`);
      });
    } else {
      console.log('❌ AUCUNE NOTE TROUVÉE EN BASE !');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkGrades();