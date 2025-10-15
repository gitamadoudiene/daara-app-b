const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connecté à MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    return false;
  }
}

async function loadModels() {
  try {
    // Charger les modèles
    const Subject = require('./models/Subject');
    const School = require('./models/School');
    console.log('✓ Modèles chargés');
    return { Subject, School };
  } catch (error) {
    console.error('❌ Erreur lors du chargement des modèles:', error.message);
    return null;
  }
}

// Matières par défaut pour le système scolaire sénégalais
const defaultSubjects = [
  'Mathématiques',
  'Mathematique', // Variante orthographique
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

async function addDefaultSubjects() {
  try {
    console.log('=== AJOUT DES MATIÈRES PAR DÉFAUT ===\n');
    
    // Connexion à la base de données
    const connected = await connectDB();
    if (!connected) {
      console.error('Impossible de se connecter à la base de données');
      process.exit(1);
    }
    
    // Charger les modèles
    const models = await loadModels();
    if (!models) {
      console.error('Impossible de charger les modèles');
      process.exit(1);
    }
    
    const { Subject, School } = models;
    
    // Trouver toutes les écoles
    const schools = await School.find({});
    console.log(`${schools.length} école(s) trouvée(s)\n`);
    
    if (schools.length === 0) {
      console.log('❌ Aucune école trouvée dans la base de données');
      process.exit(1);
    }
    
    for (const school of schools) {
      console.log(`Traitement de l'école: ${school.name} (ID: ${school._id})`);
      
      // Vérifier les matières existantes pour cette école
      const existingSubjects = await Subject.find({ schoolId: school._id });
      console.log(`  Matières existantes: ${existingSubjects.length}`);
      
      for (const subjectName of defaultSubjects) {
        // Vérifier si la matière existe déjà
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
            console.log(`  ✓ Matière ajoutée: ${subjectName}`);
          } catch (error) {
            console.log(`  ✗ Erreur lors de l'ajout de ${subjectName}:`, error.message);
          }
        } else {
          console.log(`  ○ Matière déjà existante: ${subjectName}`);
        }
      }
      console.log(''); // Ligne vide
    }
    
    console.log('=== VÉRIFICATION FINALE ===\n');
    
    // Afficher toutes les matières par école
    for (const school of schools) {
      const subjects = await Subject.find({ schoolId: school._id });
      console.log(`École: ${school.name}`);
      console.log(`Matières (${subjects.length}):`, subjects.map(s => s.name).join(', '));
      console.log('');
    }
    
    console.log('✅ Terminé avec succès !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addDefaultSubjects();