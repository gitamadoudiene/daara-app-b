const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');
const School = require('./models/School');
const Subject = require('./models/Subject');

async function initializeTestData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://localhost:27017/daara-school-management');
    console.log('✅ Connexion à MongoDB réussie\n');

    // 1. Créer l'école "Les Pédagogues" si elle n'existe pas
    console.log('🏫 Création/Vérification de l\'école "Les Pédagogues"...');
    let school = await School.findOne({
      name: { $regex: 'pedagogue', $options: 'i' }
    });

    if (!school) {
      school = new School({
        name: 'Les Pédagogues',
        address: 'Dakar, Sénégal',
        phone: '+221 33 123 45 67',
        email: 'contact@lespedagogues.sn',
        director: 'Directeur Principal',
        adminCount: 1,
        teacherCount: 0,
        studentCount: 500,
        createdYear: '2010',
        addedDate: new Date().toISOString().split('T')[0],
        status: 'Actif',
        type: 'Privé'
      });
      await school.save();
      console.log('✅ École "Les Pédagogues" créée avec ID:', school._id);
    } else {
      console.log('✅ École "Les Pédagogues" existe déjà avec ID:', school._id);
    }

    // 2. Créer la matière Mathématiques si elle n'existe pas
    console.log('\n📚 Création/Vérification de la matière Mathématiques...');
    let mathSubject = await Subject.findOne({
      name: { $regex: 'math', $options: 'i' },
      schoolId: school._id
    });

    if (!mathSubject) {
      mathSubject = new Subject({
        name: 'Mathématiques',
        code: 'MATH',
        description: 'Mathématiques générale - algèbre, géométrie, analyse',
        schoolId: school._id
      });
      await mathSubject.save();
      console.log('✅ Matière Mathématiques créée avec ID:', mathSubject._id);
    } else {
      console.log('✅ Matière Mathématiques existe déjà avec ID:', mathSubject._id);
    }

    // 3. Créer l'utilisateur Barra Fall si il n'existe pas
    console.log('\n👨‍🏫 Création/Vérification de l\'enseignant Barra Fall...');
    let barra = await User.findOne({
      $or: [
        { name: { $regex: 'barra', $options: 'i' } },
        { email: 'barra.fall@lespedagogues.sn' }
      ]
    });

    if (!barra) {
      const hashedPassword = await bcrypt.hash('barrafall123', 10);
      
      barra = new User({
        name: 'Barra Fall',
        email: 'barra.fall@lespedagogues.sn',
        password: hashedPassword,
        role: 'teacher',
        phone: '+221 77 123 45 67',
        schoolId: school._id,
        subjects: ['Mathématiques'],
        qualification: 'Master en Mathématiques',
        experience: 8,
        status: 'Actif'
      });
      await barra.save();
      console.log('✅ Enseignant Barra Fall créé avec ID:', barra._id);
      
      // Mettre à jour le compteur d'enseignants de l'école
      await School.findByIdAndUpdate(school._id, {
        $inc: { teacherCount: 1 }
      });
    } else {
      console.log('✅ Enseignant Barra Fall existe déjà avec ID:', barra._id);
      
      // S'assurer qu'il a les bonnes matières
      if (!barra.subjects || !barra.subjects.includes('Mathématiques')) {
        await User.findByIdAndUpdate(barra._id, {
          $addToSet: { subjects: 'Mathématiques' },
          schoolId: school._id
        });
        console.log('✅ Matières mises à jour pour Barra Fall');
      }
    }

    // 4. Créer la classe Terminale S si elle n'existe pas
    console.log('\n🎓 Création/Vérification de la classe Terminale S...');
    let terminaleS = await Class.findOne({
      name: { $regex: 'terminale.*s', $options: 'i' },
      schoolId: school._id
    });

    if (!terminaleS) {
      terminaleS = new Class({
        name: 'Terminale S',
        level: 'Terminale',
        section: 'S',
        room: 'Salle 12',
        capacity: 30,
        schoolId: school._id,
        anneeScolaire: '2025-2026',
        students: [], // On peut ajouter des étudiants plus tard
        studentCount: 25,
        subjects: ['Mathématiques', 'Physique', 'Chimie', 'Biologie']
      });
      await terminaleS.save();
      console.log('✅ Classe Terminale S créée avec ID:', terminaleS._id);
      
      // Mettre à jour le compteur de classes de l'école
      await School.findByIdAndUpdate(school._id, {
        $inc: { studentCount: terminaleS.studentCount || 25 }
      });
    } else {
      console.log('✅ Classe Terminale S existe déjà avec ID:', terminaleS._id);
    }

    // 5. Créer le créneau d'emploi du temps Barra -> Terminale S -> Math
    console.log('\n📅 Création/Vérification du créneau d\'emploi du temps...');
    let schedule = await Schedule.findOne({
      teacherId: barra._id,
      classId: terminaleS._id,
      subjectId: mathSubject._id,
      isActive: true
    });

    if (!schedule) {
      schedule = new Schedule({
        schoolId: school._id,
        classId: terminaleS._id,
        subjectId: mathSubject._id,
        teacherId: barra._id,
        dayOfWeek: 'Lundi',
        startTime: '08:00',
        endTime: '12:00',
        room: 'Salle de Maths',
        semester: '2025-2026',
        isActive: true,
        notes: 'Cours de mathématiques - Barra Fall enseigne à la Terminale S de 8h à midi'
      });
      await schedule.save();
      console.log('✅ Créneau d\'emploi du temps créé avec ID:', schedule._id);
      console.log('   📋 Détails:', {
        enseignant: 'Barra Fall',
        classe: 'Terminale S',
        matière: 'Mathématiques',
        horaire: 'Lundi 08:00-12:00'
      });
    } else {
      console.log('✅ Créneau d\'emploi du temps existe déjà avec ID:', schedule._id);
    }

    // 6. Créer quelques créneaux supplémentaires pour avoir plus de données
    console.log('\n📝 Création de créneaux supplémentaires...');
    const additionalSchedules = [
      {
        dayOfWeek: 'Mercredi',
        startTime: '14:00',
        endTime: '16:00',
        room: 'Salle de Maths'
      },
      {
        dayOfWeek: 'Vendredi',
        startTime: '10:00',
        endTime: '12:00',
        room: 'Salle 15'
      }
    ];

    for (const additionalSchedule of additionalSchedules) {
      const existingSchedule = await Schedule.findOne({
        teacherId: barra._id,
        classId: terminaleS._id,
        dayOfWeek: additionalSchedule.dayOfWeek,
        startTime: additionalSchedule.startTime,
        isActive: true
      });

      if (!existingSchedule) {
        const newSchedule = new Schedule({
          schoolId: school._id,
          classId: terminaleS._id,
          subjectId: mathSubject._id,
          teacherId: barra._id,
          dayOfWeek: additionalSchedule.dayOfWeek,
          startTime: additionalSchedule.startTime,
          endTime: additionalSchedule.endTime,
          room: additionalSchedule.room,
          semester: '2025-2026',
          isActive: true
        });
        await newSchedule.save();
        console.log(`✅ Créneau ${additionalSchedule.dayOfWeek} ${additionalSchedule.startTime}-${additionalSchedule.endTime} créé`);
      }
    }

    // 7. Vérification finale - Tester l'API
    console.log('\n🧪 Vérification finale - Test des associations...');
    
    const verificaSchedules = await Schedule.find({
      teacherId: barra._id,
      isActive: true
    })
    .populate('classId', 'name level section')
    .populate('subjectId', 'name code')
    .populate('schoolId', 'name');

    console.log(`📊 Créneaux trouvés pour Barra Fall: ${verificaSchedules.length}`);
    verificaSchedules.forEach((schedule, index) => {
      console.log(`  ${index + 1}. ${schedule.classId.name} - ${schedule.subjectId.name}`);
      console.log(`     ${schedule.dayOfWeek} ${schedule.startTime}-${schedule.endTime}`);
      console.log(`     École: ${schedule.schoolId.name}`);
    });

    // Extraire les classes uniques (comme dans la fonction API)
    const uniqueClasses = new Map();
    verificaSchedules.forEach(schedule => {
      if (schedule.classId) {
        const classId = schedule.classId._id.toString();
        if (!uniqueClasses.has(classId)) {
          uniqueClasses.set(classId, {
            _id: schedule.classId._id,
            name: schedule.classId.name,
            level: schedule.classId.level,
            section: schedule.classId.section,
            schoolName: schedule.schoolId ? schedule.schoolId.name : 'École inconnue',
            subjects: []
          });
        }
        // Ajouter la matière
        if (schedule.subjectId) {
          const classData = uniqueClasses.get(classId);
          if (!classData.subjects.some(s => s._id.toString() === schedule.subjectId._id.toString())) {
            classData.subjects.push({
              _id: schedule.subjectId._id,
              name: schedule.subjectId.name,
              code: schedule.subjectId.code
            });
          }
        }
      }
    });

    const classes = Array.from(uniqueClasses.values());
    console.log(`\n🎯 Classes uniques que Barra devrait voir: ${classes.length}`);
    classes.forEach((cls, index) => {
      console.log(`  ${index + 1}. ${cls.name} (${cls.level} ${cls.section})`);
      console.log(`     Matières: ${cls.subjects.map(s => s.name).join(', ')}`);
      console.log(`     École: ${cls.schoolName}`);
    });

    console.log('\n🎉 Initialisation des données terminée avec succès!');
    console.log('\n📋 Résumé:');
    console.log(`   🏫 École: ${school.name}`);
    console.log(`   👨‍🏫 Enseignant: ${barra.name} (${barra.email})`);
    console.log(`   🎓 Classe: ${terminaleS.name}`);
    console.log(`   📚 Matière: ${mathSubject.name}`);
    console.log(`   📅 Créneaux: ${verificaSchedules.length}`);
    console.log('\n💡 Barra Fall peut maintenant se connecter et voir sa classe Terminale S!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Déconnexion de MongoDB');
    process.exit(0);
  }
}

// Exécuter l'initialisation
initializeTestData();