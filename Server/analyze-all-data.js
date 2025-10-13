require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');

async function analyzeAllData() {
  try {
    console.log('🔍 ANALYSE COMPLÈTE DES DONNÉES');
    console.log('===============================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // 1. Tous les enseignants (sans filtre isActive)
    console.log('👨‍🏫 1. TOUS LES ENSEIGNANTS:');
    const allTeachers = await User.find({ role: 'teacher' }).select('name email isActive schoolId');
    console.log(`   📊 Total enseignants: ${allTeachers.length}`);
    
    const activeTeachers = allTeachers.filter(t => t.isActive);
    const inactiveTeachers = allTeachers.filter(t => !t.isActive);
    console.log(`   ✅ Actifs: ${activeTeachers.length}`);
    console.log(`   ❌ Inactifs: ${inactiveTeachers.length}`);

    console.log('\n   📋 Liste complète:');
    allTeachers.forEach((teacher, index) => {
      console.log(`   ${index + 1}. ${teacher.name} (${teacher.email})`);
      console.log(`      Status: ${teacher.isActive ? '✅ Actif' : '❌ Inactif'}`);
      console.log(`      École: ${teacher.schoolId}`);
    });

    // 2. Tous les schedules
    console.log('\n📅 2. ANALYSE DES 26 SCHEDULES:');
    const schedules = await Schedule.find()
      .populate('teacherId', 'name email')
      .populate('classId', 'name level');

    console.log('   📋 Détail des schedules:');
    schedules.forEach((schedule, index) => {
      console.log(`   ${index + 1}. Enseignant: ${schedule.teacherId?.name || 'SUPPRIMÉ'} (${schedule.teacherId?._id || 'N/A'})`);
      console.log(`      Classe: ${schedule.classId?.name || 'SUPPRIMÉE'} (${schedule.classId?._id || 'N/A'})`);
      console.log(`      📅 ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`);
      console.log(`      📖 Matière: ${schedule.subject}`);
      console.log(`      ✅ Actif: ${schedule.isActive}`);
      console.log('      ---');
    });

    // 3. Compter les associations uniques
    console.log('\n🔗 3. ASSOCIATIONS TEACHER-CLASSE VIA SCHEDULES:');
    const teacherClassPairs = new Map();
    
    schedules.forEach(schedule => {
      if (schedule.teacherId && schedule.classId && schedule.isActive) {
        const key = `${schedule.teacherId._id}-${schedule.classId._id}`;
        if (!teacherClassPairs.has(key)) {
          teacherClassPairs.set(key, {
            teacher: schedule.teacherId.name,
            class: schedule.classId.name,
            teacherId: schedule.teacherId._id,
            classId: schedule.classId._id
          });
        }
      }
    });

    console.log(`   📊 Associations uniques teacher-classe: ${teacherClassPairs.size}`);
    Array.from(teacherClassPairs.values()).forEach((pair, index) => {
      console.log(`   ${index + 1}. ${pair.teacher} → ${pair.class}`);
    });

    // 4. Tester getTeacherClasses avec un enseignant qui a des schedules
    if (teacherClassPairs.size > 0) {
      console.log('\n🧪 4. TEST getTeacherClasses:');
      const firstPair = Array.from(teacherClassPairs.values())[0];
      const testTeacherId = firstPair.teacherId;
      
      console.log(`   🎯 Test avec: ${firstPair.teacher} (${testTeacherId})`);

      // Simuler exactement la fonction getTeacherClasses
      const scheduleClasses = await Schedule.find({ 
        teacherId: testTeacherId, 
        isActive: true 
      }).populate('classId', 'name level section').select('classId');

      const directClasses = await Class.find({ 
        teachers: { $in: [testTeacherId] } 
      }).select('name level section');

      // Combiner et dédupliquer comme dans le vrai code
      const uniqueClasses = new Map();
      
      scheduleClasses.forEach(schedule => {
        if (schedule.classId) {
          uniqueClasses.set(schedule.classId._id.toString(), {
            _id: schedule.classId._id,
            name: schedule.classId.name,
            level: schedule.classId.level,
            section: schedule.classId.section,
            source: 'schedule'
          });
        }
      });

      directClasses.forEach(cls => {
        if (!uniqueClasses.has(cls._id.toString())) {
          uniqueClasses.set(cls._id.toString(), {
            _id: cls._id,
            name: cls.name,
            level: cls.level,
            section: cls.section,
            source: 'direct'
          });
        }
      });

      const finalClasses = Array.from(uniqueClasses.values());

      console.log(`   📊 Classes via Schedule: ${scheduleClasses.length}`);
      console.log(`   📊 Classes directes: ${directClasses.length}`);
      console.log(`   📊 Classes finales: ${finalClasses.length}`);

      if (finalClasses.length > 0) {
        console.log('   ✅ SUCCESS! Cet enseignant voit ses classes:');
        finalClasses.forEach((cls, index) => {
          console.log(`      ${index + 1}. ${cls.name} (${cls.level}) - Source: ${cls.source}`);
        });
      } else {
        console.log('   ❌ ÉCHEC! Aucune classe trouvée');
      }
    }

    console.log('\n💡 CONCLUSION:');
    if (teacherClassPairs.size > 0) {
      console.log('   ✅ Les schedules existent et font le lien teacher-classe');
      console.log('   🔧 Le problème peut venir de:');
      console.log('      - Enseignants inactifs');
      console.log('      - Problème dans getTeacherClasses');
      console.log('      - Token/auth qui ne récupère pas le bon teacherId');
    } else {
      console.log('   ❌ Aucune association teacher-classe trouvée via schedules');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeAllData();