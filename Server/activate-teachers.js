require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function activateAllTeachers() {
  try {
    console.log('🔧 ACTIVATION DE TOUS LES ENSEIGNANTS');
    console.log('===================================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // Compter les enseignants inactifs
    const inactiveTeachers = await User.countDocuments({ 
      role: 'teacher', 
      isActive: false 
    });
    
    console.log(`📊 Enseignants inactifs trouvés: ${inactiveTeachers}`);

    if (inactiveTeachers === 0) {
      console.log('✅ Aucun enseignant inactif à activer');
      return;
    }

    // Activer tous les enseignants
    const result = await User.updateMany(
      { role: 'teacher', isActive: false },
      { $set: { isActive: true } }
    );

    console.log(`✅ ${result.modifiedCount} enseignants activés avec succès!`);

    // Vérification
    const activeTeachers = await User.countDocuments({ 
      role: 'teacher', 
      isActive: true 
    });
    
    console.log(`📊 Total enseignants actifs maintenant: ${activeTeachers}`);

    // Tester avec quelques enseignants
    const sampleTeachers = await User.find({ 
      role: 'teacher', 
      isActive: true 
    }).limit(5).select('name email');

    console.log('\n📋 Échantillon d\'enseignants activés:');
    sampleTeachers.forEach((teacher, index) => {
      console.log(`   ${index + 1}. ${teacher.name} (${teacher.email})`);
    });

    console.log('\n✅ SUCCÈS! Tous les enseignants sont maintenant actifs.');
    console.log('🎯 Testez maintenant l\'interface - les enseignants devraient voir leurs classes!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

activateAllTeachers();