const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté');

    // Chercher l'admin existant ou le créer
    let admin = await User.findOne({ email: 'admin@lespedagogues.com' });
    
    if (admin) {
      console.log('📝 Admin trouvé, mise à jour...');
      admin.schoolId = '68c7700cd9f7c4207d3c9ea6';
      await admin.save();
      console.log('✅ SchoolId assigné');
    } else {
      console.log('🆕 Création nouvel admin...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      admin = new User({
        name: 'Admin Pedagogues',
        email: 'admin@lespedagogues.com',
        password: hashedPassword,
        role: 'admin',
        schoolId: '68c7700cd9f7c4207d3c9ea6',
        isActive: true
      });
      
      await admin.save();
      console.log('✅ Admin créé');
    }

    console.log('📊 Résultat:');
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - SchoolId: ${admin.schoolId}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixAdmin();