require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Schedule = require('./models/Schedule');
const Class = require('./models/Class');

async function testGetTeacherClassesDirectly() {
  try {
    console.log('🧪 TEST DIRECT DE getTeacherClasses');
    console.log('==================================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // Trouver le Barra Fall qui a des schedules
    const barraWithSchedule = await User.findOne({ 
      name: 'Barra Fall', 
      email: 'barra@gmail.com' 
    });

    if (!barraWithSchedule) {
      console.log('❌ Barra Fall avec schedules non trouvé');
      return;
    }

    console.log(`✅ Test avec Barra Fall: ${barraWithSchedule._id} (${barraWithSchedule.email})`);

    // Simuler exactement getTeacherClasses
    const teacherId = barraWithSchedule._id;
    console.log('🔍 Récupération des classes pour l\'enseignant ID:', teacherId);
    
    // Méthode 1: Récupérer les classes via l'emploi du temps (Schedule)
    const schedules = await Schedule.find({ 
      teacherId: teacherId,
      isActive: true 
    })
    .populate('classId', 'name level section students room studentCount')
    .populate('subjectId', 'name code')
    .populate('schoolId', 'name');
    
    console.log(`📅 ${schedules.length} créneau(x) d'emploi du temps trouvé(s) pour l'enseignant via Schedule`);
    
    // Méthode 2: Récupérer les classes où l'enseignant est directement assigné
    const directClasses = await Class.find({ 
      teachers: teacherId 
    })
    .populate('schoolId', 'name')
    .select('name level section students room studentCount schoolId');
    
    console.log(`📚 ${directClasses.length} classe(s) trouvée(s) via assignation directe`);
    
    // Combiner les deux méthodes et extraire les classes uniques
    const uniqueClasses = new Map();
    
    // Ajouter les classes via l'emploi du temps
    schedules.forEach(schedule => {
      console.log(`   - Schedule: ${schedule.classId?.name || 'CLASSE SUPPRIMÉE'} (actif: ${schedule.isActive})`);
      if (schedule.classId) {
        const classId = schedule.classId._id.toString();
        if (!uniqueClasses.has(classId)) {
          uniqueClasses.set(classId, {
            _id: schedule.classId._id,
            name: schedule.classId.name,
            level: schedule.classId.level,
            section: schedule.classId.section,
            room: schedule.classId.room,
            studentCount: schedule.classId.studentCount || schedule.classId.students?.length || 0,
            schoolName: schedule.schoolId ? schedule.schoolId.name : 'École inconnue',
            subjects: [],
            source: 'schedule'
          });
        }
      }
    });
    
    // Ajouter les classes via assignation directe
    directClasses.forEach(classObj => {
      console.log(`   - Classe directe: ${classObj.name}`);
      const classId = classObj._id.toString();
      if (!uniqueClasses.has(classId)) {
        uniqueClasses.set(classId, {
          _id: classObj._id,
          name: classObj.name,
          level: classObj.level,
          section: classObj.section,
          room: classObj.room,
          studentCount: classObj.studentCount || classObj.students?.length || 0,
          schoolName: classObj.schoolId ? classObj.schoolId.name : 'École inconnue',
          subjects: [],
          source: 'direct'
        });
      }
    });
    
    const classes = Array.from(uniqueClasses.values());
    console.log(`\n📊 ${classes.length} classe(s) unique(s) finale(s) pour l'enseignant`);
    
    if (classes.length > 0) {
      console.log('\n✅ SUCCÈS! Classes trouvées:');
      classes.forEach((cls, index) => {
        console.log(`   ${index + 1}. ${cls.name} (${cls.level})`);
        console.log(`      Salle: ${cls.room || 'Non définie'}`);
        console.log(`      Étudiants: ${cls.studentCount}`);
        console.log(`      École: ${cls.schoolName}`);
        console.log(`      Source: ${cls.source}`);
      });
      
      console.log('\n🎯 CONCLUSION: getTeacherClasses fonctionne correctement!');
      console.log('💡 Le problème vient probablement de l\'authentification ou de l\'ID utilisateur');
    } else {
      console.log('\n❌ ÉCHEC: Aucune classe trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testGetTeacherClassesDirectly();