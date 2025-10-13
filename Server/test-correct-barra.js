require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Schedule = require('./models/Schedule');
const Class = require('./models/Class');
const jwt = require('jsonwebtoken');

async function testWithCorrectBarraFall() {
  try {
    console.log('🧪 TEST AVEC LE BON BARRA FALL');
    console.log('=============================\n');

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie\n');

    // Trouver le Barra Fall qui a des schedules
    const schedules = await Schedule.find({ isActive: true })
      .populate('teacherId', 'name email')
      .populate('classId', 'name level');

    const barraSchedule = schedules.find(s => 
      s.teacherId && s.teacherId.name === 'Barra Fall'
    );

    if (!barraSchedule) {
      console.log('❌ Aucun schedule actif trouvé pour Barra Fall');
      return;
    }

    const correctBarraFall = barraSchedule.teacherId;
    console.log(`✅ Barra Fall avec schedules trouvé:`);
    console.log(`   ID: ${correctBarraFall._id}`);
    console.log(`   Nom: ${correctBarraFall.name}`);
    console.log(`   Email: ${correctBarraFall.email}`);
    console.log(`   Classe assignée: ${barraSchedule.classId.name} (${barraSchedule.classId.level})`);

    // Générer un token avec le bon ID
    const tokenPayload = {
      userId: correctBarraFall._id,
      email: correctBarraFall.email,
      role: 'teacher',
      name: correctBarraFall.name
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('\n🔑 Token généré avec le bon ID:');
    console.log(`   Token: ${token.substring(0, 50)}...`);

    // Tester l'API
    console.log('\n📡 Test de l\'API /api/teachers/classes avec le bon token...');
    
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:5000/api/teachers/classes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log(`📊 Statut: ${response.status}`);
    console.log('📋 Réponse:', JSON.stringify(data, null, 2));

    if (data.success && data.data.length > 0) {
      console.log('\n✅ SUCCÈS! Barra Fall voit ses classes:');
      data.data.forEach((cls, index) => {
        console.log(`   ${index + 1}. ${cls.name} (${cls.level})`);
        console.log(`      Étudiants: ${cls.studentCount || 0}`);
        console.log(`      Source: ${cls.source}`);
      });
    } else {
      console.log('\n❌ Échec: Aucune classe trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testWithCorrectBarraFall();