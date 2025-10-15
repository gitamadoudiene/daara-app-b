const mongoose = require('mongoose');

async function addSubjectsToUserSchool() {
  try {
    console.log('=== AJOUT DES MATIÈRES À L\'ÉCOLE DE L\'UTILISATEUR ===\n');
    
    await mongoose.connect('mongodb://localhost:27017/daara_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connecté à MongoDB');
    
    const Subject = require('./models/Subject');
    const School = require('./models/School');
    
    // ID de l'école depuis le token JWT
    const schoolId = '68c7700cd9f7c4207d3c9ea6';
    
    // Vérifier que l'école existe
    const school = await School.findById(schoolId);
    if (!school) {
      console.log(`❌ École avec ID ${schoolId} non trouvée.`);
      process.exit(1);
    }
    
    console.log(`✓ École trouvée: ${school.name} (ID: ${school._id})`);
    
    // Matières par défaut
    const defaultSubjects = [
      'Mathématiques',
      'Mathematique', // Variante orthographique utilisée dans votre frontend
      'Français',
      'Histoire-Géographie',
      'Sciences',
      'Sciences Physiques',
      'Sciences de la Vie et de la Terre',
      'Anglais',
      'Arabe',
      'Philosophie',
      'Education Physique et Sportive',
      'Arts Plastiques',
      'Education Musicale',
      'Technologie',
      'Informatique'
    ];
    
    console.log(`\nAjout de ${defaultSubjects.length} matières à l'école...`);
    
    for (const subjectName of defaultSubjects) {
      const existingSubject = await Subject.findOne({ 
        name: subjectName, 
        schoolId: school._id 
      });
      
      if (!existingSubject) {
        try {
          const newSubject = new Subject({
            name: subjectName,
            code: subjectName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 10),
            description: `Matière ${subjectName}`,
            schoolId: school._id,
            status: 'Actif'
          });
          
          await newSubject.save();
          console.log(`  ✓ ${subjectName}`);
        } catch (error) {
          console.log(`  ✗ Erreur pour ${subjectName}:`, error.message);
        }
      } else {
        console.log(`  ○ ${subjectName} (déjà existante)`);
      }
    }
    
    // Vérification finale
    const allSubjects = await Subject.find({ schoolId: school._id });
    console.log(`\n=== RÉSULTAT ===`);
    console.log(`École: ${school.name} (ID: ${school._id})`);
    console.log(`Matières disponibles (${allSubjects.length}):`);
    allSubjects.forEach(subject => {
      console.log(`  - ${subject.name}`);
    });
    
    console.log(`\n✅ Prêt pour les tests Postman !`);
    console.log(`Token JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQzNDIyOWY2OTQ0ZTNmZjA4MWIzODgiLCJyb2xlIjoidGVhY2hlciIsInNjaG9vbElkIjoiNjhjNzcwMGNkOWY3YzQyMDdkM2M5ZWE2IiwiaWF0IjoxNzYwNDkwMzE4LCJleHAiOjE3NjA1NzY3MTh9.YfwqA-85aftXCNVpwnQCBjU-j-pmHAFJSfDyc_qnAL8`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addSubjectsToUserSchool();