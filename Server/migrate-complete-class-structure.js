const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à la base de données
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB réussie pour la migration complète');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Script de migration complète pour restructurer les classes
const migrateCompleteClassStructure = async () => {
  try {
    console.log('🚀 Début de la migration complète de la structure des classes...');
    console.log('📋 Nouveaux champs à ajouter:');
    console.log('   - teachers: tous les professeurs donnant cours');
    console.log('   - resTeacher: professeur principal');
    console.log('   - students: liste des élèves');
    console.log('   - parents: parents des élèves');
    console.log('   - anneeScolaire: année scolaire formatée');
    console.log('   - emploiDuTemps: référence emploi du temps');
    
    // Connexion à la base de données
    await connectDB();
    
    // Référence aux collections
    const db = mongoose.connection.db;
    const classCollection = db.collection('classes');
    const userCollection = db.collection('users');
    
    // Compter les classes avant migration
    const totalClasses = await classCollection.countDocuments();
    console.log(`📊 Nombre total de classes à migrer: ${totalClasses}`);
    
    if (totalClasses === 0) {
      console.log('ℹ️ Aucune classe à migrer');
      return;
    }
    
    // Date actuelle pour les timestamps
    const currentDate = new Date();
    
    // Obtenir l'année scolaire actuelle (ex: 2024-2025)
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    
    console.log(`📅 Année scolaire par défaut: ${academicYear}`);
    
    // 1. Migration des champs de base
    console.log('\n🔄 Étape 1: Migration des champs de base...');
    
    const basicMigration = await classCollection.updateMany(
      {},
      {
        $set: {
          // Nouveaux champs vides par défaut
          teachers: [],
          resTeacher: null,
          students: [],
          parents: [],
          anneeScolaire: academicYear,
          emploiDuTemps: null,
          
          // Timestamps si manquants
          updatedAt: currentDate
        },
        $setOnInsert: {
          createdAt: currentDate
        }
      }
    );
    
    console.log(`✅ ${basicMigration.modifiedCount} classes mises à jour avec les champs de base`);
    
    // 2. Migration des professeurs (teacherIds → teachers et resTeacher)
    console.log('\n🔄 Étape 2: Migration des professeurs...');
    
    const classesWithTeachers = await classCollection.find({
      teacherIds: { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`👨‍🏫 ${classesWithTeachers.length} classes avec des professeurs à migrer`);
    
    for (const classItem of classesWithTeachers) {
      if (classItem.teacherIds && classItem.teacherIds.length > 0) {
        // Le premier professeur devient le professeur principal
        const resTeacher = classItem.teacherIds[0];
        // Tous les professeurs vont dans teachers
        const teachers = classItem.teacherIds;
        
        await classCollection.updateOne(
          { _id: classItem._id },
          {
            $set: {
              teachers: teachers,
              resTeacher: resTeacher
            }
          }
        );
        
        console.log(`✅ Classe ${classItem.name}: ${teachers.length} prof(s) → Prof principal: ${resTeacher}`);
      }
    }
    
    // 3. Migration des élèves (rechercher les étudiants assignés à chaque classe)
    console.log('\n🔄 Étape 3: Migration des élèves...');
    
    const allClasses = await classCollection.find({}).toArray();
    let totalStudentsAssigned = 0;
    
    for (const classItem of allClasses) {
      // Rechercher les élèves assignés à cette classe
      const studentsInClass = await userCollection.find({
        role: 'student',
        classId: classItem._id
      }).toArray();
      
      if (studentsInClass.length > 0) {
        const studentIds = studentsInClass.map(student => student._id);
        
        await classCollection.updateOne(
          { _id: classItem._id },
          {
            $set: {
              students: studentIds,
              studentCount: studentsInClass.length
            }
          }
        );
        
        totalStudentsAssigned += studentsInClass.length;
        console.log(`✅ Classe ${classItem.name}: ${studentsInClass.length} élève(s) assigné(s)`);
      }
    }
    
    console.log(`📊 Total des élèves assignés: ${totalStudentsAssigned}`);
    
    // 4. Migration des parents (rechercher les parents des élèves de chaque classe)
    console.log('\n🔄 Étape 4: Migration des parents...');
    
    let totalParentsAssigned = 0;
    
    for (const classItem of allClasses) {
      // Récupérer la classe mise à jour avec ses élèves
      const updatedClass = await classCollection.findOne({ _id: classItem._id });
      
      if (updatedClass.students && updatedClass.students.length > 0) {
        // Rechercher les parents de ces élèves
        const parentsOfStudents = await userCollection.find({
          role: 'parent',
          childrenIds: { $in: updatedClass.students }
        }).toArray();
        
        if (parentsOfStudents.length > 0) {
          const parentIds = parentsOfStudents.map(parent => parent._id);
          
          await classCollection.updateOne(
            { _id: classItem._id },
            {
              $set: {
                parents: parentIds
              }
            }
          );
          
          totalParentsAssigned += parentsOfStudents.length;
          console.log(`✅ Classe ${classItem.name}: ${parentsOfStudents.length} parent(s) lié(s)`);
        }
      }
    }
    
    console.log(`👨‍👩‍👧‍👦 Total des parents liés: ${totalParentsAssigned}`);
    
    // 5. Migration du champ academicYear → anneeScolaire
    console.log('\n🔄 Étape 5: Conversion academicYear → anneeScolaire...');
    
    const academicYearMigration = await classCollection.updateMany(
      {
        academicYear: { $exists: true },
        $or: [
          { anneeScolaire: { $exists: false } },
          { anneeScolaire: academicYear } // Remplacer la valeur par défaut
        ]
      },
      [
        {
          $set: {
            anneeScolaire: {
              $cond: {
                if: { $regexMatch: { input: "$academicYear", regex: /^\d{4}-\d{4}$/ } },
                then: "$academicYear",
                else: academicYear
              }
            }
          }
        }
      ]
    );
    
    console.log(`✅ ${academicYearMigration.modifiedCount} classes: academicYear → anneeScolaire`);
    
    // 6. Vérifications post-migration
    console.log('\n📋 Vérifications post-migration...');
    
    const finalStats = await classCollection.aggregate([
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          classesWithTeachers: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ["$teachers", []] } }, 0] }, 1, 0]
            }
          },
          classesWithResTeacher: {
            $sum: {
              $cond: [{ $ne: ["$resTeacher", null] }, 1, 0]
            }
          },
          classesWithStudents: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ["$students", []] } }, 0] }, 1, 0]
            }
          },
          classesWithParents: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ["$parents", []] } }, 0] }, 1, 0]
            }
          },
          totalStudents: { $sum: { $size: { $ifNull: ["$students", []] } } },
          totalParents: { $sum: { $size: { $ifNull: ["$parents", []] } } }
        }
      }
    ]).toArray();
    
    if (finalStats.length > 0) {
      const stats = finalStats[0];
      console.log(`✅ Migration terminée avec succès!`);
      console.log(`📊 Classes totales: ${stats.totalClasses}`);
      console.log(`👨‍🏫 Classes avec professeurs: ${stats.classesWithTeachers}`);
      console.log(`🎯 Classes avec prof principal: ${stats.classesWithResTeacher}`);
      console.log(`👨‍🎓 Classes avec élèves: ${stats.classesWithStudents}`);
      console.log(`👨‍👩‍👧‍👦 Classes avec parents: ${stats.classesWithParents}`);
      console.log(`📈 Total élèves: ${stats.totalStudents}`);
      console.log(`📈 Total parents: ${stats.totalParents}`);
    }
    
    // Exemples de classes migrées
    console.log('\n📋 Exemples de classes après migration:');
    const sampleClasses = await classCollection.find({}).limit(3).toArray();
    sampleClasses.forEach((cls, index) => {
      console.log(`   ${index + 1}. ${cls.name} (${cls.anneeScolaire})`);
      console.log(`      - Professeurs: ${cls.teachers?.length || 0}`);
      console.log(`      - Prof principal: ${cls.resTeacher ? 'Oui' : 'Non'}`);
      console.log(`      - Élèves: ${cls.students?.length || 0}`);
      console.log(`      - Parents: ${cls.parents?.length || 0}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration complète:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
  }
};

// Fonction pour nettoyer les anciens champs (optionnel)
const cleanupOldFields = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const classCollection = db.collection('classes');
    
    console.log('🧹 Nettoyage des anciens champs...');
    
    const cleanup = await classCollection.updateMany(
      {},
      {
        $unset: {
          teacherIds: "",
          academicYear: ""
        }
      }
    );
    
    console.log(`✅ ${cleanup.modifiedCount} classes nettoyées`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Exécuter la migration
if (require.main === module) {
  console.log('🔧 Script de migration complète des classes');
  console.log('==========================================');
  
  const args = process.argv.slice(2);
  if (args.includes('--cleanup')) {
    console.log('🧹 Mode: Migration + Nettoyage des anciens champs');
    migrateCompleteClassStructure().then(() => {
      console.log('---');
      cleanupOldFields();
    });
  } else {
    console.log('🎯 Mode: Migration complète (utilisez --cleanup pour nettoyer les anciens champs)');
    migrateCompleteClassStructure();
  }
}

module.exports = { migrateCompleteClassStructure, cleanupOldFields };