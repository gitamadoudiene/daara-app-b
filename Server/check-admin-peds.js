const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const User = require('./models/User');
const Class = require('./models/Class');

async function checkClassesData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier les classes et leurs studentCount
    const classes = await Class.find();
    console.log(`📚 Nombre de classes trouvées: ${classes.length}`);

    for (const cls of classes) {
      console.log(`\n🏫 Classe: ${cls.name}`);
      console.log(`   - ID: ${cls._id}`);
      console.log(`   - Niveau: ${cls.level}`);
      console.log(`   - Capacité: ${cls.capacity}`);
      console.log(`   - StudentCount: ${cls.studentCount}`);
      console.log(`   - SchoolId: ${cls.schoolId}`);

      // Compter les étudiants réellement assignés à cette classe
      const actualStudents = await User.countDocuments({
        role: 'student',
        classId: cls._id
      });
      console.log(`   - Étudiants réels dans la DB: ${actualStudents}`);

      if (cls.studentCount !== actualStudents) {
        console.log(`   ⚠️  INCOHÉRENCE: studentCount=${cls.studentCount} vs réel=${actualStudents}`);
      } else {
        console.log(`   ✅ Cohérent`);
      }
    }

    // Vérifier l'utilisateur admin
    const admin = await User.findOne({ email: 'adminpeds@lespedagogues.com' });
    
    if (!admin) {
      console.error('❌ Utilisateur adminpeds@lespedagogues.com non trouvé');
    } else {
      console.log('\n👤 Utilisateur admin trouvé:');
      console.log(`   - ID: ${admin._id}`);
      console.log(`   - Nom: ${admin.name}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Rôle: ${admin.role}`);
      console.log(`   - schoolId: ${admin.schoolId || 'ABSENT'}`);
    }  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

checkClassesData();