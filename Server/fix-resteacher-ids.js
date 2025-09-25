const mongoose = require('mongoose');
const Class = require('./models/Class');
const User = require('./models/User'); // Ajouter le modèle User
require('dotenv').config();

async function fixResTeacherIds() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('✅ Connexion à MongoDB réussie');
    
    // Trouver toutes les classes avec resTeacher défini
    const classes = await Class.find({ resTeacher: { $ne: null } });
    console.log(`📚 ${classes.length} classes avec resTeacher trouvées`);
    
    let fixedCount = 0;
    
    for (const cls of classes) {
      const currentResTeacher = cls.resTeacher;
      
      // Vérifier si c'est déjà un ObjectId valide
      if (mongoose.Types.ObjectId.isValid(currentResTeacher)) {
        try {
          // Tenter de créer un ObjectId pour voir si c'est valide
          const objectId = new mongoose.Types.ObjectId(currentResTeacher);
          
          // Mettre à jour avec le bon type
          await Class.findByIdAndUpdate(
            cls._id,
            { resTeacher: objectId },
            { new: true }
          );
          
          console.log(`✅ Fixé: ${cls.name} - resTeacher: ${currentResTeacher}`);
          fixedCount++;
          
        } catch (error) {
          console.log(`❌ Erreur pour ${cls.name}: ${error.message}`);
        }
      } else {
        console.log(`⚠️ ID invalide pour ${cls.name}: ${currentResTeacher}`);
      }
    }
    
    console.log(`\n🎯 Résultat: ${fixedCount} classes corrigées`);
    
    // Vérifier le résultat
    const verifyClass = await Class.findOne({ name: 'Terminale SA' })
      .populate('resTeacher', 'firstName lastName name email');
    
    if (verifyClass && verifyClass.resTeacher) {
      console.log(`\n✅ Vérification - Terminale SA:`);
      console.log(`   - resTeacher ID: ${verifyClass.resTeacher._id}`);
      console.log(`   - resTeacher name: ${verifyClass.resTeacher.name || 'undefined'}`);
      console.log(`   - resTeacher firstName: ${verifyClass.resTeacher.firstName || 'undefined'}`);
      console.log(`   - resTeacher lastName: ${verifyClass.resTeacher.lastName || 'undefined'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixResTeacherIds();