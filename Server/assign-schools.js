const mongoose = require('mongoose');
const School = require('./models/School');

require('dotenv').config();

async function assignSchoolsToUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // Récupérer les écoles disponibles
    const schools = await School.find();
    console.log(`🏫 ${schools.length} école(s) disponible(s)`);

    if (schools.length === 0) {
      console.log('❌ Aucune école disponible pour assigner aux utilisateurs');
      return;
    }

    // Utiliser directement la collection MongoDB pour éviter l'erreur de cast
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. Nettoyer les schoolId vides (string vide)
    const cleanEmptyResult = await usersCollection.updateMany(
      { schoolId: "" },
      { $unset: { schoolId: 1 } }
    );
    console.log(`🔧 ${cleanEmptyResult.modifiedCount} utilisateur(s) avec schoolId vide nettoyés`);

    // 2. Compter les utilisateurs sans école
    const usersWithoutSchool = await usersCollection.countDocuments({
      $or: [
        { schoolId: { $exists: false } },
        { schoolId: null }
      ]
    });
    console.log(`📋 ${usersWithoutSchool} utilisateur(s) sans école`);

    // 3. Assigner une école aléatoire à chaque utilisateur sans école
    const usersToUpdate = await usersCollection.find({
      $or: [
        { schoolId: { $exists: false } },
        { schoolId: null }
      ]
    }).toArray();

    let updatedCount = 0;
    for (const user of usersToUpdate) {
      const randomSchool = schools[Math.floor(Math.random() * schools.length)];
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { schoolId: new mongoose.Types.ObjectId(randomSchool._id) } }
      );
      updatedCount++;
      console.log(`✅ ${user.name} assigné à ${randomSchool.name}`);
    }

    console.log(`\n🎉 ${updatedCount} utilisateur(s) assigné(s) à des écoles`);

    // 4. Vérification finale
    const finalUsersWithSchool = await usersCollection.countDocuments({
      schoolId: { $exists: true, $ne: null }
    });
    const totalUsers = await usersCollection.countDocuments();

    console.log(`\n📊 Résultat final:`);
    console.log(`👥 Total utilisateurs: ${totalUsers}`);
    console.log(`✅ Utilisateurs avec école: ${finalUsersWithSchool}`);
    console.log(`❌ Utilisateurs sans école: ${totalUsers - finalUsersWithSchool}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

assignSchoolsToUsers();