const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connecté à MongoDB Atlas');
}).catch(err => {
  console.error('❌ Erreur de connexion MongoDB:', err);
});

const User = require('./models/User');
const Class = require('./models/Class');

async function fixClassStudentsSync() {
  try {
    console.log('\n🔧 RÉPARATION DE LA SYNCHRONISATION CLASSES-ÉTUDIANTS\n');
    
    // Récupérer toutes les classes
    const classes = await Class.find({});
    
    for (const classe of classes) {
      console.log(`\n📚 Traitement de la classe: ${classe.name} (${classe._id})`);
      
      // Trouver tous les étudiants qui ont cette classe comme classId
      const studentsWithClassId = await User.find({ 
        classId: classe._id, 
        role: 'student' 
      }).select('_id name');
      
      console.log(`   Étudiants trouvés avec classId: ${studentsWithClassId.length}`);
      studentsWithClassId.forEach(s => console.log(`     - ${s.name} (${s._id})`));
      
      // Mettre à jour l'array students de la classe
      const studentIds = studentsWithClassId.map(s => s._id);
      
      await Class.findByIdAndUpdate(classe._id, {
        students: studentIds,
        studentCount: studentIds.length
      });
      
      console.log(`   ✅ Mise à jour effectuée: ${studentIds.length} étudiant(s) ajouté(s) à l'array students`);
    }
    
    console.log('\n🎯 VÉRIFICATION POST-RÉPARATION\n');
    
    // Vérifier que tout est maintenant synchronisé
    const classesAfter = await Class.find({}).populate('students', 'name');
    
    for (const classe of classesAfter) {
      const studentsInArray = classe.students?.length || 0;
      const studentsWithClassId = await User.countDocuments({ 
        classId: classe._id, 
        role: 'student' 
      });
      
      const status = studentsInArray === studentsWithClassId ? '✅' : '❌';
      console.log(`${status} ${classe.name}: Array=${studentsInArray}, ClassId=${studentsWithClassId}`);
    }
    
    console.log('\n🚀 Réparation terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixClassStudentsSync();