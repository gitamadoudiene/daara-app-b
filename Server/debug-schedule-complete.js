require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');
const School = require('./models/School');

async function debugScheduleAndAssociations() {
  try {
    console.log('🔍 DEBUG COMPLET DES SCHEDULES ET ASSOCIATIONS TEACHER-CLASSE');
    console.log('================================================================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // 1. Vérifier Barra Fall
    console.log('👤 1. VERIFICATION DE BARRA FALL:');
    const barraFall = await User.findOne({ email: 'barra.fall@lespedagogues.sn' }).populate('schoolId');
    if (barraFall) {
      console.log(`   ✅ Trouvé: ${barraFall.name} (ID: ${barraFall._id})`);
      console.log(`   📧 Email: ${barraFall.email}`);
      console.log(`   🎭 Rôle: ${barraFall.role}`);
      console.log(`   🏫 École: ${barraFall.schoolId?.name || 'Aucune'} (ID: ${barraFall.schoolId?._id || 'Aucune'})`);
    } else {
      console.log('   ❌ Barra Fall NON TROUVÉ!');
      return;
    }

    // 2. Vérifier les classes de l'école
    console.log('\n🏫 2. CLASSES DE L\'ÉCOLE "LES PÉDAGOGUES":');
    const classes = await Class.find({ schoolId: barraFall.schoolId._id }).populate('teachers', 'name email');
    console.log(`   📊 Nombre total de classes: ${classes.length}`);
    
    classes.forEach((cls, index) => {
      console.log(`   ${index + 1}. ${cls.name} (${cls.level}) - ID: ${cls._id}`);
      console.log(`      👥 Enseignants assignés directement: ${cls.teachers?.length || 0}`);
      if (cls.teachers && cls.teachers.length > 0) {
        cls.teachers.forEach(teacher => {
          console.log(`         - ${teacher.name} (${teacher.email})`);
        });
      }
    });

    // 3. Vérifier TOUS les schedules (emplois du temps)
    console.log('\n📅 3. VERIFICATION DE TOUS LES SCHEDULES:');
    const allSchedules = await Schedule.find({})
      .populate('teacherId', 'name email')
      .populate('classId', 'name level')
      .populate('schoolId', 'name');

    console.log(`   📊 Nombre total de schedules: ${allSchedules.length}`);
    
    if (allSchedules.length === 0) {
      console.log('   ❌ AUCUN SCHEDULE TROUVÉ! C\'est le problème principal!');
    } else {
      allSchedules.forEach((schedule, index) => {
        console.log(`   ${index + 1}. Schedule ID: ${schedule._id}`);
        console.log(`      👤 Enseignant: ${schedule.teacherId?.name || 'NON DÉFINI'} (${schedule.teacherId?.email || 'N/A'})`);
        console.log(`      📚 Classe: ${schedule.classId?.name || 'NON DÉFINIE'} (${schedule.classId?.level || 'N/A'})`);
        console.log(`      🏫 École: ${schedule.schoolId?.name || 'NON DÉFINIE'}`);
        console.log(`      📅 Jour: ${schedule.dayOfWeek}, Heure: ${schedule.startTime}-${schedule.endTime}`);
        console.log(`      📖 Matière: ${schedule.subject}`);
        console.log(`      ✅ Actif: ${schedule.isActive ? 'Oui' : 'Non'}`);
      });
    }

    // 4. Vérifier spécifiquement les schedules de Barra Fall
    console.log('\n🎯 4. SCHEDULES SPÉCIFIQUES DE BARRA FALL:');
    const barraSchedules = await Schedule.find({ teacherId: barraFall._id })
      .populate('classId', 'name level')
      .populate('schoolId', 'name');

    console.log(`   📊 Nombre de schedules pour Barra Fall: ${barraSchedules.length}`);
    
    if (barraSchedules.length === 0) {
      console.log('   ❌ AUCUN SCHEDULE POUR BARRA FALL! Il faut créer des créneaux.');
    } else {
      barraSchedules.forEach((schedule, index) => {
        console.log(`   ${index + 1}. Classe: ${schedule.classId?.name || 'NON DÉFINIE'} (${schedule.classId?.level || 'N/A'})`);
        console.log(`      📅 ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`);
        console.log(`      📖 Matière: ${schedule.subject}`);
        console.log(`      ✅ Actif: ${schedule.isActive ? 'Oui' : 'Non'}`);
      });
    }

    // 5. Tester la fonction getTeacherClasses simulée
    console.log('\n🧪 5. TEST DE LA FONCTION getTeacherClasses:');
    
    // Simuler la logique de getTeacherClasses
    const scheduleClasses = await Schedule.find({ 
      teacherId: barraFall._id, 
      isActive: true 
    }).populate('classId', 'name level section').select('classId');

    const directClasses = await Class.find({ 
      teachers: { $in: [barraFall._id] } 
    }).select('name level section');

    // Combiner et dédupliquer
    const uniqueClasses = new Map();
    
    // Ajouter les classes via schedule
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

    // Ajouter les classes directes
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
    console.log(`   📊 Classes finales (dédupliquées): ${finalClasses.length}`);

    if (finalClasses.length === 0) {
      console.log('   ❌ AUCUNE CLASSE TROUVÉE! Problème confirmé.');
    } else {
      finalClasses.forEach((cls, index) => {
        console.log(`   ${index + 1}. ${cls.name} (${cls.level}) - Source: ${cls.source}`);
      });
    }

    // 6. Recommandations
    console.log('\n💡 6. RECOMMANDATIONS:');
    if (allSchedules.length === 0) {
      console.log('   🔧 Il faut créer des schedules (créneaux d\'emploi du temps)');
      console.log('   🔧 Utiliser ScheduleManagement pour créer des créneaux');
    } else if (barraSchedules.length === 0) {
      console.log('   🔧 Il faut assigner Barra Fall à des créneaux dans Schedule');
    } else if (finalClasses.length === 0) {
      console.log('   🔧 Problème dans la logique de récupération des classes');
    } else {
      console.log('   ✅ Les associations semblent correctes');
    }

    console.log('\n================================================================');
    console.log('🏁 DEBUG TERMINÉ');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter le debug
debugScheduleAndAssociations();