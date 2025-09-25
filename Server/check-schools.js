const mongoose = require('mongoose');
require('dotenv').config();
const School = require('./models/School');

async function checkSchools() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/daara', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const schools = await School.find({});
    console.log('=== TOUTES LES ÉCOLES ===\n');
    
    schools.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name}`);
      console.log(`   ID: ${school._id}`);
      console.log(`   Adresse: ${school.address}`);
      console.log(`   Téléphone: ${school.phone}`);
      console.log(`   Email: ${school.email}`);
      console.log(`   Active: ${school.isActive}`);
      console.log('   ---\n');
    });
    
    console.log(`Total: ${schools.length} écoles`);

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkSchools();