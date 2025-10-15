require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

async function testEndpoints() {
  try {
    console.log('🧪 TEST DES ENDPOINTS');
    console.log('===================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // Trouver un admin pour générer un token valide
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Aucun admin trouvé');
      return;
    }

    console.log(`✅ Admin trouvé: ${admin.name} (${admin.email})`);

    // Générer un token valide
    const tokenPayload = {
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      name: admin.name
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(`🔑 Token généré: ${token.substring(0, 30)}...`);

    // Test endpoint classes
    console.log('\n📚 Test /api/classes/school/68c7700cd9f7c4207d3c9ea6...');
    try {
      const response = await fetch('http://localhost:5000/api/classes/school/68c7700cd9f7c4207d3c9ea6', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📊 Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Classes trouvées: ${data.length}`);
        data.forEach((cls, i) => {
          console.log(`   ${i + 1}. ${cls.name} (${cls.level})`);
        });
      } else {
        const error = await response.json();
        console.log('❌ Erreur:', error);
      }
    } catch (err) {
      console.log('❌ Erreur fetch classes:', err.message);
    }

    // Test endpoint subjects
    console.log('\n📖 Test /api/subjects/school/68c7700cd9f7c4207d3c9ea6...');
    try {
      const response = await fetch('http://localhost:5000/api/subjects/school/68c7700cd9f7c4207d3c9ea6', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📊 Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Matières trouvées: ${data.length}`);
        data.forEach((subject, i) => {
          console.log(`   ${i + 1}. ${subject.name} (${subject.code})`);
        });
      } else {
        const error = await response.json();
        console.log('❌ Erreur:', error);
      }
    } catch (err) {
      console.log('❌ Erreur fetch subjects:', err.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testEndpoints();