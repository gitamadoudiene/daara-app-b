const mongoose = require('mongoose');
const User = require('./models/User');

require('dotenv').config();

async function createParentChildRelationships() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Récupérer tous les parents et étudiants
    const parents = await User.find({ role: 'parent' });
    const students = await User.find({ role: 'student' });

    console.log(`👨‍👩‍👧‍👦 ${parents.length} parent(s) trouvé(s)`);
    console.log(`🎓 ${students.length} étudiant(s) trouvé(s)`);

    if (parents.length === 0 || students.length === 0) {
      console.log('❌ Pas assez de parents ou d\'étudiants pour créer des relations');
      return;
    }

    // 2. Créer des relations réalistes parent-enfant
    let relationshipsCreated = 0;

    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      
      // Chaque parent aura entre 1 et 3 enfants de manière aléatoire
      const numberOfChildren = Math.floor(Math.random() * 3) + 1; // Entre 1 et 3 enfants
      const availableStudents = students.filter(student => 
        !student.parentId || student.parentId.toString() === ''
      );

      if (availableStudents.length === 0) {
        console.log(`⚠️  Plus d'étudiants disponibles pour ${parent.name}`);
        break;
      }

      const childrenIds = [];
      const actualChildren = Math.min(numberOfChildren, availableStudents.length);

      for (let j = 0; j < actualChildren; j++) {
        if (availableStudents.length > 0) {
          // Sélectionner un étudiant au hasard
          const randomIndex = Math.floor(Math.random() * availableStudents.length);
          const student = availableStudents[randomIndex];
          
          // Retirer l'étudiant de la liste disponible
          availableStudents.splice(randomIndex, 1);
          
          // Ajouter l'ID de l'enfant au parent
          childrenIds.push(student._id);
          
          // Assigner le parent à l'enfant (si le modèle Student a un champ parentId)
          student.parentId = parent._id;
          await student.save();
          
          console.log(`✅ ${student.name} assigné comme enfant de ${parent.name}`);
          relationshipsCreated++;
        }
      }

      // Mettre à jour le parent avec les IDs des enfants
      parent.children = childrenIds;
      await parent.save();

      console.log(`👨‍👩‍👧‍👦 ${parent.name} a maintenant ${childrenIds.length} enfant(s)`);
    }

    // 3. Vérification des résultats
    console.log(`\n📊 Résumé des relations créées:`);
    console.log(`🔗 ${relationshipsCreated} relation(s) parent-enfant créée(s)`);

    // Afficher quelques exemples
    const parentsWithChildren = await User.find({ 
      role: 'parent', 
      children: { $exists: true, $not: { $size: 0 } } 
    }).populate('children', 'name');

    console.log(`\n👥 Exemples de familles créées:`);
    parentsWithChildren.slice(0, 5).forEach((parent, index) => {
      const childNames = parent.children.map(child => child.name).join(', ');
      console.log(`${index + 1}. ${parent.name} - ${parent.children.length} enfant(s): ${childNames}`);
    });

    // 4. Statistiques finales
    const totalParentsWithChildren = await User.countDocuments({ 
      role: 'parent', 
      children: { $exists: true, $not: { $size: 0 } } 
    });
    const totalStudentsWithParents = await User.countDocuments({ 
      role: 'student', 
      parentId: { $exists: true, $ne: null } 
    });

    console.log(`\n📈 Statistiques finales:`);
    console.log(`👨‍👩‍👧‍👦 Parents avec enfants: ${totalParentsWithChildren}/${parents.length}`);
    console.log(`🎓 Étudiants avec parents: ${totalStudentsWithParents}/${students.length}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

createParentChildRelationships();