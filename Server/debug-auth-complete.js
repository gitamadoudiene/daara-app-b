const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Class = require('./models/Class');
const Schedule = require('./models/Schedule');
const Subject = require('./models/Subject');

// Charger les variables d'environnement
require('dotenv').config();

console.log('🔧 DIAGNOSTIC COMPLET D\'AUTHENTIFICATION ET API');
console.log('================================================');

async function testAuthentication() {
  try {
    // 1. Connexion à la base de données
    console.log('\n1️⃣ CONNEXION BASE DE DONNÉES');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // 2. Vérifier JWT_SECRET
    console.log('\n2️⃣ VÉRIFICATION JWT_SECRET');
    console.log('JWT_SECRET défini:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET longueur:', process.env.JWT_SECRET?.length || 0);

    // 3. Chercher Barra Fall
    console.log('\n3️⃣ RECHERCHE UTILISATEUR BARRA FALL');
    const barraFall = await User.findOne({ email: 'barra.fall@lespedagogues.sn' }).populate('schoolId');
    if (!barraFall) {
      console.log('❌ Barra Fall introuvable');
      return;
    }
    console.log('✅ Barra Fall trouvé:');
    console.log('  - ID:', barraFall._id);
    console.log('  - Nom:', barraFall.name);
    console.log('  - Email:', barraFall.email);
    console.log('  - Rôle:', barraFall.role);
    console.log('  - École:', barraFall.schoolId?.name || 'N/A');

    // 4. Générer token JWT
    console.log('\n4️⃣ GÉNÉRATION TOKEN JWT');
    const tokenPayload = {
      userId: barraFall._id,
      email: barraFall.email,
      role: barraFall.role,
      name: barraFall.name,
      schoolId: barraFall.schoolId?._id
    };
    console.log('Payload du token:', tokenPayload);

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('✅ Token généré (premier 20 caractères):', token.substring(0, 20) + '...');

    // 5. Vérifier le token
    console.log('\n5️⃣ VÉRIFICATION TOKEN');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token valide');
      console.log('Payload décodé:', decoded);
    } catch (verifyError) {
      console.log('❌ Erreur de vérification token:', verifyError.message);
      return;
    }

    // 6. Test d'appel API direct (simulation middleware)
    console.log('\n6️⃣ SIMULATION MIDDLEWARE AUTH');
    const mockReq = {
      header: (name) => {
        if (name === 'Authorization') {
          return `Bearer ${token}`;
        }
        return null;
      },
      method: 'GET',
      originalUrl: '/api/teachers/classes'
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => console.log(`Response ${code}:`, data)
      })
    };

    // Simuler le middleware d'authentification
    const authHeader = mockReq.header('Authorization');
    let authToken = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7).trim();
      console.log('✓ Token extrait du header Authorization');
    } else {
      console.log('❌ Pas de token Bearer dans Authorization');
      return;
    }

    try {
      const decodedAuth = jwt.verify(authToken, process.env.JWT_SECRET);
      console.log('✅ Middleware auth réussi');
      console.log('User ID extrait:', decodedAuth.userId);
      
      // 7. Test récupération des classes
      console.log('\n7️⃣ TEST RÉCUPÉRATION CLASSES');
      
      // Méthode 1: Via Schedule
      console.log('\n📅 Méthode 1: Via Schedule');
      const schedules = await Schedule.find({ 
        teacher: decodedAuth.userId,
        isActive: true 
      })
      .populate('class', 'name level section studentCount')
      .populate('subject', 'name');
      
      console.log(`Nombre de créneaux trouvés: ${schedules.length}`);
      schedules.forEach((schedule, index) => {
        console.log(`  ${index + 1}. ${schedule.class?.name} - ${schedule.subject?.name}`);
      });

      // Extraire les classes uniques des schedules
      const classesFromSchedule = [...new Map(
        schedules
          .filter(s => s.class)
          .map(s => [s.class._id.toString(), s.class])
      ).values()];
      
      console.log(`Classes uniques via Schedule: ${classesFromSchedule.length}`);

      // Méthode 2: Via Class.teachers
      console.log('\n👥 Méthode 2: Via Class.teachers');
      const classesFromTeachers = await Class.find({
        teachers: decodedAuth.userId,
        isActive: true
      })
      .populate('schoolId', 'name')
      .populate('subjects', 'name');
      
      console.log(`Classes via teachers array: ${classesFromTeachers.length}`);
      classesFromTeachers.forEach((cls, index) => {
        console.log(`  ${index + 1}. ${cls.name} (${cls.level})`);
      });

      // Combiner les deux méthodes
      console.log('\n🔄 COMBINAISON DES MÉTHODES');
      const allClasses = new Map();
      
      // Ajouter les classes des schedules
      classesFromSchedule.forEach(cls => {
        allClasses.set(cls._id.toString(), {
          _id: cls._id,
          name: cls.name,
          level: cls.level,
          section: cls.section,
          studentCount: cls.studentCount || 0,
          source: 'schedule'
        });
      });
      
      // Ajouter les classes directes
      classesFromTeachers.forEach(cls => {
        const id = cls._id.toString();
        if (allClasses.has(id)) {
          allClasses.get(id).source = 'both';
        } else {
          allClasses.set(id, {
            _id: cls._id,
            name: cls.name,
            level: cls.level,
            section: cls.section,
            studentCount: cls.studentCount || 0,
            source: 'direct'
          });
        }
      });

      const finalClasses = Array.from(allClasses.values());
      console.log(`\n🎯 RÉSULTAT FINAL: ${finalClasses.length} classe(s)`);
      finalClasses.forEach((cls, index) => {
        console.log(`  ${index + 1}. ${cls.name} (${cls.level}) - Source: ${cls.source}`);
      });

      // 8. Test appel API réel
      console.log('\n8️⃣ TEST APPEL API RÉEL');
      const fetch = require('node-fetch');
      
      try {
        const response = await fetch('http://localhost:5000/api/teachers/classes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Status de réponse:', response.status);
        const responseData = await response.json();
        console.log('Données reçues:', JSON.stringify(responseData, null, 2));

        if (response.status === 200 && responseData.success) {
          console.log('✅ API fonctionne correctement !');
        } else {
          console.log('❌ Problème avec l\'API');
        }
      } catch (apiError) {
        console.log('❌ Erreur d\'appel API:', apiError.message);
      }

    } catch (authError) {
      console.log('❌ Erreur middleware auth:', authError.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le test
testAuthentication();