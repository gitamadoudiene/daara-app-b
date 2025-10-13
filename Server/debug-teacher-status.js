require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debugTeacherStatus() {
  try {
    console.log('🔍 DEBUG STATUT DES ENSEIGNANTS');
    console.log('==============================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // Analyser tous les enseignants avec détails
    const allTeachers = await User.find({ role: 'teacher' }).select('name email isActive');
    console.log(`📊 Total enseignants: ${allTeachers.length}`);

    // Compter par statut
    const activeCount = allTeachers.filter(t => t.isActive === true).length;
    const inactiveCount = allTeachers.filter(t => t.isActive === false).length;
    const undefinedCount = allTeachers.filter(t => t.isActive === undefined).length;

    console.log(`✅ isActive = true: ${activeCount}`);
    console.log(`❌ isActive = false: ${inactiveCount}`);
    console.log(`❓ isActive = undefined: ${undefinedCount}`);

    // Afficher quelques exemples de chaque statut
    console.log('\n📋 EXEMPLES PAR STATUT:');
    
    if (activeCount > 0) {
      const activeTeachers = allTeachers.filter(t => t.isActive === true).slice(0, 3);
      console.log('   ✅ Enseignants actifs:');
      activeTeachers.forEach((t, i) => {
        console.log(`      ${i + 1}. ${t.name} - isActive: ${t.isActive}`);
      });
    }

    if (inactiveCount > 0) {
      const inactiveTeachers = allTeachers.filter(t => t.isActive === false).slice(0, 3);
      console.log('   ❌ Enseignants inactifs:');
      inactiveTeachers.forEach((t, i) => {
        console.log(`      ${i + 1}. ${t.name} - isActive: ${t.isActive}`);
      });
    }

    if (undefinedCount > 0) {
      const undefinedTeachers = allTeachers.filter(t => t.isActive === undefined).slice(0, 3);
      console.log('   ❓ Enseignants avec isActive undefined:');
      undefinedTeachers.forEach((t, i) => {
        console.log(`      ${i + 1}. ${t.name} - isActive: ${t.isActive}`);
      });
    }

    // Test des requêtes de recherche
    console.log('\n🔍 TEST DES REQUÊTES:');
    
    const queryTrue = await User.countDocuments({ role: 'teacher', isActive: true });
    const queryFalse = await User.countDocuments({ role: 'teacher', isActive: false });
    const queryExists = await User.countDocuments({ role: 'teacher', isActive: { $exists: true } });
    const queryNotExists = await User.countDocuments({ role: 'teacher', isActive: { $exists: false } });

    console.log(`   role: 'teacher', isActive: true → ${queryTrue}`);
    console.log(`   role: 'teacher', isActive: false → ${queryFalse}`);
    console.log(`   role: 'teacher', isActive: {$exists: true} → ${queryExists}`);
    console.log(`   role: 'teacher', isActive: {$exists: false} → ${queryNotExists}`);

    // Activer tous les enseignants qui n'ont pas isActive = true
    console.log('\n🔧 ACTIVATION EN COURS...');
    
    const result = await User.updateMany(
      { 
        role: 'teacher',
        $or: [
          { isActive: false },
          { isActive: { $exists: false } },
          { isActive: null }
        ]
      },
      { $set: { isActive: true } }
    );

    console.log(`✅ ${result.modifiedCount} enseignants mis à jour`);

    // Vérification finale
    const finalActiveCount = await User.countDocuments({ role: 'teacher', isActive: true });
    console.log(`📊 Total enseignants actifs après mise à jour: ${finalActiveCount}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugTeacherStatus();