const mongoose = require('mongoose');
const Class = require('./models/Class');
const School = require('./models/School');
require('dotenv').config();

async function fixTerminaleSASchool() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ Connexion à MongoDB réussie');
    
    // Trouver la classe "Terminale SA"
    const terminaleClass = await Class.findOne({ name: 'Terminale SA' });
    
    if (!terminaleClass) {
      console.log('❌ Classe "Terminale SA" non trouvée');
      process.exit(1);
    }
    
    console.log('📚 Classe "Terminale SA" trouvée:');
    console.log(`   - ID: ${terminaleClass._id}`);
    console.log(`   - school: ${terminaleClass.school || 'undefined'}`);
    console.log(`   - schoolId: ${terminaleClass.schoolId || 'undefined'}`);
    
    // Vérifier les écoles disponibles
    const schools = await School.find({}, 'name').limit(5);
    console.log('\n🏫 Écoles disponibles:');
    schools.forEach(school => {
      console.log(`   - ${school.name}: ${school._id}`);
    });
    
    // L'ID de "Les Pedagogues"
    const targetSchoolId = '68c7700cd9f7c4207d3c9ea6';
    
    // Mettre à jour "Terminale SA" pour qu'elle appartienne à "Les Pedagogues"
    const updatedClass = await Class.findByIdAndUpdate(
      terminaleClass._id,
      { 
        schoolId: new mongoose.Types.ObjectId(targetSchoolId),
        $unset: { school: 1 } // Supprimer l'ancien champ "school"
      },
      { new: true }
    );
    
    console.log('\n✅ Mise à jour effectuée:');
    console.log(`   - schoolId: ${updatedClass.schoolId}`);
    console.log(`   - school: ${updatedClass.school || 'supprimé'}`);
    
    // Vérifier le résultat avec population
    const verifiedClass = await Class.findById(updatedClass._id)
      .populate('schoolId', 'name')
      .populate('resTeacher', 'firstName lastName name email');
    
    console.log('\n🔍 Vérification finale:');
    console.log(`   - Classe: ${verifiedClass.name}`);
    console.log(`   - École: ${verifiedClass.schoolId?.name || 'Non trouvée'}`);
    console.log(`   - Enseignant: ${verifiedClass.resTeacher?.name || 'Non assigné'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixTerminaleSASchool();