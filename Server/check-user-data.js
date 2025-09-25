const mongoose = require('mongoose');
const User = require('./models/User');
const School = require('./models/School'); // Ajouter l'import du modèle School

require('dotenv').config();

async function checkUserData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // Vérifier chaque type d'utilisateur
    console.log('\n📊 Analyse détaillée des données utilisateur:\n');

    // 1. ÉTUDIANTS
    const students = await User.find({ role: 'student' });
    console.log(`🎓 ÉTUDIANTS (${students.length}):`);
    students.forEach((student, i) => {
      console.log(`  ${i+1}. ${student.name}:`);
      console.log(`     - Classe: "${student.class || 'VIDE'}"`);
      console.log(`     - École: ${student.schoolId ? 'OUI' : 'NON'}`);
      console.log(`     - Genre: "${student.gender || 'VIDE'}"`);
    });

    // 2. ENSEIGNANTS
    const teachers = await User.find({ role: 'teacher' });
    console.log(`\n👩‍🏫 ENSEIGNANTS (${teachers.length}):`);
    teachers.forEach((teacher, i) => {
      console.log(`  ${i+1}. ${teacher.name}:`);
      console.log(`     - Matières: [${teacher.subjects?.join(', ') || 'VIDE'}]`);
      console.log(`     - Classes enseignées: [${teacher.classes?.join(', ') || 'VIDE'}]`);
      console.log(`     - École: ${teacher.schoolId ? 'OUI' : 'NON'}`);
    });

    // 3. PARENTS
    const parents = await User.find({ role: 'parent' });
    console.log(`\n👨‍👩‍👧‍👦 PARENTS (${parents.length}):`);
    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      console.log(`  ${i+1}. ${parent.name}:`);
      console.log(`     - Nombre d'enfants: ${parent.children?.length || 0}`);
      console.log(`     - École: ${parent.schoolId ? 'OUI' : 'NON'}`);
      console.log(`     - Genre: "${parent.gender || 'VIDE'}"`);
    }

    // 4. ADMINISTRATEURS
    const admins = await User.find({ role: 'admin' });
    console.log(`\n👔 ADMINISTRATEURS (${admins.length}):`);
    admins.forEach((admin, i) => {
      console.log(`  ${i+1}. ${admin.name}:`);
      console.log(`     - École: ${admin.schoolId ? 'OUI' : 'NON'}`);
      console.log(`     - Rôle: ${admin.role}`);
    });

    // 5. SUPER USERS
    const superUsers = await User.find({ role: 'super_user' });
    console.log(`\n🔧 SUPER UTILISATEURS (${superUsers.length}):`);
    superUsers.forEach((superUser, i) => {
      console.log(`  ${i+1}. ${superUser.name}:`);
      console.log(`     - École: ${superUser.schoolId ? 'OUI' : 'NON'}`);
      console.log(`     - Rôle: ${superUser.role}`);
    });

    // 6. STATISTIQUES PROBLÉMATIQUES
    console.log(`\n❌ PROBLÈMES IDENTIFIÉS:`);
    
    const studentsWithoutClass = await User.countDocuments({ role: 'student', $or: [{ class: { $exists: false } }, { class: '' }] });
    const teachersWithoutSubjects = await User.countDocuments({ role: 'teacher', $or: [{ subjects: { $exists: false } }, { subjects: { $size: 0 } }] });
    const parentsWithoutChildren = await User.countDocuments({ role: 'parent', $or: [{ children: { $exists: false } }, { children: { $size: 0 } }] });
    
    if (studentsWithoutClass > 0) console.log(`  🎓 ${studentsWithoutClass} étudiant(s) sans classe`);
    if (teachersWithoutSubjects > 0) console.log(`  👩‍🏫 ${teachersWithoutSubjects} enseignant(s) sans matières`);
    if (parentsWithoutChildren > 0) console.log(`  👨‍👩‍👧‍👦 ${parentsWithoutChildren} parent(s) sans enfants`);

    // 7. TEST DE L'API EXACTE
    console.log(`\n🔍 TEST DE TRANSFORMATION FRONTEND:`);
    const allUsers = await User.find().populate('schoolId', 'name').select('-password');
    
    // Simuler la transformation exacte du frontend
    const mapRole = (role) => {
      const roleMap = {
        'student': 'Étudiant',
        'teacher': 'Enseignant', 
        'parent': 'Parent',
        'admin': 'Administrateur',
        'super_user': 'Super Utilisateur'
      };
      return roleMap[role] || role;
    };

    const problematicUsers = [];
    
    allUsers.forEach(user => {
      const transformed = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: mapRole(user.role),
        school: user.schoolId?.name || 'Non assigné',
        schoolId: user.schoolId?._id || '',
        status: user.status || 'Actif',
        subject: user.subjects?.join(', ') || '',
        class: user.class || '',
        children: Array.isArray(user.children) ? user.children.length : 0,
      };

      // Identifier les problèmes
      if (transformed.role === 'Étudiant' && !transformed.class) {
        problematicUsers.push(`${transformed.name} (Étudiant sans classe)`);
      }
      if (transformed.role === 'Enseignant' && !transformed.subject) {
        problematicUsers.push(`${transformed.name} (Enseignant sans matières)`);
      }
      if (transformed.role === 'Parent' && transformed.children === 0) {
        problematicUsers.push(`${transformed.name} (Parent sans enfants)`);
      }
    });

    if (problematicUsers.length > 0) {
      console.log(`\n🚨 UTILISATEURS PROBLÉMATIQUES (${problematicUsers.length}):`);
      problematicUsers.forEach((user, i) => {
        console.log(`  ${i+1}. ${user}`);
      });
    } else {
      console.log(`\n✅ Tous les utilisateurs ont des données complètes !`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

checkUserData();