const mongoose = require('mongoose');

async function createSchoolAndSubjects() {
  try {
    console.log('=== CRÉATION D\'UNE ÉCOLE ET MATIÈRES PAR DÉFAUT ===\n');
    
    await mongoose.connect('mongodb://localhost:27017/daara_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connecté à MongoDB');
    
    const School = require('./models/School');
    const Subject = require('./models/Subject');
    
    // Créer une école par défaut
    let school = await School.findOne({ name: 'École Daara' });
    
    if (!school) {
      school = new School({
        name: 'École Daara',
        address: 'Dakar, Sénégal',
        phone: '+221 33 xxx xx xx',
        email: 'contact@ecole-daara.sn',
        director: 'Directeur Principal',
        createdYear: '2025',
        status: 'Actif',
        type: 'Privé'
      });
      await school.save();
      console.log(`✓ École créée: ${school.name} (ID: ${school._id})`);
    } else {
      console.log(`○ École existante: ${school.name} (ID: ${school._id})`);
    }
    
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
    console.log(`École: ${school.name}`);
    console.log(`Matières disponibles (${allSubjects.length}):`);
    allSubjects.forEach(subject => {
      console.log(`  - ${subject.name}`);
    });
    
    console.log(`\n✅ École ID: ${school._id}`);
    console.log(`Vous pouvez maintenant utiliser cette école pour vos tests.`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createSchoolAndSubjects();