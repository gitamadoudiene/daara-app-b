const mongoose = require('mongoose');
const Class = require('./models/Class');
const User = require('./models/User');

// Utiliser la même URI que le serveur
require('dotenv').config();

async function testRealDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/daara_app';
    console.log('🔗 Connexion à:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Masquer les credentials
    
    await mongoose.connect(uri);
    console.log('✅ Connexion réussie');
    
    // Test spécifique de l'utilisateur
    const teacherId = '68c8a6f80890d821353ed1c9';
    const teacher = await User.findById(teacherId);
    
    if (teacher) {
      console.log('👨‍🏫 Enseignant trouvé:');
      console.log(`   - ID: ${teacher._id}`);
      console.log(`   - Name: ${teacher.name || 'undefined'}`);
      console.log(`   - FirstName: ${teacher.firstName || 'undefined'}`);
      console.log(`   - LastName: ${teacher.lastName || 'undefined'}`);
      console.log(`   - Role: ${teacher.role}`);
    } else {
      console.log('❌ Enseignant non trouvé avec ID:', teacherId);
    }
    
    // Test des classes avec population
    const classes = await Class.find()
      .populate('resTeacher', 'firstName lastName name email')
      .limit(3);
    
    console.log('\n📚 Classes avec enseignant:');
    classes.forEach(c => {
      if (c.resTeacher) {
        const teacherName = c.resTeacher.name || 
          `${c.resTeacher.firstName || ''} ${c.resTeacher.lastName || ''}`.trim();
        console.log(`   - ${c.name}: ${teacherName}`);
      } else {
        console.log(`   - ${c.name}: Non assigné`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testRealDB();