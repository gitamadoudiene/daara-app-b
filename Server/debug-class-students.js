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

async function checkClassStudents() {
  try {
    console.log('\n=== VÉRIFICATION CLASSES ET ÉTUDIANTS ===\n');
    
    // Récupérer toutes les classes
    const classes = await Class.find({}).populate('students', 'name email');
    
    for (const classe of classes) {
      console.log(`📚 CLASSE: ${classe.name} (${classe.level})`);
      console.log(`   ID: ${classe._id}`);
      console.log(`   Students array (${classe.students?.length || 0}):`, 
        classe.students?.map(s => `${s.name} (${s._id})`) || 'Aucun');
      console.log(`   StudentCount: ${classe.studentCount || 0}`);
      
      // Compter les étudiants qui ont cette classe comme classId
      const studentsWithClassId = await User.find({ 
        classId: classe._id, 
        role: 'student' 
      }).select('name email');
      
      console.log(`   Étudiants avec classId (${studentsWithClassId.length}):`,
        studentsWithClassId.map(s => `${s.name} (${s._id})`));
      
      // Identifier les incohérences
      const arrayIds = new Set(classe.students?.map(s => s._id.toString()) || []);
      const classIdIds = new Set(studentsWithClassId.map(s => s._id.toString()));
      
      const onlyInArray = [...arrayIds].filter(id => !classIdIds.has(id));
      const onlyInClassId = [...classIdIds].filter(id => !arrayIds.has(id));
      
      if (onlyInArray.length > 0) {
        console.log(`   ⚠️  Dans students array mais pas dans classId:`, onlyInArray);
      }
      if (onlyInClassId.length > 0) {
        console.log(`   ⚠️  Avec classId mais pas dans students array:`, onlyInClassId);
      }
      
      if (onlyInArray.length === 0 && onlyInClassId.length === 0) {
        console.log(`   ✅ Cohérence parfaite!`);
      }
      
      console.log('');
    }
    
    // Vérifier les étudiants orphelins
    console.log('\n=== ÉTUDIANTS ORPHELINS ===\n');
    const orphanStudents = await User.find({ 
      role: 'student',
      $or: [
        { classId: { $exists: false } },
        { classId: null }
      ]
    }).select('name email');
    
    console.log(`📝 Étudiants sans classe (${orphanStudents.length}):`,
      orphanStudents.map(s => `${s.name} (${s._id})`));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkClassStudents();
