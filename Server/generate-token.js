const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

async function createTestToken() {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    
    // Trouver un utilisateur admin ou superuser
    const admin = await User.findOne({ role: { $in: ['admin', 'superuser'] } });
    
    if (!admin) {
      console.log('❌ Aucun admin trouvé');
      process.exit(1);
    }
    
    console.log(`👤 Utilisateur trouvé: ${admin.name || admin.firstName + ' ' + admin.lastName} (${admin.role})`);
    
    // Générer un token
    const token = jwt.sign(
      { 
        userId: admin._id, 
        role: admin.role,
        schoolId: admin.schoolId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log(`🔑 Token généré: ${token}`);
    console.log('\n📋 Utilisez ce token pour tester l\'API:');
    console.log(`Authorization: Bearer ${token}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createTestToken();