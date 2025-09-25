const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à la base de données
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB réussie pour la migration');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Script de migration pour ajouter teacherIds et timestamps aux classes existantes
const migrateClassesTeachersAndDates = async () => {
  try {
    console.log('🚀 Début de la migration des professeurs et dates pour les classes...');
    
    // Connexion à la base de données
    await connectDB();
    
    // Référence à la collection classes
    const db = mongoose.connection.db;
    const classCollection = db.collection('classes');
    
    // Compter les classes avant migration
    const totalClasses = await classCollection.countDocuments();
    console.log(`📊 Nombre total de classes à migrer: ${totalClasses}`);
    
    if (totalClasses === 0) {
      console.log('ℹ️ Aucune classe à migrer');
      return;
    }
    
    // Date actuelle pour les classes qui n'ont pas de timestamps
    const currentDate = new Date();
    
    // Mettre à jour toutes les classes qui n'ont pas les champs teacherIds ou timestamps
    const updateResult = await classCollection.updateMany(
      {
        $or: [
          { teacherIds: { $exists: false } },
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      {
        $set: {
          updatedAt: currentDate
        },
        $setOnInsert: {
          teacherIds: [],
          createdAt: currentDate
        }
      },
      { upsert: false }
    );
    
    // Mise à jour séparée pour s'assurer que les champs manquants sont ajoutés
    await classCollection.updateMany(
      { teacherIds: { $exists: false } },
      { $set: { teacherIds: [] } }
    );
    
    await classCollection.updateMany(
      { createdAt: { $exists: false } },
      { $set: { createdAt: currentDate } }
    );
    
    console.log(`✅ Migration terminée avec succès!`);
    console.log(`📝 Classes mises à jour: ${updateResult.modifiedCount}`);
    console.log(`📈 Classes correspondantes: ${updateResult.matchedCount}`);
    
    // Vérification post-migration : compter les classes avec les nouveaux champs
    const classesWithTeacherIds = await classCollection.countDocuments({
      teacherIds: { $exists: true }
    });
    
    const classesWithTimestamps = await classCollection.countDocuments({
      createdAt: { $exists: true },
      updatedAt: { $exists: true }
    });
    
    console.log(`✅ Vérification teacherIds: ${classesWithTeacherIds} classes ont le champ teacherIds`);
    console.log(`✅ Vérification timestamps: ${classesWithTimestamps} classes ont les timestamps`);
    
    // Afficher quelques exemples de classes mises à jour
    const sampleClasses = await classCollection.find({}).limit(3).toArray();
    console.log('📋 Exemples de classes après migration:');
    sampleClasses.forEach((cls, index) => {
      console.log(`   ${index + 1}. ${cls.name} - teacherIds: [${cls.teacherIds?.length || 0}], créée: ${cls.createdAt ? new Date(cls.createdAt).toLocaleDateString('fr-FR') : 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Fonction utilitaire pour assigner des professeurs aux classes qui n'en ont pas (optionnel)
const assignRandomTeachersToClasses = async () => {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const classCollection = db.collection('classes');
    const userCollection = db.collection('users');
    
    // Récupérer tous les enseignants
    const teachers = await userCollection.find({ role: 'teacher' }).toArray();
    console.log(`👨‍🏫 ${teachers.length} enseignants trouvés`);
    
    if (teachers.length === 0) {
      console.log('⚠️ Aucun enseignant trouvé pour l\'assignation');
      return;
    }
    
    // Récupérer les classes sans professeur assigné
    const classesWithoutTeacher = await classCollection.find({
      $or: [
        { teacherIds: { $size: 0 } },
        { teacherIds: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`📚 ${classesWithoutTeacher.length} classes sans professeur assigné`);
    
    // Assigner aléatoirement un professeur à chaque classe
    for (const classItem of classesWithoutTeacher) {
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      await classCollection.updateOne(
        { _id: classItem._id },
        { $set: { teacherIds: [randomTeacher._id] } }
      );
      console.log(`✅ Professeur ${randomTeacher.firstName} ${randomTeacher.lastName} assigné à la classe ${classItem.name}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation des professeurs:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Exécuter la migration
if (require.main === module) {
  console.log('🔧 Script de migration des classes - Ajout teacherIds et timestamps');
  console.log('================================================================');
  
  // Demander à l'utilisateur s'il veut aussi assigner des professeurs
  const args = process.argv.slice(2);
  if (args.includes('--assign-teachers')) {
    console.log('🎯 Mode: Migration + Assignation de professeurs');
    migrateClassesTeachersAndDates().then(() => {
      console.log('---');
      assignRandomTeachersToClasses();
    });
  } else {
    console.log('🎯 Mode: Migration seulement (utilisez --assign-teachers pour assigner des professeurs)');
    migrateClassesTeachersAndDates();
  }
}

module.exports = { migrateClassesTeachersAndDates, assignRandomTeachersToClasses };