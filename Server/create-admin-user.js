const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');
const School = require('./models/School');

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daara', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB établie');

    // Créer une école test
    const school = new School({
      name: 'École Primaire Al-Amin',
      address: '123 Rue de la République, Dakar',
      phone: '+221 33 123 45 67',
      email: 'contact@alamin.sn',
      isActive: true
    });
    await school.save();
    console.log('✅ École créée:', school.name);

    // Vérifier si l'utilisateur administrateur existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@alamin.sn' });
    if (existingAdmin) {
      console.log('❌ Un administrateur avec cet email existe déjà');
      await mongoose.connection.close();
      return;
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Créer l'utilisateur administrateur
    const adminUser = new User({
      name: 'Abdoulaye Diop',
      email: 'admin@alamin.sn',
      password: hashedPassword,
      role: 'admin',
      schoolId: school._id,
      status: 'Actif'
    });

    await adminUser.save();
    console.log('✅ Utilisateur administrateur créé avec succès');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Mot de passe: admin123');
    console.log('🏫 École:', school.name);
    console.log('📍 ID École:', school._id);

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

createAdminUser();