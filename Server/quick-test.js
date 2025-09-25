const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');

async function debugDatabase() {
  await mongoose.connect('mongodb://localhost:27017/daara_app');
  
  // Voir toutes les collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections disponibles:');
  collections.forEach(c => console.log('- ' + c.name));
  
  // Voir tous les documents dans la collection users
  const allUsers = await User.find({});
  console.log('\nTous les utilisateurs dans la collection:');
  allUsers.forEach(u => {
    console.log(`- ${u._id}: ${u.name || (u.firstName + ' ' + u.lastName)} - ${u.role}`);
  });
  
  // Chercher par email
  const userByEmail = await User.findOne({ email: 'cheikh@ecole.com' });
  console.log('\nUser trouvé par email:', userByEmail?._id);
  
  // Voir toutes les classes
  const allClasses = await Class.find({});
  console.log('\nClasses:', allClasses.length);
  allClasses.forEach(c => {
    console.log(`- ${c.name}: resTeacher = ${c.resTeacher}`);
  });
  
  process.exit(0);
}

debugDatabase().catch(console.error);