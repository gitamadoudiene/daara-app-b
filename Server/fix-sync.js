const mongoose = require('mongoose');
require('dotenv').config();

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

async function fixSync() {
  try {
    console.log('\n🔧 RÉPARATION SYNCHRONISATION\n');
    
    const classes = await Class.find({});
    
    for (const classe of classes) {
      console.log(`📚 ${classe.name}`);
      
      const students = await User.find({ 
        classId: classe._id, 
        role: 'student' 
      }).select('_id name');
      
      const studentIds = students.map(s => s._id);
      
      await Class.findByIdAndUpdate(classe._id, {
        students: studentIds,
        studentCount: studentIds.length
      });
      
      console.log(`   ✅ ${studentIds.length} étudiants synchronisés`);
    }
    
    console.log('\n🚀 Terminé !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixSync();