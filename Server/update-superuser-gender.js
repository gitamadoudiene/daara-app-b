const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer les modèles
const User = require('./models/User');

async function updateSuperUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Mettre à jour le super utilisateur existant pour qu'il ait un gender (optionnel pour super_user)
    const superUser = await User.findOne({ email: 'superuser@daara.com' });
    if (superUser) {
      // Le gender n'est pas requis pour le super_user, donc on peut le laisser undefined
      console.log('✅ Super utilisateur trouvé:', {
        name: superUser.name,
        email: superUser.email,
        role: superUser.role,
        gender: superUser.gender || 'Non spécifié'
      });
    } else {
      console.log('❌ Super utilisateur non trouvé');
    }

    // Créer quelques utilisateurs de test avec le champ gender
    const testUsers = [
      {
        name: 'Parent Test Masculin',
        email: 'parent.masculin@daara.test',
        role: 'parent',
        gender: 'Masculin',
        phone: '+221 77 111 1111'
      },
      {
        name: 'Parent Test Féminin', 
        email: 'parent.feminin@daara.test',
        role: 'parent',
        gender: 'Féminin',
        phone: '+221 77 222 2222'
      },
      {
        name: 'Étudiant Test Masculin',
        email: 'etudiant.masculin@daara.test',
        role: 'student',
        gender: 'Masculin',
        phone: '+221 77 333 3333'
      },
      {
        name: 'Étudiante Test Féminin',
        email: 'etudiante.feminin@daara.test',
        role: 'student',
        gender: 'Féminin',
        phone: '+221 77 444 4444'
      }
    ];

    for (const userData of testUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const user = new User({
          ...userData,
          password: hashedPassword
        });

        await user.save();
        console.log(`✅ Utilisateur de test créé: ${userData.name} (${userData.gender})`);
      } else {
        console.log(`⚠️ Utilisateur ${userData.name} existe déjà`);
      }
    }

    // Afficher les statistiques par genre
    console.log('\n📊 Statistiques par genre:');
    
    const statsMasculin = await User.countDocuments({ gender: 'Masculin' });
    const statsFeminin = await User.countDocuments({ gender: 'Féminin' });
    const statsNoGender = await User.countDocuments({ 
      $or: [
        { gender: { $exists: false } }, 
        { gender: null },
        { gender: '' }
      ]
    });
    
    console.log(`👨 Masculin: ${statsMasculin}`);
    console.log(`👩 Féminin: ${statsFeminin}`);
    console.log(`❓ Non spécifié: ${statsNoGender}`);
    
    // Statistiques détaillées par rôle et genre
    console.log('\n📈 Répartition par rôle et genre:');
    
    const roles = ['student', 'parent', 'teacher', 'admin', 'super_user'];
    for (const role of roles) {
      const masculin = await User.countDocuments({ role, gender: 'Masculin' });
      const feminin = await User.countDocuments({ role, gender: 'Féminin' });
      const nonSpecifie = await User.countDocuments({ 
        role,
        $or: [
          { gender: { $exists: false } }, 
          { gender: null },
          { gender: '' }
        ]
      });
      
      if (masculin > 0 || feminin > 0 || nonSpecifie > 0) {
        console.log(`  ${role}: M=${masculin}, F=${feminin}, ?=${nonSpecifie}`);
      }
    }
    
    console.log('\n🎉 Mise à jour terminée !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  updateSuperUser();
}

module.exports = updateSuperUser;