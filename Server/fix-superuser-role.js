const mongoose = require('mongoose');
const User = require('./models/User');

require('dotenv').config();

async function fixSuperUserRole() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Identifier le Super Utilisateur
    const superUsers = await User.find({ role: 'super_user' });
    console.log(`🔧 ${superUsers.length} Super Utilisateur(s) trouvé(s)`);

    if (superUsers.length === 0) {
      console.log('❌ Aucun Super Utilisateur trouvé');
      return;
    }

    // 2. Retirer l'assignation d'école pour les Super Utilisateurs
    console.log('\n🌟 Correction du rôle Super Utilisateur...');
    
    for (const superUser of superUsers) {
      console.log(`\nTraitement de: ${superUser.name} (${superUser.email})`);
      console.log(`  - École actuelle: ${superUser.schoolId ? 'ASSIGNÉE' : 'NON ASSIGNÉE'}`);
      
      // Retirer l'assignation d'école
      if (superUser.schoolId) {
        console.log(`  - Suppression de l'assignation d'école...`);
        superUser.schoolId = undefined;
      }
      
      // S'assurer qu'il n'a pas d'autres restrictions
      superUser.children = undefined; // Pas d'enfants pour un super admin
      superUser.class = undefined;    // Pas de classe
      superUser.classes = undefined;  // Pas de classes enseignées
      superUser.subjects = undefined; // Pas de matières
      
      await superUser.save();
      console.log(`✅ ${superUser.name} est maintenant un vrai Super Utilisateur global`);
      console.log(`  - Accès: GLOBAL (toutes les écoles)`);
      console.log(`  - Restrictions: AUCUNE`);
    }

    // 3. Vérification des autres rôles et leurs écoles
    console.log('\n📊 Vérification des assignations d\'école par rôle:');
    
    const roleStats = {
      'super_user': await User.countDocuments({ role: 'super_user', schoolId: { $exists: true, $ne: null } }),
      'admin': await User.countDocuments({ role: 'admin', schoolId: { $exists: true, $ne: null } }),
      'teacher': await User.countDocuments({ role: 'teacher', schoolId: { $exists: true, $ne: null } }),
      'parent': await User.countDocuments({ role: 'parent', schoolId: { $exists: true, $ne: null } }),
      'student': await User.countDocuments({ role: 'student', schoolId: { $exists: true, $ne: null } })
    };

    console.log(`🔧 Super Users avec école: ${roleStats.super_user} (devrait être 0)`);
    console.log(`👔 Admins avec école: ${roleStats.admin}`);
    console.log(`👩‍🏫 Enseignants avec école: ${roleStats.teacher}`);
    console.log(`👨‍👩‍👧‍👦 Parents avec école: ${roleStats.parent}`);
    console.log(`🎓 Étudiants avec école: ${roleStats.student}`);

    // 4. Vérification finale et exemples
    console.log('\n🌟 Status final des Super Utilisateurs:');
    const updatedSuperUsers = await User.find({ role: 'super_user' });
    
    updatedSuperUsers.forEach((superUser, i) => {
      console.log(`${i+1}. ${superUser.name}:`);
      console.log(`   - Email: ${superUser.email}`);
      console.log(`   - École: ${superUser.schoolId ? 'ERREUR - ENCORE ASSIGNÉE!' : '✅ GLOBAL'}`);
      console.log(`   - Accès: ${superUser.schoolId ? 'Restreint à une école' : 'TOUTES LES ÉCOLES'}`);
    });

    console.log('\n💡 Permissions du Super Utilisateur:');
    console.log('✅ Peut voir tous les utilisateurs de toutes les écoles');
    console.log('✅ Peut voir tous les étudiants de toutes les écoles');
    console.log('✅ Peut voir tous les parents de toutes les écoles');
    console.log('✅ Peut voir toutes les notes de toutes les écoles');
    console.log('✅ Peut créer/modifier/supprimer dans toutes les écoles');
    console.log('✅ Accès administrateur global sans restrictions');

    console.log('\n🔒 Permissions des autres rôles (à implémenter):');
    console.log('🏫 Admin: Accès uniquement à son école assignée');
    console.log('🏫 Enseignant: Accès uniquement à son école assignée');  
    console.log('🏫 Parent: Accès uniquement à son école et aux enfants de son école');
    console.log('🏫 Étudiant: Accès uniquement à son école et ses propres données');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

fixSuperUserRole();