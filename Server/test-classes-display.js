const mongoose = require('mongoose');
const Class = require('./models/Class');

async function testClassesDisplay() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara_app');
    console.log('📊 Connexion MongoDB réussie');
    
    const classes = await Class.find()
      .populate('resTeacher', 'firstName lastName')
      .limit(5);
    
    console.log('\n📋 Classes avec enseignant responsable:');
    classes.forEach(c => {
      const teacherName = c.resTeacher 
        ? `${c.resTeacher.firstName} ${c.resTeacher.lastName}`.trim()
        : 'Non assigné';
      console.log(`  - ${c.name}: ${teacherName}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testClassesDisplay();