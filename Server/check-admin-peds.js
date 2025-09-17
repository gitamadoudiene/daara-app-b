const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const User = require('./models/User');

async function checkAdminPeds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Chercher l'utilisateur adminpeds@lespedagogues.com
    const admin = await User.findOne({ email: 'adminpeds@lespedagogues.com' }).populate('schoolId');
    
    if (!admin) {
      console.error('❌ Utilisateur adminpeds@lespedagogues.com non trouvé');
    } else {
      console.log('✅ Utilisateur admin trouvé:');
      console.log(`   - ID: ${admin._id}`);
      console.log(`   - Nom: ${admin.name}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Rôle: ${admin.role}`);
      console.log(`   - schoolId: ${admin.schoolId ? admin.schoolId._id : 'ABSENT'}`);
      if (admin.schoolId) {
        console.log(`   - École: ${admin.schoolId.name}`);
      } else {
        console.log('⚠️  Cet admin n\'a pas d\'école assignée !');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

checkAdminPeds();