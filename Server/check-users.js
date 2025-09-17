const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const School = require('./models/School'); // Ajout de l'import

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find({}).populate('schoolId');
    console.log('=== TOUS LES UTILISATEURS ===\n');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   École: ${user.schoolId ? user.schoolId.name : 'Aucune école assignée'}`);
      console.log(`   Status: ${user.status || 'Non défini'}`);
      console.log('   ---\n');
    });
    
    console.log(`Total: ${users.length} utilisateurs`);
    
    // Filtrer les administrateurs
    const admins = users.filter(user => user.role === 'admin');
    console.log(`\n=== ADMINISTRATEURS (${admins.length}) ===`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      console.log(`   École: ${admin.schoolId ? admin.schoolId.name : 'Aucune école'}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUsers();