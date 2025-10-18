const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const User = require('./models/User');

async function testUnassignedStudents() {
  try {
    // Connexion à MongoDB
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    const schoolId = '68c7700cd9f7c4207d3c9ea6'; // ID de l'école Les Pedagogues

    console.log('\n🔍 === ANALYSE DES ÉTUDIANTS ===');
    
    // 1. Tous les étudiants de l'école
    const allStudents = await User.find({ 
      role: 'student', 
      schoolId: new mongoose.Types.ObjectId(schoolId) 
    }).select('name email classId schoolId');
    
    console.log(`📚 Total étudiants dans l'école: ${allStudents.length}`);
    
    // 2. Étudiants avec classId
    const assignedStudents = allStudents.filter(s => s.classId);
    console.log(`✅ Étudiants assignés: ${assignedStudents.length}`);
    
    // 3. Étudiants sans classId
    const unassignedStudents = allStudents.filter(s => !s.classId);
    console.log(`❌ Étudiants non assignés: ${unassignedStudents.length}`);
    
    if (unassignedStudents.length > 0) {
      console.log('\n👥 Étudiants non assignés:');
      unassignedStudents.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.email}) - classId: ${student.classId}`);
      });
    }
    
    if (assignedStudents.length > 0) {
      console.log('\n👥 Quelques étudiants assignés:');
      assignedStudents.slice(0, 5).forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.email}) - classId: ${student.classId}`);
      });
    }

    // 4. Test du filtre exact utilisé par l'API
    console.log('\n🧪 Test du filtre API:');
    const apiFilter = {
      role: 'student',
      schoolId: new mongoose.Types.ObjectId(schoolId),
      $or: [
        { classId: { $exists: false } },
        { classId: null }
      ]
    };
    
    console.log('🔍 Filtre utilisé:', JSON.stringify(apiFilter, null, 2));
    
    const apiResult = await User.find(apiFilter)
      .populate('schoolId', 'name')
      .select('-password')
      .sort({ name: 1 });
    
    console.log(`📊 Résultat API: ${apiResult.length} étudiants`);
    
    if (apiResult.length > 0) {
      console.log('👥 Détails:');
      apiResult.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔐 Connexion fermée');
  }
}

testUnassignedStudents();