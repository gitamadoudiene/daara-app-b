require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');

async function analyzeExistingSchedules() {
  try {
    console.log('🔍 ANALYSE DES SCHEDULES EXISTANTS EN BASE DE DONNÉES');
    console.log('===================================================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // 1. Compter les enseignants totaux
    console.log('👨‍🏫 1. ANALYSE DES ENSEIGNANTS:');
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    console.log(`   📊 Total enseignants actifs: ${totalTeachers}`);

    const teachers = await User.find({ role: 'teacher', isActive: true }).select('name email schoolId');
    console.log('   📋 Liste des enseignants:');
    teachers.forEach((teacher, index) => {
      console.log(`   ${index + 1}. ${teacher.name} (${teacher.email}) - École: ${teacher.schoolId}`);
    });

    // 2. Compter les classes totales
    console.log('\n📚 2. ANALYSE DES CLASSES:');
    const totalClasses = await Class.countDocuments();
    console.log(`   📊 Total classes: ${totalClasses}`);

    const classes = await Class.find().select('name level schoolId teachers');
    console.log('   📋 Liste des classes avec enseignants assignés:');
    classes.forEach((cls, index) => {
      console.log(`   ${index + 1}. ${cls.name} (${cls.level}) - École: ${cls.schoolId}`);
      console.log(`      👥 Enseignants directement assignés: ${cls.teachers?.length || 0}`);
    });

    // 3. Analyser les Schedules
    console.log('\n📅 3. ANALYSE DES SCHEDULES:');
    const totalSchedules = await Schedule.countDocuments();
    console.log(`   📊 Total schedules: ${totalSchedules}`);

    if (totalSchedules === 0) {
      console.log('   ❌ AUCUN SCHEDULE TROUVÉ! C\'est le problème principal!');
      console.log('   💡 SOLUTION: Il faut créer des emplois du temps dans ScheduleManagement');
    } else {
      const schedules = await Schedule.find()
        .populate('teacherId', 'name email')
        .populate('classId', 'name level')
        .populate('schoolId', 'name');

      console.log('   📋 Schedules existants:');
      schedules.forEach((schedule, index) => {
        console.log(`   ${index + 1}. ${schedule.teacherId?.name || 'ENSEIGNANT MANQUANT'} → ${schedule.classId?.name || 'CLASSE MANQUANTE'}`);
        console.log(`      📅 ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`);
        console.log(`      📖 Matière: ${schedule.subject}`);
        console.log(`      🏫 École: ${schedule.schoolId?.name || 'ÉCOLE MANQUANTE'}`);
        console.log(`      ✅ Actif: ${schedule.isActive}`);
      });

      // 4. Vérifier combien d'enseignants ont des schedules
      const teachersWithSchedules = await Schedule.distinct('teacherId');
      console.log(`\n   📊 Enseignants avec schedules: ${teachersWithSchedules.length}/${totalTeachers}`);
      
      const teachersWithoutSchedules = totalTeachers - teachersWithSchedules.length;
      if (teachersWithoutSchedules > 0) {
        console.log(`   ❌ Enseignants SANS schedules: ${teachersWithoutSchedules}`);
        console.log('   💡 Ces enseignants ne verront aucune classe dans l\'interface!');
      }
    }

    // 5. Test de la fonction getTeacherClasses pour un enseignant aléatoire
    if (teachers.length > 0) {
      console.log('\n🧪 4. TEST DE getTeacherClasses:');
      const randomTeacher = teachers[0]; // Prendre le premier enseignant
      console.log(`   🎯 Test avec: ${randomTeacher.name} (${randomTeacher._id})`);

      // Simuler la logique de getTeacherClasses
      const scheduleClasses = await Schedule.find({ 
        teacherId: randomTeacher._id, 
        isActive: true 
      }).populate('classId', 'name level section').select('classId');

      const directClasses = await Class.find({ 
        teachers: { $in: [randomTeacher._id] } 
      }).select('name level section');

      console.log(`   📊 Classes via Schedule: ${scheduleClasses.length}`);
      console.log(`   📊 Classes directes: ${directClasses.length}`);

      if (scheduleClasses.length === 0 && directClasses.length === 0) {
        console.log('   ❌ CET ENSEIGNANT NE VOIT AUCUNE CLASSE!');
        console.log('   💡 Il faut soit créer des schedules, soit l\'assigner directement aux classes');
      } else {
        console.log('   ✅ Cet enseignant a des classes assignées');
      }
    }

    // 6. Recommandations
    console.log('\n💡 5. RECOMMANDATIONS:');
    if (totalSchedules === 0) {
      console.log('   🔧 URGENT: Créer des emplois du temps via ScheduleManagement');
      console.log('   🔧 Ou assigner les enseignants directement aux classes via le champ teachers[]');
    } else {
      const teachersWithSchedules = await Schedule.distinct('teacherId');
      if (teachersWithSchedules.length < totalTeachers) {
        console.log('   🔧 Créer des schedules pour les enseignants manquants');
        console.log('   🔧 Ou les assigner directement aux classes');
      }
    }

    console.log('\n📝 INSTRUCTIONS:');
    console.log('1. Aller dans l\'interface admin → Emploi du Temps');
    console.log('2. Créer des créneaux pour chaque enseignant avec leurs classes');
    console.log('3. OU assigner les enseignants directement aux classes dans le champ teachers[]');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeExistingSchedules();