require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');
const School = require('./models/School');
const bcrypt = require('bcryptjs');

async function createCompleteTestData() {
  try {
    console.log('🚀 CRÉATION DES DONNÉES DE TEST COMPLÈTES');
    console.log('=======================================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // 1. Vérifier/Créer l'école "Les Pédagogues"
    console.log('🏫 1. CRÉATION/VÉRIFICATION DE L\'ÉCOLE:');
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
      console.log(`   ✅ École créée: ${school.name} (ID: ${school._id})`);
    } else {
      console.log(`   ✅ École trouvée: ${school.name} (ID: ${school._id})`);
    }

    // 2. Créer/Vérifier Barra Fall (enseignant de maths)
    console.log('\n👤 2. CRÉATION/VÉRIFICATION DE BARRA FALL:');
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
        address: 'Dakar, Sénégal',
        isActive: true,
        qualification: 'Licence en Mathématiques',
        experience: '5 ans',
        specialization: 'Mathématiques',
        subjects: ['Mathématiques']
      });
      await barraFall.save();
      console.log(`   ✅ Enseignant créé: ${barraFall.name} (ID: ${barraFall._id})`);
    } else {
      console.log(`   ✅ Enseignant trouvé: ${barraFall.name} (ID: ${barraFall._id})`);
    }

    // 3. Créer/Vérifier la classe Terminale S
    console.log('\n📚 3. CRÉATION/VÉRIFICATION DE LA CLASSE TERMINALE S:');
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
        teachers: [barraFall._id], // Assigner Barra Fall directement
        subjects: ['Mathématiques', 'Physique-Chimie', 'Sciences de la Vie et de la Terre'],
        room: 'Salle 201'
      });
      await terminaleS.save();
      console.log(`   ✅ Classe créée: ${terminaleS.name} (ID: ${terminaleS._id})`);
      console.log(`   👥 Enseignants assignés: ${terminaleS.teachers.length}`);
    } else {
      // S'assurer que Barra Fall est dans la liste des enseignants
      if (!terminaleS.teachers.includes(barraFall._id)) {
        terminaleS.teachers.push(barraFall._id);
        await terminaleS.save();
        console.log(`   ✅ Barra Fall ajouté à la classe existante: ${terminaleS.name}`);
      } else {
        console.log(`   ✅ Classe trouvée: ${terminaleS.name} (ID: ${terminaleS._id})`);
      }
    }

    // 4. Créer des schedules (créneaux d'emploi du temps)
    console.log('\n📅 4. CRÉATION DES SCHEDULES (EMPLOI DU TEMPS):');
    
    const schedulesToCreate = [
      {
        teacherId: barraFall._id,
        classId: terminaleS._id,
        schoolId: school._id,
        dayOfWeek: 'Lundi',
        startTime: '08:00',
        endTime: '10:00',
        subject: 'Mathématiques',
        isActive: true
      },
      {
        teacherId: barraFall._id,
        classId: terminaleS._id,
        schoolId: school._id,
        dayOfWeek: 'Mercredi',
        startTime: '10:00',
        endTime: '12:00',
        subject: 'Mathématiques',
        isActive: true
      },
      {
        teacherId: barraFall._id,
        classId: terminaleS._id,
        schoolId: school._id,
        dayOfWeek: 'Vendredi',
        startTime: '14:00',
        endTime: '16:00',
        subject: 'Mathématiques',
        isActive: true
      }
    ];

    for (const scheduleData of schedulesToCreate) {
      const existingSchedule = await Schedule.findOne({
        teacherId: scheduleData.teacherId,
        classId: scheduleData.classId,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime
      });

      if (!existingSchedule) {
        const schedule = new Schedule(scheduleData);
        await schedule.save();
        console.log(`   ✅ Créneau créé: ${scheduleData.dayOfWeek} ${scheduleData.startTime}-${scheduleData.endTime} (${scheduleData.subject})`);
      } else {
        console.log(`   ✅ Créneau existant: ${scheduleData.dayOfWeek} ${scheduleData.startTime}-${scheduleData.endTime}`);
      }
    }

    // 5. Créer d'autres enseignants pour tests
    console.log('\n👥 5. CRÉATION D\'AUTRES ENSEIGNANTS DE TEST:');
    
    const otherTeachers = [
      {
        name: 'Aminata Diop',
        email: 'aminata.diop@lespedagogues.sn',
        password: 'aminata123',
        subjects: ['Français', 'Littérature'],
        qualification: 'Master en Lettres'
      },
      {
        name: 'Ousmane Sow',
        email: 'ousmane.sow@lespedagogues.sn',
        password: 'ousmane123',
        subjects: ['Physique-Chimie'],
        qualification: 'Licence en Physique'
      }
    ];

    for (const teacherData of otherTeachers) {
      let teacher = await User.findOne({ email: teacherData.email });
      
      if (!teacher) {
        const hashedPassword = await bcrypt.hash(teacherData.password, 10);
        teacher = new User({
          name: teacherData.name,
          email: teacherData.email,
          password: hashedPassword,
          role: 'teacher',
          schoolId: school._id,
          phone: '+221 77 987 6543',
          address: 'Dakar, Sénégal',
          isActive: true,
          qualification: teacherData.qualification,
          experience: '3 ans',
          specialization: teacherData.subjects.join(', '),
          subjects: teacherData.subjects
        });
        await teacher.save();
        console.log(`   ✅ Enseignant créé: ${teacher.name} (${teacherData.subjects.join(', ')})`);
      } else {
        console.log(`   ✅ Enseignant existant: ${teacher.name}`);
      }
    }

    // 6. Vérification finale
    console.log('\n🔍 6. VÉRIFICATION FINALE:');
    
    const totalTeachers = await User.countDocuments({ 
      role: 'teacher', 
      schoolId: school._id 
    });
    
    const totalSchedules = await Schedule.countDocuments({ 
      schoolId: school._id,
      isActive: true 
    });
    
    const barraSchedules = await Schedule.countDocuments({ 
      teacherId: barraFall._id,
      isActive: true 
    });

    console.log(`   📊 Total enseignants dans l'école: ${totalTeachers}`);
    console.log(`   📊 Total schedules actifs: ${totalSchedules}`);
    console.log(`   📊 Schedules de Barra Fall: ${barraSchedules}`);

    console.log('\n✅ DONNÉES DE TEST CRÉÉES AVEC SUCCÈS!');
    console.log('\n🎯 INSTRUCTIONS POUR TESTER:');
    console.log('1. Connectez-vous avec: barra.fall@lespedagogues.sn / barrafall123');
    console.log('2. Allez dans "Notes & Évaluations"');
    console.log('3. Cliquez sur "Nouvelle Évaluation"');
    console.log('4. Vous devriez voir "Terminale S" dans la liste des classes');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Exécuter la création
createCompleteTestData();