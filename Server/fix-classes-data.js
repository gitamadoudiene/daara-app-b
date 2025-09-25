const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const User = require('./models/User');
const Class = require('./models/Class');

async function fixClassesData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer toutes les classes
    const classes = await Class.find();
    console.log(`📚 Nombre de classes trouvées: ${classes.length}`);

    for (const cls of classes) {
      console.log(`\n🏫 Classe: ${cls.name}`);

      // Compter les étudiants réellement assignés à cette classe
      const actualStudents = await User.countDocuments({
        role: 'student',
        classId: cls._id
      });

      console.log(`   - Étudiants réels: ${actualStudents}`);
      console.log(`   - StudentCount actuel: ${cls.studentCount}`);
      console.log(`   - Capacité actuelle: ${cls.capacity}`);

      // Mettre à jour seulement les champs nécessaires sans validation complète
      const updateResult = await Class.updateOne(
        { _id: cls._id },
        {
          $set: {
            studentCount: actualStudents,
            capacity: 40  // Forcer toujours à 40
          }
        }
      );
      console.log(`   ✅ Update result: ${updateResult.modifiedCount} document(s) modifié(s)`);
      console.log(`   ✅ Synchronisé: studentCount=${actualStudents}, capacity=40`);
    }

    console.log('\n🎯 Vérification finale...');
    // Recharger les classes après mise à jour
    const freshClasses = await Class.find();
    for (const cls of freshClasses) {
      const actualStudents = await User.countDocuments({
        role: 'student',
        classId: cls._id
      });
      console.log(`🏫 ${cls.name}: ${actualStudents}/${cls.capacity || 'N/A'} étudiants`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

fixClassesData();