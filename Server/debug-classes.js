// debug-classes.js
require('dotenv').config();
const mongoose = require('mongoose');
const Class = require('./models/Class');
const School = require('./models/School');

const schoolId = '68c7700cd9f7c4207d3c9ea6'; // ID de l'école "Les Pedagogues"

async function debugClasses() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connecté à MongoDB');

    // Vérifier si l'école existe
    const school = await School.findById(schoolId);
    if (!school) {
      console.error(`École non trouvée avec l'ID: ${schoolId}`);
      return;
    }
    
    console.log(`École trouvée: ${school.name}`);

    // Récupérer toutes les classes de cette école
    const classes = await Class.find({ schoolId });
    console.log(`Nombre de classes trouvées: ${classes.length}`);

    if (classes.length === 0) {
      console.log("Aucune classe trouvée pour cette école. Création d'une classe de test...");
      
      // Créer une classe de test
      const testClass = new Class({
        name: "Classe de Test",
        level: "Niveau Test",
        section: "Section Test",
        schoolId,
        academicYear: "2025-2026",
        subjects: ["Français", "Mathématiques"]
      });

      await testClass.save();
      console.log(`Classe de test créée avec l'ID: ${testClass._id}`);
    } else {
      console.log('Liste des classes:');
      classes.forEach(cls => {
        console.log(`- ID: ${cls._id}, Nom: ${cls.name}, Niveau: ${cls.level}`);
      });
    }

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnexion de MongoDB');
  }
}

debugClasses();
