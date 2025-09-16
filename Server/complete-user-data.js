const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School');

require('dotenv').config();

async function completeUserData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // 1. Compléter les genres manquants pour les parents
    console.log('\n👨‍👩‍👧‍👦 Correction des genres manquants pour les parents...');
    const parentsWithoutGender = await User.find({ role: 'parent', $or: [{ gender: { $exists: false } }, { gender: '' }] });
    
    for (const parent of parentsWithoutGender) {
      parent.gender = Math.random() > 0.5 ? 'Masculin' : 'Féminin';
      await parent.save();
      console.log(`✅ Genre "${parent.gender}" assigné à ${parent.name}`);
    }

    // 2. Assigner des enfants aux parents qui n'en ont pas
    console.log('\n👶 Création d\'enfants supplémentaires pour les parents...');
    
    // Créer quelques étudiants supplémentaires d'abord
    const schoolIds = await School.find().select('_id');
    if (schoolIds.length === 0) {
      console.log('❌ Pas d\'écoles disponibles pour créer des étudiants');
      return;
    }

    const classes = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère S', 'Terminale S'];
    const studentNames = [
      'Awa Diop', 'Moustapha Ba', 'Khady Ndiaye', 'Ibrahima Fall', 
      'Maimouna Sow', 'Omar Diallo', 'Astou Sarr', 'Mamadou Diouf',
      'Fanta Cisse', 'Youssou Ndour', 'Marieme Faye', 'Alassane Niang'
    ];

    // Créer 8 nouveaux étudiants
    const newStudents = [];
    for (let i = 0; i < 8; i++) {
      const randomSchool = schoolIds[Math.floor(Math.random() * schoolIds.length)];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const gender = Math.random() > 0.5 ? 'Masculin' : 'Féminin';
      
      const student = new User({
        name: studentNames[i],
        email: `etudiant${i+3}@daara.com`, // +3 car il y en a déjà 2
        role: 'student',
        gender: gender,
        class: randomClass,
        schoolId: randomSchool._id,
        password: 'password123' // Mot de passe temporaire
      });
      
      const savedStudent = await student.save();
      newStudents.push(savedStudent);
      console.log(`✅ Étudiant créé: ${student.name} (${gender}) - Classe: ${randomClass}`);
    }

    // 3. Assigner des enfants aux parents sans enfants
    const parentsWithoutChildren = await User.find({ role: 'parent', $or: [{ children: { $exists: false } }, { children: { $size: 0 } }] });
    const availableStudents = [...newStudents]; // Utiliser les nouveaux étudiants créés
    
    console.log(`\n👨‍👩‍👧‍👦 Assignation d'enfants à ${parentsWithoutChildren.length} parent(s)...`);
    
    for (const parent of parentsWithoutChildren) {
      if (availableStudents.length === 0) break;
      
      // Chaque parent aura 1 à 2 enfants
      const numberOfChildren = Math.floor(Math.random() * 2) + 1;
      const childrenIds = [];
      
      for (let i = 0; i < numberOfChildren && availableStudents.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        const student = availableStudents[randomIndex];
        
        // Retirer l'étudiant de la liste des disponibles
        availableStudents.splice(randomIndex, 1);
        
        // Ajouter l'ID de l'enfant au parent
        childrenIds.push(student._id);
      }
      
      // Mettre à jour le parent
      parent.children = childrenIds;
      await parent.save();
      
      console.log(`✅ ${parent.name} a maintenant ${childrenIds.length} enfant(s)`);
    }

    // 4. Vérification finale
    console.log('\n📊 Vérification finale...');
    
    const finalStats = {
      studentsWithClass: await User.countDocuments({ role: 'student', class: { $exists: true, $ne: '' } }),
      totalStudents: await User.countDocuments({ role: 'student' }),
      teachersWithSubjects: await User.countDocuments({ role: 'teacher', subjects: { $exists: true, $not: { $size: 0 } } }),
      totalTeachers: await User.countDocuments({ role: 'teacher' }),
      parentsWithChildren: await User.countDocuments({ role: 'parent', children: { $exists: true, $not: { $size: 0 } } }),
      totalParents: await User.countDocuments({ role: 'parent' }),
      parentsWithGender: await User.countDocuments({ role: 'parent', gender: { $exists: true, $ne: '' } }),
    };

    console.log(`🎓 Étudiants avec classe: ${finalStats.studentsWithClass}/${finalStats.totalStudents}`);
    console.log(`👩‍🏫 Enseignants avec matières: ${finalStats.teachersWithSubjects}/${finalStats.totalTeachers}`);
    console.log(`👨‍👩‍👧‍👦 Parents avec enfants: ${finalStats.parentsWithChildren}/${finalStats.totalParents}`);
    console.log(`👤 Parents avec genre: ${finalStats.parentsWithGender}/${finalStats.totalParents}`);

    // Afficher quelques exemples
    console.log('\n📋 Exemples de familles complètes:');
    const completeFamilies = await User.find({ role: 'parent', children: { $not: { $size: 0 } } }).populate('children', 'name class');
    
    completeFamilies.slice(0, 3).forEach((parent, i) => {
      const childInfo = parent.children.map(child => `${child.name} (${child.class})`).join(', ');
      console.log(`${i+1}. ${parent.name} (${parent.gender}) - Enfants: ${childInfo}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

completeUserData();