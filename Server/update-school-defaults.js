const mongoose = require('mongoose');
const School = require('./models/School');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://amadoudiene20:4uLa5_zVAZmcG.H@cluster0.yyqsw.mongodb.net/daaraappbd';
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connexion à la base de données établie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
};

const updateSchoolDefaults = async () => {
  console.log('🔧 MISE À JOUR DES PARAMÈTRES PAR DÉFAUT DES ÉCOLES');
  console.log('='.repeat(50));
  
  try {
    // Récupérer toutes les écoles
    const schools = await School.find({});
    console.log(`📚 ${schools.length} école(s) trouvée(s)`);
    
    for (const school of schools) {
      console.log(`\n🏫 Mise à jour de l'école: ${school.name}`);
      console.log(`   ID: ${school._id}`);
      
      // Vérifier si les paramètres par défaut existent déjà
      const hasDefaults = school.defaultSemester !== undefined && school.defaultAcademicYear !== undefined;
      
      if (hasDefaults) {
        console.log(`   ✅ Paramètres déjà définis: Semestre ${school.defaultSemester}, Année ${school.defaultAcademicYear}`);
      } else {
        // Ajouter les paramètres par défaut
        const updateData = {
          defaultSemester: 2, // 2ème semestre par défaut
          defaultAcademicYear: '2025-2026'
        };
        
        const updatedSchool = await School.findByIdAndUpdate(
          school._id,
          updateData,
          { new: true }
        );
        
        console.log(`   ✅ Paramètres mis à jour: Semestre ${updatedSchool.defaultSemester}, Année ${updatedSchool.defaultAcademicYear}`);
      }
    }
    
    console.log('\n🎉 Mise à jour terminée avec succès !');
    
    // Vérification finale
    console.log('\n📋 VÉRIFICATION FINALE:');
    console.log('-'.repeat(25));
    const updatedSchools = await School.find({});
    updatedSchools.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name}`);
      console.log(`   Semestre par défaut: ${school.defaultSemester}`);
      console.log(`   Année académique: ${school.defaultAcademicYear}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
};

const main = async () => {
  await connectDB();
  await updateSchoolDefaults();
  await mongoose.disconnect();
  console.log('\n🔚 Connexion fermée');
};

main();