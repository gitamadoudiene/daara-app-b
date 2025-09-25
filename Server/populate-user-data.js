const mongoose = require('mongoose');
const User = require('./models/User');

require('dotenv').config();

async function populateUserData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara');
    console.log('✅ Connexion à MongoDB réussie');

    // Listes de données pour peupler
    const classes = [
      'CP', 'CE1', 'CE2', 'CM1', 'CM2', // Primaire
      '6ème', '5ème', '4ème', '3ème', // Collège
      '2nde', '1ère S', '1ère L', 'Terminale S', 'Terminale L', // Lycée
      'L1', 'L2', 'L3', 'M1', 'M2' // Université
    ];

    const subjects = [
      'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie',
      'Sciences Physiques', 'SVT', 'Philosophie', 'EPS',
      'Arts Plastiques', 'Musique', 'Informatique', 'Économie',
      'Littérature', 'Chimie', 'Physique', 'Biologie'
    ];

    // 1. Mettre à jour les ÉTUDIANTS avec des classes
    const students = await User.find({ role: 'student' });
    console.log(`\n🎓 Mise à jour de ${students.length} étudiant(s)...`);
    
    for (const student of students) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      student.class = randomClass;
      
      // Ajouter un genre si manquant (requis pour les étudiants)
      if (!student.gender) {
        student.gender = Math.random() > 0.5 ? 'Masculin' : 'Féminin';
      }
      
      await student.save();
      console.log(`✅ ${student.name} (${student.gender}) assigné à la classe ${randomClass}`);
    }

    // 2. Mettre à jour les ENSEIGNANTS avec des matières
    const teachers = await User.find({ role: 'teacher' });
    console.log(`\n👩‍🏫 Mise à jour de ${teachers.length} enseignant(s)...`);
    
    for (const teacher of teachers) {
      // Chaque enseignant aura 1 à 3 matières
      const numberOfSubjects = Math.floor(Math.random() * 3) + 1;
      const teacherSubjects = [];
      const teacherClasses = [];
      
      // Sélectionner des matières aléatoires
      for (let i = 0; i < numberOfSubjects; i++) {
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        if (!teacherSubjects.includes(randomSubject)) {
          teacherSubjects.push(randomSubject);
        }
      }
      
      // Sélectionner 2-4 classes où l'enseignant enseigne
      const numberOfClasses = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numberOfClasses; i++) {
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        if (!teacherClasses.includes(randomClass)) {
          teacherClasses.push(randomClass);
        }
      }
      
      teacher.subjects = teacherSubjects;
      teacher.classes = teacherClasses;
      await teacher.save();
      
      console.log(`✅ ${teacher.name} enseigne ${teacherSubjects.join(', ')} dans les classes ${teacherClasses.join(', ')}`);
    }

    // 3. Créer des relations PARENT-ENFANT
    const parents = await User.find({ role: 'parent' });
    const studentsForParents = await User.find({ role: 'student', children: { $exists: false } });
    
    console.log(`\n👨‍👩‍👧‍👦 Création de relations parent-enfant...`);
    console.log(`${parents.length} parent(s) et ${studentsForParents.length} étudiant(s) disponibles`);
    
    let availableStudents = [...studentsForParents];
    
    for (const parent of parents) {
      if (availableStudents.length === 0) break;
      
      // Ajouter un genre si manquant (requis pour les parents)
      if (!parent.gender) {
        parent.gender = Math.random() > 0.5 ? 'Masculin' : 'Féminin';
      }
      
      // Chaque parent aura 1 à 3 enfants
      const numberOfChildren = Math.floor(Math.random() * 3) + 1;
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

    // 4. Vérification finale et statistiques
    console.log(`\n📊 Vérification finale...`);
    
    const studentsWithClasses = await User.countDocuments({ role: 'student', class: { $exists: true, $ne: '' } });
    const teachersWithSubjects = await User.countDocuments({ role: 'teacher', subjects: { $exists: true, $not: { $size: 0 } } });
    const parentsWithChildren = await User.countDocuments({ role: 'parent', children: { $exists: true, $not: { $size: 0 } } });
    
    console.log(`🎓 Étudiants avec classe: ${studentsWithClasses}/${students.length}`);
    console.log(`👩‍🏫 Enseignants avec matières: ${teachersWithSubjects}/${teachers.length}`);
    console.log(`👨‍👩‍👧‍👦 Parents avec enfants: ${parentsWithChildren}/${parents.length}`);

    // Afficher quelques exemples
    console.log(`\n📋 Exemples de données créées:`);
    
    const sampleStudent = await User.findOne({ role: 'student', class: { $ne: '' } });
    if (sampleStudent) {
      console.log(`🎓 Exemple étudiant: ${sampleStudent.name} - Classe: ${sampleStudent.class}`);
    }
    
    const sampleTeacher = await User.findOne({ role: 'teacher', subjects: { $not: { $size: 0 } } });
    if (sampleTeacher) {
      console.log(`👩‍🏫 Exemple enseignant: ${sampleTeacher.name} - Matières: ${sampleTeacher.subjects.join(', ')}`);
    }
    
    const sampleParent = await User.findOne({ role: 'parent', children: { $not: { $size: 0 } } }).populate('children', 'name');
    if (sampleParent) {
      const childNames = sampleParent.children.map(child => child.name).join(', ');
      console.log(`👨‍👩‍👧‍👦 Exemple parent: ${sampleParent.name} - Enfants: ${childNames}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnexion de MongoDB');
    process.exit(0);
  }
}

populateUserData();