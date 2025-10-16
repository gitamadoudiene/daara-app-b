// Script pour examiner en détail les coefficients et matières
require('dotenv').config();
const mongoose = require('mongoose');

async function examineCoefficientsDetails() {
  try {
    console.log('🔗 Connexion à la BD...');
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    
    console.log('📊 DÉTAIL DES COEFFICIENTS:');
    console.log('==========================');
    
    // Récupérer tous les coefficients avec les détails des matières
    const coefficients = await mongoose.connection.db.collection('subjectcoefficients')
      .aggregate([
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subject'
          }
        },
        {
          $unwind: '$subject'
        }
      ]).toArray();
    
    coefficients.forEach((coeff, index) => {
      console.log(`\n${index + 1}. COEFFICIENT ${coeff.coefficient}`);
      console.log(`   Matière: ${coeff.subject.name} (ID: ${coeff.subjectId})`);
      console.log(`   Classe: ${coeff.classLevel}`);
      console.log(`   École: ${coeff.schoolId}`);
      console.log(`   Année: ${coeff.academicYear || 'Non définie'}`);
    });
    
    console.log('\n\n📚 MATIÈRES DISPONIBLES:');
    console.log('========================');
    
    const subjects = await mongoose.connection.db.collection('subjects').find({}).toArray();
    subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} (ID: ${subject._id})`);
      console.log(`   Code: ${subject.code || 'Non défini'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

examineCoefficientsDetails();