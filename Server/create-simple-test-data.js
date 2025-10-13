require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');
const School = require('./models/School');
const Subject = require('./models/Subject');
const bcrypt = require('bcryptjs');

async function createSimpleTestData() {
  try {
    console.log('🚀 CRÉATION SIMPLE DES DONNÉES DE TEST');
    console.log('=====================================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // 1. École
    console.log('🏫 1. ÉCOLE:');
    let school = await School.findOne({ name: 'Les Pédagogues' });
    if (!school) {
      school = new School({
        name: 'Les Pédagogues',
        address: 'Dakar, Sénégal',
        phone: '+221 33 123 4567',
        email: 'contact@lespedagogues.sn',
        director: 'Directeur Principal',
        createdYear: '2024',
        status: 'Actif',
        type: 'Privé'
      });
      await school.save();
    }
    console.log(`   ✅ École: ${school.name} (${school._id})`);

    // 2. Matière Mathématiques
    console.log('\n📖 2. MATIÈRE:');
    let mathSubject = await Subject.findOne({ 
      name: 'Mathématiques', 
      schoolId: school._id 
    });
    if (!mathSubject) {
      mathSubject = new Subject({
        name: 'Mathématiques',
        code: 'MATH',
        description: 'Mathématiques pour Terminale S',
        schoolId: school._id,
        coefficient: 4,
        isActive: true
      });
      await mathSubject.save();
    }
    console.log(`   ✅ Matière: ${mathSubject.name} (${mathSubject._id})`);

    // 3. Barra Fall
    console.log('\n👤 3. ENSEIGNANT:');
    let barraFall = await User.findOne({ email: 'barra.fall@lespedagogues.sn' });
    if (!barraFall) {
      const hashedPassword = await bcrypt.hash('barrafall123', 10);
      barraFall = new User({
        name: 'Barra Fall',
        email: 'barra.fall@lespedagogues.sn',
        password: hashedPassword,
        role: 'teacher',
        schoolId: school._id,
        phone: '+221 77 123 4567',
        isActive: true
      });
      await barraFall.save();
    }
    console.log(`   ✅ Enseignant: ${barraFall.name} (${barraFall._id})`);

    // 4. Classe Terminale S
    console.log('\n📚 4. CLASSE:');
    let terminaleS = await Class.findOne({ 
      name: 'Terminale S', 
      schoolId: school._id 
    });
    if (!terminaleS) {
      terminaleS = new Class({
        name: 'Terminale S',
        level: 'Terminal_S',
        section: 'S',
        capacity: 35,
        anneeScolaire: '2024-2025',
        schoolId: school._id,
        teachers: [barraFall._id],
        subjects: ['Mathématiques'],
        room: 'Salle 201'
      });
      await terminaleS.save();
    } else if (!terminaleS.teachers.includes(barraFall._id)) {
      terminaleS.teachers.push(barraFall._id);
      await terminaleS.save();
    }
    console.log(`   ✅ Classe: ${terminaleS.name} (${terminaleS._id})`);

    // 5. Schedules avec subjectId
    console.log('\n📅 5. SCHEDULES:');
    const scheduleData = {
      teacherId: barraFall._id,
      classId: terminaleS._id,
      schoolId: school._id,
      subjectId: mathSubject._id, // Maintenant on a le subjectId
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '10:00',
      subject: 'Mathématiques',
      isActive: true
    };

    let schedule = await Schedule.findOne({
      teacherId: scheduleData.teacherId,
      classId: scheduleData.classId,
      dayOfWeek: scheduleData.dayOfWeek,
      startTime: scheduleData.startTime
    });

    if (!schedule) {
      schedule = new Schedule(scheduleData);
      await schedule.save();
      console.log(`   ✅ Schedule créé: ${scheduleData.dayOfWeek} ${scheduleData.startTime}-${scheduleData.endTime}`);
    } else {
      console.log(`   ✅ Schedule existant: ${scheduleData.dayOfWeek} ${scheduleData.startTime}-${scheduleData.endTime}`);
    }

    // 6. Test final
    console.log('\n🔍 6. VÉRIFICATION FINALE:');
    
    const barraSchedules = await Schedule.find({ 
      teacherId: barraFall._id,
      isActive: true 
    }).populate('classId', 'name level');

    console.log(`   📊 Schedules de Barra Fall: ${barraSchedules.length}`);
    barraSchedules.forEach(s => {
      console.log(`      - ${s.classId.name} (${s.dayOfWeek} ${s.startTime}-${s.endTime})`);
    });

    const classesWithBarra = await Class.find({ 
      teachers: { $in: [barraFall._id] } 
    });
    console.log(`   📊 Classes avec Barra Fall: ${classesWithBarra.length}`);

    console.log('\n✅ DONNÉES DE TEST CRÉÉES AVEC SUCCÈS!');
    console.log('\n🎯 MAINTENANT TESTEZ:');
    console.log('   Email: barra.fall@lespedagogues.sn');
    console.log('   Mot de passe: barrafall123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSimpleTestData();