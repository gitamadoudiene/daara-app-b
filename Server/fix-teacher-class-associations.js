const mongoose = require('mongoose');
const Schedule = require('./models/Schedule');
const Class = require('./models/Class');
const User = require('./models/User');

async function fixTeacherClassAssociations() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://localhost:27017/daara-school-management');
    console.log('✅ Connexion à MongoDB réussie\n');

    // Récupérer tous les créneaux d'emploi du temps actifs
    const schedules = await Schedule.find({ isActive: true })
      .populate('teacherId', 'name email')
      .populate('classId', 'name level');

    console.log(`📅 ${schedules.length} créneaux d'emploi du temps actifs trouvés\n`);

    const associations = new Map(); // teacherId -> Set of classIds

    // Analyser tous les créneaux pour identifier les associations enseignant-classe
    schedules.forEach(schedule => {
      if (schedule.teacherId && schedule.classId) {
        const teacherId = schedule.teacherId._id.toString();
        const classId = schedule.classId._id.toString();
        
        if (!associations.has(teacherId)) {
          associations.set(teacherId, new Set());
        }
        associations.get(teacherId).add(classId);
      }
    });

    console.log(`👨‍🏫 ${associations.size} enseignants avec des créneaux trouvés\n`);

    let totalUpdates = 0;

    // Pour chaque enseignant, mettre à jour ses classes
    for (const [teacherId, classIds] of associations) {
      const teacher = await User.findById(teacherId);
      if (!teacher) continue;

      console.log(`🔄 Traitement de ${teacher.name} (${teacher.email})`);
      console.log(`   Classes via emploi du temps: ${Array.from(classIds).length}`);

      // Pour chaque classe de cet enseignant
      for (const classId of classIds) {
        const classObj = await Class.findById(classId);
        if (!classObj) continue;

        // Vérifier si l'enseignant n'est pas déjà dans la liste
        const isAlreadyAssigned = classObj.teachers && 
          classObj.teachers.some(id => id.toString() === teacherId);

        if (!isAlreadyAssigned) {
          // Ajouter l'enseignant à la classe
          await Class.findByIdAndUpdate(
            classId,
            { 
              $addToSet: { 
                teachers: new mongoose.Types.ObjectId(teacherId) 
              } 
            }
          );
          
          console.log(`   ✅ Ajouté à la classe: ${classObj.name}`);
          totalUpdates++;
        } else {
          console.log(`   ℹ️ Déjà assigné à: ${classObj.name}`);
        }
      }
      console.log('');
    }

    console.log(`\n🎉 Traitement terminé!`);
    console.log(`📊 ${totalUpdates} nouvelles associations enseignant-classe créées`);

    // Vérification finale: afficher le résumé des associations
    console.log('\n📋 RÉSUMÉ DES ASSOCIATIONS:');
    
    for (const [teacherId, classIds] of associations) {
      const teacher = await User.findById(teacherId);
      if (!teacher) continue;

      console.log(`\n👨‍🏫 ${teacher.name}:`);
      for (const classId of classIds) {
        const classObj = await Class.findById(classId);
        if (classObj) {
          console.log(`   📚 ${classObj.name} (${classObj.level})`);
        }
      }
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
    mongoose.disconnect();
  }
}

fixTeacherClassAssociations().catch(console.error);