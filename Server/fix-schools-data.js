const mongoose = require('mongoose');
const School = require('./models/School');
const User = require('./models/User');

require('dotenv').config();

async function fixSchoolsData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Créer quelques écoles de test
    console.log('\n🏫 Création d\'écoles de test...');
    
    const schoolsToCreate = [
      {
        name: 'École Primaire Daara',
        address: 'Dakar, Sénégal',
        phone: '+221 77 123 45 67',
        email: 'contact@daara-primaire.sn',
        director: 'Amadou Diallo',
        createdYear: '2020',
        type: 'Public',
        status: 'Actif'
      },
      {
        name: 'Lycée Technique Daara',
        address: 'Thiès, Sénégal',
        phone: '+221 77 234 56 78',
        email: 'info@lycee-daara.sn',
        director: 'Fatou Sow',
        createdYear: '2018',
        type: 'Privé',
        status: 'Actif'
      },
      {
        name: 'Université Daara',
        address: 'Saint-Louis, Sénégal',
        phone: '+221 77 345 67 89',
        email: 'admin@universite-daara.sn',
        director: 'Cheikh Ndiaye',
        createdYear: '2015',
        type: 'Semi-public',
        status: 'Actif'
      }
    ];

    const createdSchools = [];
    for (const schoolData of schoolsToCreate) {
      // Vérifier si l'école existe déjà
      const existingSchool = await School.findOne({ name: schoolData.name });
      if (!existingSchool) {
        const school = new School(schoolData);
        const savedSchool = await school.save();
        createdSchools.push(savedSchool);
        console.log(`✅ École créée: ${savedSchool.name} (ID: ${savedSchool._id})`);
      } else {
        console.log(`⚠️  École existe déjà: ${existingSchool.name}`);
        createdSchools.push(existingSchool);
      }
    }

    // 2. Nettoyer les utilisateurs avec des schoolId vides ou invalides
    console.log('\n🧹 Nettoyage des données utilisateur...');
    
    // D'abord, mettre à jour tous les schoolId vides à null
    const emptySchoolIdUpdate = await User.updateMany(
      { schoolId: "" },
      { $unset: { schoolId: 1 } }
    );
    console.log(`🔧 ${emptySchoolIdUpdate.modifiedCount} utilisateur(s) avec schoolId vide nettoyés`);
    
    // Ensuite, trouver tous les utilisateurs sans schoolId
    const usersToFix = await User.find({
      $or: [
        { schoolId: null },
        { schoolId: { $exists: false } }
      ]
    });

    console.log(`📋 ${usersToFix.length} utilisateur(s) à assigner à une école`);

    // Assigner aléatoirement une école aux utilisateurs sans école
    if (createdSchools.length > 0 && usersToFix.length > 0) {
      for (const user of usersToFix) {
        const randomSchool = createdSchools[Math.floor(Math.random() * createdSchools.length)];
        user.schoolId = randomSchool._id;
        await user.save();
        console.log(`✅ Utilisateur ${user.name} assigné à l'école ${randomSchool.name}`);
      }
    }

    // 3. Vérifier le résultat final
    console.log('\n📊 Résultat final:');
    const totalSchools = await School.countDocuments();
    const totalUsers = await User.countDocuments();
    const usersWithSchool = await User.countDocuments({ 
      schoolId: { $exists: true, $ne: null, $ne: "" } 
    });

    console.log(`🏫 Nombre d'écoles: ${totalSchools}`);
    console.log(`👥 Nombre total d'utilisateurs: ${totalUsers}`);
    console.log(`✅ Utilisateurs avec école assignée: ${usersWithSchool}`);
    console.log(`❌ Utilisateurs sans école: ${totalUsers - usersWithSchool}`);

    // 4. Test de l'API populate
    console.log('\n🔍 Test du populate...');
    const usersWithPopulatedSchool = await User.find({ 
      schoolId: { $exists: true, $ne: null, $ne: "" } 
    })
    .populate('schoolId', 'name')
    .limit(3);

    console.log('Échantillon d\'utilisateurs avec écoles populées:');
    usersWithPopulatedSchool.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - École: ${user.schoolId?.name} (ID: ${user.schoolId?._id})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

fixSchoolsData();