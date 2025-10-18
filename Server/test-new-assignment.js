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

async function testNewAssignment() {
  try {
    console.log('\n🧪 TEST D\'AFFECTATION NOUVELLE CLASSE\n');
    
    // Trouver un étudiant orphelin pour le test
    const orphanStudent = await User.findOne({ 
      role: 'student',
      $or: [
        { classId: { $exists: false } },
        { classId: null }
      ]
    });
    
    if (!orphanStudent) {
      console.log('❌ Aucun étudiant orphelin trouvé pour le test');
      return;
    }
    
    console.log(`📝 Étudiant de test: ${orphanStudent.name} (${orphanStudent._id})`);
    
    // Trouver une classe avec peu d'étudiants
    const targetClass = await Class.findOne({ name: '3ème A' });
    
    if (!targetClass) {
      console.log('❌ Classe 3ème A non trouvée');
      return;
    }
    
    console.log(`📚 Classe cible: ${targetClass.name} (${targetClass._id})`);
    console.log(`   Étudiants actuels dans array: ${targetClass.students?.length || 0}`);
    console.log(`   StudentCount: ${targetClass.studentCount || 0}`);
    
    // Simuler l'affectation comme le fait le frontend
    console.log('\n🔄 SIMULATION AFFECTATION...\n');
    
    // Étape 1: Récupérer l'utilisateur actuel
    const currentUser = await User.findById(orphanStudent._id);
    console.log(`1. Utilisateur actuel - classId: ${currentUser.classId || 'null'}`);
    
    const oldClassId = currentUser.classId;
    const newClassId = targetClass._id;
    
    // Étape 2: Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(orphanStudent._id, {
      classId: newClassId
    }, { new: true });
    console.log(`2. Utilisateur mis à jour - classId: ${updatedUser.classId}`);
    
    // Étape 3: Mettre à jour les classes (logique de updateUser)
    if (currentUser.role === 'student' && oldClassId?.toString() !== newClassId?.toString()) {
      console.log('3. Changement de classe détecté pour étudiant');
      
      // Retirer de l'ancienne classe
      if (oldClassId) {
        await Class.findByIdAndUpdate(oldClassId, {
          $pull: { students: orphanStudent._id }
        });
        console.log(`   - Retiré de l'ancienne classe: ${oldClassId}`);
      }
      
      // Ajouter à la nouvelle classe
      await Class.findByIdAndUpdate(newClassId, {
        $addToSet: { students: orphanStudent._id }
      });
      console.log(`   - Ajouté à la nouvelle classe: ${newClassId}`);
    }
    
    // Étape 4: Vérifier le résultat
    const updatedClass = await Class.findById(targetClass._id);
    const studentsInClass = await User.find({ 
      classId: targetClass._id, 
      role: 'student' 
    }).select('name');
    
    console.log('\n📊 RÉSULTAT:\n');
    console.log(`📚 Classe ${updatedClass.name}:`);
    console.log(`   Students array: ${updatedClass.students?.length || 0}`);
    console.log(`   StudentCount: ${updatedClass.studentCount || 0}`);
    console.log(`   Étudiants avec classId: ${studentsInClass.length}`);
    console.log(`   Noms: ${studentsInClass.map(s => s.name).join(', ')}`);
    
    const isSync = updatedClass.students?.length === studentsInClass.length;
    console.log(`   Status: ${isSync ? '✅ Synchronisé' : '❌ Désynchronisé'}`);
    
    // Test de récupération via populate
    console.log('\n🔍 TEST POPULATE:\n');
    const classWithStudents = await Class.findById(targetClass._id)
      .populate('students', 'name email');
    
    console.log(`📚 Classe via populate:`);
    console.log(`   Students trouvés: ${classWithStudents.students?.length || 0}`);
    if (classWithStudents.students?.length > 0) {
      classWithStudents.students.forEach(s => 
        console.log(`     - ${s.name} (${s._id})`)
      );
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
}

testNewAssignment();
