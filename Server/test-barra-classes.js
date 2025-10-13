const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');
const School = require('./models/School');

async function testBarraClasses() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://localhost:27017/daara-school-management');
    console.log('✅ Connexion à MongoDB réussie\n');

    // 1. Chercher l'utilisateur Barra Fall
    console.log('🔍 Recherche de l\'utilisateur Barra Fall...');
    const barraUsers = await User.find({
      $or: [
        { name: { $regex: 'barra', $options: 'i' } },
        { email: { $regex: 'barra', $options: 'i' } }
      ]
    });

    console.log(`Trouvé ${barraUsers.length} utilisateur(s) avec "barra":`);
    barraUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user._id}`);
      console.log(`     Nom: ${user.name}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Rôle: ${user.role}`);
      console.log(`     Matières: ${user.subjects || 'Aucune'}`);
      console.log(`     École ID: ${user.schoolId || 'Aucune'}`);
      console.log('');
    });

    if (barraUsers.length === 0) {
      console.log('❌ Aucun utilisateur "Barra" trouvé. Vérifions tous les enseignants...\n');
      
      const allTeachers = await User.find({ role: 'teacher' });
      console.log(`📋 Liste de tous les enseignants (${allTeachers.length}):`);
      allTeachers.forEach((teacher, index) => {
        console.log(`  ${index + 1}. ${teacher.name} (${teacher.email}) - Matières: ${teacher.subjects || 'Aucune'}`);
      });
      return;
    }

    const barra = barraUsers[0]; // Prendre le premier utilisateur trouvé
    console.log(`\n📍 Utilisateur sélectionné: ${barra.name} (ID: ${barra._id})\n`);

    // 2. Chercher l'école "Les Pédagogues"
    console.log('🏫 Recherche de l\'école "Les Pédagogues"...');
    const schools = await School.find({
      name: { $regex: 'pedagogue', $options: 'i' }
    });

    console.log(`Trouvé ${schools.length} école(s) avec "pédagogue":`);
    schools.forEach((school, index) => {
      console.log(`  ${index + 1}. ID: ${school._id}`);
      console.log(`     Nom: ${school.name}`);
      console.log(`     Adresse: ${school.address || 'Non définie'}`);
      console.log('');
    });

    // 3. Chercher la classe Terminale S
    console.log('🎓 Recherche de la classe "Terminale S"...');
    const terminaleClasses = await Class.find({
      $or: [
        { name: { $regex: 'terminale', $options: 'i' } },
        { level: { $regex: 'terminale', $options: 'i' } }
      ]
    }).populate('schoolId', 'name');

    console.log(`Trouvé ${terminaleClasses.length} classe(s) Terminale:`);
    terminaleClasses.forEach((cls, index) => {
      console.log(`  ${index + 1}. ID: ${cls._id}`);
      console.log(`     Nom: ${cls.name}`);
      console.log(`     Niveau: ${cls.level}`);
      console.log(`     Section: ${cls.section || 'Aucune'}`);
      console.log(`     École: ${cls.schoolId?.name || 'Non définie'}`);
      console.log(`     Enseignants: ${cls.teachers?.length || 0}`);
      if (cls.teachers && cls.teachers.length > 0) {
        console.log(`     IDs Enseignants: ${cls.teachers.join(', ')}`);
      }
      console.log('');
    });

    // 4. Chercher les créneaux d'emploi du temps de Barra
    console.log('📅 Recherche des créneaux d\'emploi du temps de Barra...');
    const barraSchedules = await Schedule.find({
      teacherId: barra._id,
      isActive: true
    })
    .populate('classId', 'name level section')
    .populate('subjectId', 'name code')
    .populate('schoolId', 'name');

    console.log(`Trouvé ${barraSchedules.length} créneau(x) pour Barra:`);
    barraSchedules.forEach((schedule, index) => {
      console.log(`  ${index + 1}. Classe: ${schedule.classId?.name || 'N/A'}`);
      console.log(`     Matière: ${schedule.subjectId?.name || 'N/A'}`);
      console.log(`     Jour: ${schedule.dayOfWeek}`);
      console.log(`     Heure: ${schedule.startTime} - ${schedule.endTime}`);
      console.log(`     Salle: ${schedule.room || 'N/A'}`);
      console.log(`     École: ${schedule.schoolId?.name || 'N/A'}`);
      console.log('');
    });

    // 5. Si pas de créneaux, chercher tous les créneaux avec "barra"
    if (barraSchedules.length === 0) {
      console.log('❌ Aucun créneau trouvé pour Barra. Recherche dans tous les créneaux...\n');
      
      const allSchedules = await Schedule.find({ isActive: true })
        .populate('teacherId', 'name email')
        .populate('classId', 'name level')
        .populate('subjectId', 'name');

      console.log(`📋 Total de créneaux actifs: ${allSchedules.length}`);

      const barraInSchedules = allSchedules.filter(schedule => 
        schedule.teacherId && 
        (schedule.teacherId.name?.toLowerCase().includes('barra') || 
         schedule.teacherId.email?.toLowerCase().includes('barra'))
      );

      console.log(`Créneaux avec "barra" dans le nom/email: ${barraInSchedules.length}`);
      barraInSchedules.forEach((schedule, index) => {
        console.log(`  ${index + 1}. Enseignant: ${schedule.teacherId.name}`);
        console.log(`     Email: ${schedule.teacherId.email}`);
        console.log(`     Classe: ${schedule.classId?.name || 'N/A'}`);
        console.log(`     Matière: ${schedule.subjectId?.name || 'N/A'}`);
        console.log('');
      });

      // Chercher créneaux maths/terminale
      const mathTerminaleSchedules = allSchedules.filter(schedule => 
        (schedule.subjectId?.name?.toLowerCase().includes('math') ||
         schedule.classId?.name?.toLowerCase().includes('terminale') ||
         schedule.classId?.level?.toLowerCase().includes('terminale'))
      );

      console.log(`\n📊 Créneaux Maths/Terminale: ${mathTerminaleSchedules.length}`);
      mathTerminaleSchedules.forEach((schedule, index) => {
        console.log(`  ${index + 1}. Enseignant: ${schedule.teacherId?.name || 'N/A'}`);
        console.log(`     Classe: ${schedule.classId?.name || 'N/A'}`);
        console.log(`     Matière: ${schedule.subjectId?.name || 'N/A'}`);
        console.log('');
      });
    }

    // 6. Créer un créneau test pour Barra si nécessaire
    if (barraSchedules.length === 0 && terminaleClasses.length > 0) {
      console.log('\n🔧 Tentative de création d\'un créneau test pour Barra...');
      
      // Chercher une matière Mathématiques
      const Subject = require('./models/Subject');
      let mathSubject = await Subject.findOne({
        name: { $regex: 'math', $options: 'i' }
      });

      if (!mathSubject) {
        console.log('Création de la matière Mathématiques...');
        mathSubject = new Subject({
          name: 'Mathématiques',
          code: 'MATH',
          description: 'Mathématiques générale',
          schoolId: schools[0]?._id || null
        });
        await mathSubject.save();
        console.log('✅ Matière Mathématiques créée');
      }

      // Mettre à jour les matières de Barra
      if (!barra.subjects || !barra.subjects.includes('Mathématiques')) {
        await User.findByIdAndUpdate(barra._id, {
          $addToSet: { subjects: 'Mathématiques' }
        });
        console.log('✅ Matière Mathématiques ajoutée à Barra');
      }

      // Créer un créneau test
      const testSchedule = new Schedule({
        schoolId: schools[0]?._id || terminaleClasses[0].schoolId,
        classId: terminaleClasses[0]._id,
        subjectId: mathSubject._id,
        teacherId: barra._id,
        dayOfWeek: 'Lundi',
        startTime: '08:00',
        endTime: '12:00',
        room: 'Salle de Maths',
        semester: '2025-2026'
      });

      await testSchedule.save();
      console.log('✅ Créneau test créé pour Barra en Terminale S - Mathématiques');
      
      // Vérifier le nouveau créneau
      const newSchedule = await Schedule.findById(testSchedule._id)
        .populate('classId', 'name level')
        .populate('subjectId', 'name')
        .populate('teacherId', 'name');
      
      console.log('\n🎉 Nouveau créneau créé:');
      console.log(`   Enseignant: ${newSchedule.teacherId.name}`);
      console.log(`   Classe: ${newSchedule.classId.name}`);
      console.log(`   Matière: ${newSchedule.subjectId.name}`);
      console.log(`   Horaire: ${newSchedule.dayOfWeek} ${newSchedule.startTime}-${newSchedule.endTime}`);
    }

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📪 Déconnexion de MongoDB');
    process.exit(0);
  }
}

// Exécuter le test
testBarraClasses();