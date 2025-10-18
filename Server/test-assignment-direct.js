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

async function testAssignment() {
  try {
    console.log('\n🧪 TEST AFFECTATION DIRECTE\n');
    
    // Trouver un étudiant orphelin
    const orphan = await User.findOne({ 
      role: 'student',
      $or: [{ classId: null }, { classId: { $exists: false } }]
    });
    
    if (!orphan) {
      console.log('❌ Aucun étudiant orphelin trouvé');
      return;
    }
    
    // Trouver une classe
    const targetClass = await Class.findOne({ name: { $regex: /3ème|4eme|5em/i } });
    
    if (!targetClass) {
      console.log('❌ Aucune classe trouvée');
      return;
    }
    
    console.log(`👤 Étudiant: ${orphan.name} (${orphan._id})`);
    console.log(`📚 Classe: ${targetClass.name} (${targetClass._id})`);
    
    // Simuler l'API call updateUser
    console.log('\n🔄 SIMULATION updateUser...\n');
    
    // Étape 1: Mettre à jour l'étudiant
    await User.findByIdAndUpdate(orphan._id, { classId: targetClass._id });
    console.log('✅ Étudiant mis à jour avec classId');
    
    // Étape 2: Ajouter à la classe
    await Class.findByIdAndUpdate(targetClass._id, {
      $addToSet: { students: orphan._id }
    });
    console.log('✅ Étudiant ajouté à l\'array students de la classe');
    
    // Vérification
    const updatedClass = await Class.findById(targetClass._id).populate('students', 'name');
    const studentsWithClassId = await User.find({ classId: targetClass._id, role: 'student' }).select('name');
    
    console.log('\n📊 VÉRIFICATION:\n');
    console.log(`📚 ${updatedClass.name}:`);
    console.log(`   Students array: ${updatedClass.students?.length || 0}`);
    console.log(`   Avec classId: ${studentsWithClassId.length}`);
    
    if (updatedClass.students?.length === studentsWithClassId.length) {
      console.log('✅ SYNCHRONISATION RÉUSSIE !');
    } else {
      console.log('❌ DÉSYNCHRONISATION DÉTECTÉE');
    }
    
    // Afficher les noms
    console.log('\nÉtudiants dans la classe:');
    updatedClass.students?.forEach(s => console.log(`  - ${s.name}`));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAssignment();