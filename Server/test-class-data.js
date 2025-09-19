const mongoose = require('mongoose');
const Class = require('./models/Class');

async function testClassData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/daara_app');
    console.log('📊 Connexion MongoDB réussie');
    
    const classes = await Class.find()
      .populate('resTeacher', 'firstName lastName name email')
      .limit(3);
    
    console.log('\n📋 Test des données de classes:');
    classes.forEach(c => {
      console.log(`\n🔍 Classe: ${c.name}`);
      console.log(`   - resTeacher ID: ${c.resTeacher || 'null'}`);
      if (c.resTeacher) {
        console.log(`   - resTeacher populated: ${JSON.stringify(c.resTeacher, null, 2)}`);
        console.log(`   - firstName: ${c.resTeacher.firstName || 'undefined'}`);
        console.log(`   - lastName: ${c.resTeacher.lastName || 'undefined'}`);
        console.log(`   - name: ${c.resTeacher.name || 'undefined'}`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

testClassData();